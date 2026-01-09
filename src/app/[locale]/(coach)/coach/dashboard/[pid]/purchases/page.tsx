import { getProgramMonthlySalesAction, getProgramOrdersWithPaginationAction } from "@/actions/order";
import MonthlySalesChart from "@/app/[locale]/(coach)/coach/dashboard/[pid]/_components/monthly-sales-chart";
import OrderList from "@/app/[locale]/(coach)/coach/dashboard/[pid]/_components/order-list";
import { Spinner } from "@/components/ui/spinner";

/**
 * 프로그램 주문/매출 관리 페이지
 * - 상단: 월별 매출 차트
 * - 하단: 주문 내역 리스트 (페이지네이션 20개씩)
 */
export default async function ProgramPurchasesPage({
  params,
  searchParams,
}: {
  params: Promise<{ pid: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { pid } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  // 데이터 페칭 (병렬 실행)
  const [monthlySalesResult, ordersResult] = await Promise.all([
    getProgramMonthlySalesAction(pid),
    getProgramOrdersWithPaginationAction(pid, currentPage),
  ]);

  const monthlySales = monthlySalesResult.success ? (monthlySalesResult.data ?? []) : [];
  const orders = ordersResult.success ? ordersResult.data?.orders || [] : [];
  const pagination = ordersResult.success && ordersResult.data?.pagination
    ? ordersResult.data.pagination
    : {
        page: currentPage,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      };

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">판매 관리</h1>
        <p className="text-muted-foreground">
          프로그램 판매 현황과 주문 내역을 확인할 수 있습니다.
        </p>
      </div>

      {/* 에러 상태 */}
      {(!monthlySalesResult.success || !ordersResult.success) && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            데이터를 불러오는데 실패했습니다. 다시 시도해주세요.
          </p>
        </div>
      )}

      {/* 월별 매출 차트 */}
      <section>
        <h2 className="text-lg font-semibold mb-4">매출 현황</h2>
        <MonthlySalesChart data={monthlySales} />
      </section>

      {/* 주문 내역 리스트 */}
      <section>
        <OrderList
          initialOrders={orders}
          initialPagination={pagination}
          programId={pid}
        />
      </section>
    </div>
  );
}
