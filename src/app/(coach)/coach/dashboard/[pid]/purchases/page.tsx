import OrderListTab from "@/app/(coach)/coach/dashboard/[pid]/_components/order-list-tab";

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

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">구매 목록</h1>
        <p className="text-muted-foreground">
          프로그램 구매 내역을 조회하고 관리하세요.
        </p>
      </div>

      <OrderListTab programId={pid} />
    </div>
  );
}
