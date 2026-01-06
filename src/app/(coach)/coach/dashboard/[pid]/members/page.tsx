import MembersListTab from "@/app/(coach)/coach/dashboard/[pid]/_components/members-list-tab";
/**
 * 프로그램 회원 목록 페이지
 * 프로그램에 참여중인 회원들을 조회하고 관리할 수 있습니다.
 */
export default async function ProgramMembersPage({
  params,
}: {
  params: Promise<{ pid: string }>;
}) {
  const { pid } = await params;

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">회원 목록</h1>
          <p className="text-muted-foreground">
            프로그램에 참여중인 회원들을 조회하고 관리하세요.
          </p>
        </div>
      </div>

      <MembersListTab programId={pid} />
    </div>
  );
}
