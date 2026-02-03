import { getGroupedHomeworkPageDataAction } from "@/actions/section-record";
import { HomeworkClient } from "./_components/homework-client";

interface HomeworkPageProps {
  params: Promise<{ pid: string }>;
}

const HomeworkPage = async ({ params }: HomeworkPageProps) => {
  const { pid: programId } = await params;

  // 서버에서 초기 데이터 페칭 (grouped data)
  const result = await getGroupedHomeworkPageDataAction(programId);

  const initialData = result.success ? result.data ?? null : null;

  return <HomeworkClient programId={programId} initialData={initialData} />;
};

export default HomeworkPage;
