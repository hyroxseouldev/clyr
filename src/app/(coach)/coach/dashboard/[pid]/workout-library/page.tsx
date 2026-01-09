import { getWorkoutLibraryAction, getWorkoutLibraryFiltersAction } from "@/actions/workoutLibrary";
import { WorkoutLibraryClient } from "./_components/workout-library-client";

const PAGE_SIZE = 20;

const WorkoutLibraryPage = async ({
  params,
  searchParams,
}: {
  params: { pid: string };
  searchParams: { page?: string; search?: string; categories?: string; workoutTypes?: string };
}) => {
  const { page, search, categories, workoutTypes } = await searchParams;
  const newPage = parseInt(page || "1", 10);
  const newSearch = search;

  // 필터 파싱 (쉼표로 구분된 문자열을 배열로 변환)
  const parsedCategories = categories ? categories.split(",").filter(Boolean) : undefined;
  const parsedWorkoutTypes = workoutTypes ? workoutTypes.split(",").filter(Boolean) : undefined;

  // 데이터 병렬 조회
  const [libraryResult, filtersResult] = await Promise.all([
    getWorkoutLibraryAction({
      page: newPage,
      pageSize: PAGE_SIZE,
      search: newSearch,
      categories: parsedCategories,
      workoutTypes: parsedWorkoutTypes,
    }),
    getWorkoutLibraryFiltersAction(),
  ]);

  const initialData = libraryResult.success && libraryResult.data ? libraryResult.data : null;
  const filtersData = filtersResult.success && filtersResult.data ? filtersResult.data : { categories: [], workoutTypes: [] };

  return (
    <WorkoutLibraryClient
      initialData={initialData}
      filtersData={filtersData}
      pageSize={PAGE_SIZE}
    />
  );
};

export default WorkoutLibraryPage;
