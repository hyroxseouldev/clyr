import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * 프로그램 회원 목록 페이지
 * 프로그램에 참여중인 회원들을 조회하고 관리할 수 있습니다.
 */
export default async function ProgramMembersPage({
  params,
}: {
  params: Promise<{ pid: string }>;
}) {
  const { pid } = await params;

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">회원 목록</h1>
          <p className="text-muted-foreground">
            프로그램에 참여중인 회원들을 조회하고 관리하세요.
          </p>
        </div>
      </div>

      {/* 회원 목록 카드 */}
      <Card>
        <CardHeader>
          <UsersIcon className="size-8 mb-2 text-muted-foreground" />
          <CardTitle>참여 회원</CardTitle>
          <CardDescription>
            이 프로그램에 참여하고 있는 모든 회원을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UsersIcon className="size-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">회원 목록 준비 중</h3>
            <p className="text-muted-foreground max-w-md mb-4">
              회원 관리 기능을 준비 중입니다. 곧 다양한 회원 관리 기능을 제공할 예정입니다.
            </p>
            <Button asChild variant="outline">
              <Link href={`/coach/dashboard/${pid}/members`}>상세보기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
