import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DumbbellIcon } from "lucide-react";

/**
 * 프로그램 워크아웃 관리 페이지
 * 워크아웃 루틴을 관리하고 수정할 수 있습니다.
 */
export default async function ProgramWorkoutsPage({
  params,
}: {
  params: Promise<{ pid: string }>;
}) {
  const { pid } = await params;

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">워크아웃 관리</h1>
        <p className="text-muted-foreground">
          프로그램의 워크아웃 루틴을 구성하고 관리하세요.
        </p>
      </div>

      {/* 워크아웃 목록 카드 */}
      <Card>
        <CardHeader>
          <DumbbellIcon className="size-8 mb-2 text-muted-foreground" />
          <CardTitle>워크아웃 목록</CardTitle>
          <CardDescription>
            이 프로그램에 포함된 워크아웃 루틴을 확인하고 관리하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <DumbbellIcon className="size-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">워크아웃 준비 중</h3>
            <p className="text-muted-foreground max-w-md">
              워크아웃 관리 기능을 준비 중입니다. 곧 다양한 워크아웃 관리 기능을 제공할 예정입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
