import WorkoutTab from "@/app/(coach)/coach/dashboard/[pid]/_components/workout-tab";
import { getFullProgramContentAction } from "@/actions/workout";

/**
 * 프로그램 워크아웃 관리 페이지
 * 워크아웃 루틴을 관리하고 수정할 수 있습니다.
 */
export default async function ProgramWorkoutsPage({
  params,
}: {
  params: Promise<{ pid: string }>;
}) {
  const { pid } = await params;

  // 데이터 페칭
  const result = await getFullProgramContentAction(pid);
  const initialData = result.success && "data" in result && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">워크아웃 관리</h1>
        <p className="text-muted-foreground">
          프로그램의 워크아웃 루틴을 구성하고 관리하세요.
        </p>
      </div>

      <WorkoutTab programId={pid} initialData={initialData} />
    </div>
  );
}
