import { getWorkoutLibraryAction } from "@/actions/workoutLibrary";
import { WorkoutLibraryClient } from "./_components/workout-library-client";

const PAGE_SIZE = 20;

const WorkoutLibraryPage = async ({
  params,
  searchParams,
}: {
  params: { pid: string };
  searchParams: { page?: string; search?: string };
}) => {
  const page = parseInt(searchParams.page || "1", 10);
  const search = searchParams.search;

  const result = await getWorkoutLibraryAction({
    page,
    pageSize: PAGE_SIZE,
    search,
  });

  const initialData = result.success && result.data ? result.data : null;

  return (
    <WorkoutLibraryClient
      initialData={initialData}
      pageSize={PAGE_SIZE}
    />
  );
};

export default WorkoutLibraryPage;
