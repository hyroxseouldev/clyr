import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon } from "lucide-react";

/**
 * 코치의 회원 관리 페이지
 * 전체 회원 목록을 보여주고 관리할 수 있습니다.
 */
export default async function MembersPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">회원 관리</h1>
          <p className="text-muted-foreground">모든 회원을 조회하고 관리하세요.</p>
        </div>
      </div>

      {/* 회원 목록 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-5" />
            회원 목록
          </CardTitle>
          <CardDescription>
            현재 등록된 모든 회원을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UsersIcon className="size-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">회원 목록 준비 중</h3>
            <p className="text-muted-foreground max-w-md">
              회원 관리 기능을 준비 중입니다. 곧 다양한 회원 관리 기능을 제공할 예정입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
