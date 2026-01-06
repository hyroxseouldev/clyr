import OrderListTab from "@/app/(coach)/coach/dashboard/[pid]/_components/order-list-tab";
import { getProgramOrdersAndEnrollmentsAction } from "@/actions/order";

/**
 * 프로그램 구매 목록 페이지
 * 프로그램 구매 내역을 조회하고 관리할 수 있습니다.
 */
export default async function ProgramPurchasesPage({
  params,
}: {
  params: Promise<{ pid: string }>;
}) {
  const { pid } = await params;

  // 데이터 페칭
  const result = await getProgramOrdersAndEnrollmentsAction(pid);
  const initialData = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">구매 목록</h1>
        <p className="text-muted-foreground">
          {`총 ${initialData.length}명의 수강생이 있습니다`}
        </p>
      </div>

      <OrderListTab programId={pid} initialData={initialData} />
    </div>
  );
}
