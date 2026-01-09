import { getRoutineBlocksAction } from "@/actions/routine-block";
import { RoutineBlockList } from "./_components/routine-block-list";

const PAGE_SIZE = 20;

const WorkoutRoutinePage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ pid: string }>;
  searchParams: Promise<{ page?: string; search?: string; format?: string }>;
}) => {
  const { page, search, format } = await searchParams;
  const newPage = parseInt(page || "1", 10);
  const newFormat = format === "all" ? undefined : format;

  const result = await getRoutineBlocksAction({
    page: newPage,
    pageSize: PAGE_SIZE,
    search,
    format: newFormat,
  });

  const initialData = result.success && result.data ? result.data : null;

  return (
    <RoutineBlockList
      initialData={initialData}
      pageSize={PAGE_SIZE}
    />
  );
};

export default WorkoutRoutinePage;
