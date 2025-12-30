import { getMyProgramsAction } from "@/actions";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { FolderCodeIcon, ArrowUpRightIcon, PlusIcon } from "lucide-react";
import { ProgramCard } from "./components";
import Link from "next/link";

/**
 * 코치가 로그인 했을 때 처음으로 마주하는 페이지 입니다.
 * 코치가 등록한 프로그램 목록을 조회하고 출력합니다. 만약 프로그램이 없다면 빈 상태를 출력합니다.
 * 프로그램이 있다면 프로그램 목록을 출력합니다.
 * 프로그램 목록을 클릭하면 프로그램 상세 페이지로 이동합니다. [pid]
 * 로그아웃 버튼을 클릭하면 로그아웃 됩니다.
 * 프로그램 등록 버튼을 클릭하면 프로그램 등록 페이지로 이동합니다. [new]
 */
export default async function CoachDashboardPage() {
  const { data: programs } = await getMyProgramsAction();

  return (
    <>
      {/* 프로그램 없는 경우 */}
      {programs && programs.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderCodeIcon className="size-12" />
            </EmptyMedia>
            <EmptyTitle>등록된 프로그램이 없습니다</EmptyTitle>
            <EmptyDescription>
              아직 프로그램을 만들지 않으셨네요. 첫 번째 프로그램을
              만들어보세요!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/coach/dashboard/new">
                  <PlusIcon className="mr-2 size-4" />
                  프로그램 만들기
                </Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      )}

      {/* 프로그램 목록 */}
      {programs && programs.length > 0 && (
        <div className="space-y-6 h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              내 프로그램{" "}
              <span className="text-muted-foreground">({programs.length})</span>
            </h2>
            <Button asChild>
              <Link href="/coach/dashboard/new">
                <PlusIcon className="mr-2 size-4" />새 프로그램
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 mt-4 grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
