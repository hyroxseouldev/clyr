import { getMyProgramsAction } from "@/actions";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ArrowUpRightIcon, FolderCodeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * 코치가 로그인 했을 때 처음으로 마주하는 페이지 입니다.
 * 코치가 등록한 프로그램 목록을 조회하고 출력합니다. 만약 프로그램이 없다면 빈 상태를 출력합니다.
 * 프로그램이 있다면 프로그램 목록을 출력합니다.
 * 프로그램 목록을 클릭하면 프로그램 상세 페이지로 이동합니다. [pid]
 * 로그아웃 버튼을 클릭하면 로그아웃 됩니다.
 * 프로그램 등록 버튼을 클릭하면 프로그램 등록 페이지로 이동합니다. [new]
 */
export default async function CoachDashboardPage() {
  // fetch program server action
  const { data: programs } = await getMyProgramsAction();

  return (
    <div>
      <h1>Coach Dashboard</h1>
      {programs && programs.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderCodeIcon />
            </EmptyMedia>
            <EmptyTitle>No Projects Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t created any projects yet. Get started by creating
              your first project.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button>Create Project</Button>
              <Button variant="outline">Import Project</Button>
            </div>
          </EmptyContent>
          <Button
            variant="link"
            asChild
            className="text-muted-foreground"
            size="sm"
          >
            <a href="#">
              Learn More <ArrowUpRightIcon />
            </a>
          </Button>
        </Empty>
      )}
      {programs && programs.length > 0 && (
        <div>
          {programs.map((program) => (
            <div key={program.id}>{program.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}
