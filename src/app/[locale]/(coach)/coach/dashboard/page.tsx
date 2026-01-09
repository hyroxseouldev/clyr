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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderCodeIcon, PlusIcon, UsersIcon, PackageIcon } from "lucide-react";
import { ProgramCard } from "@/components/program/program-card";
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
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">프로그램을 관리하고 회원을 확인하세요.</p>
        </div>
        <Button asChild size="default">
          <Link href="/coach/dashboard/new">
            <PlusIcon className="mr-2 size-4" />
            새 프로그램
          </Link>
        </Button>
      </div>

      {/* 프로그램 없는 경우 */}
      {programs && programs.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderCodeIcon className="size-12" />
                </EmptyMedia>
                <EmptyTitle>등록된 프로그램이 없습니다</EmptyTitle>
                <EmptyDescription>
                  아직 프로그램을 만들지 않으셨네요. 첫 번째 프로그램을 만들어보세요!
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link href="/coach/dashboard/new">
                    <PlusIcon className="mr-2 size-4" />
                    프로그램 만들기
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      )}

      {/* 프로그램 목록 */}
      {programs && programs.length > 0 && (
        <>
          {/* 통계 카드 */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">총 프로그램</CardTitle>
                <PackageIcon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{programs.length}</div>
                <p className="text-xs text-muted-foreground">활성 프로그램</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">구독형 프로그램</CardTitle>
                <UsersIcon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {programs.filter((p) => p.type === "SUBSCRIPTION").length}
                </div>
                <p className="text-xs text-muted-foreground">월 구독</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">단건 프로그램</CardTitle>
                <PackageIcon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {programs.filter((p) => p.type === "SINGLE").length}
                </div>
                <p className="text-xs text-muted-foreground">1회 구매</p>
              </CardContent>
            </Card>
          </div>

          {/* 프로그램 목록 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                내 프로그램{" "}
                <span className="text-muted-foreground">({programs.length})</span>
              </h2>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
