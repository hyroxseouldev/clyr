import { getRoutineBlocksAction } from "@/actions/routineBlock";
import { WorkoutRoutineClient } from "./_components/workout-routine-client";

const PAGE_SIZE = 20;

const WorkoutRoutinePage = async ({
  params,
  searchParams,
}: {
  params: { pid: string };
  searchParams: { page?: string; search?: string; format?: string };
}) => {
  const page = parseInt(searchParams.page || "1", 10);
  const search = searchParams.search;
  const format = searchParams.format === "all" ? undefined : searchParams.format;

  const result = await getRoutineBlocksAction({
    page,
    pageSize: PAGE_SIZE,
    search,
    format,
  });

  const initialData = result.success && result.data ? result.data : null;

  return (
    <WorkoutRoutineClient
      initialData={initialData}
      pageSize={PAGE_SIZE}
    />
  );
};

export default WorkoutRoutinePage;
