import { getHomeworkPageDataAction } from "@/actions/workoutLog";
import { HomeworkClient } from "./_components/homework-client";

interface HomeworkPageProps {
  params: Promise<{ pid: string }>;
}

const HomeworkPage = async ({ params }: HomeworkPageProps) => {
  const { pid: programId } = await params;

  // 서버에서 초기 데이터 페칭
  const result = await getHomeworkPageDataAction(programId);

  const initialData = result.success ? result.data ?? null : null;

  return <HomeworkClient programId={programId} initialData={initialData} />;
};

export default HomeworkPage;
