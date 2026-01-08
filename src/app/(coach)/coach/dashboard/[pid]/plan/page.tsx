import { getProgramPlanDataAction } from "@/actions/programBlueprint";
import { PlanClient } from "./_components/plan-client";

interface PlanPageProps {
  params: Promise<{ pid: string }>;
}

const PlanPage = async ({ params }: PlanPageProps) => {
  const { pid: programId } = await params;

  // 서버에서 데이터 페칭
  const result = await getProgramPlanDataAction(programId);

  const initialData = result.success ? result.data ?? null : null;

  return <PlanClient programId={programId} initialData={initialData} />;
};

export default PlanPage;
