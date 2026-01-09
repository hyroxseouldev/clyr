import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2Icon, UserIcon, BellIcon, ShieldIcon } from "lucide-react";

/**
 * 코치의 설정 페이지
 * 계정 설정, 알림 설정 등을 관리할 수 있습니다.
 */
export default async function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">설정</h1>
          <p className="text-muted-foreground">계정 및 애플리케이션 설정을 관리하세요.</p>
        </div>
      </div>

      {/* 설정 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 프로필 설정 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <UserIcon className="size-8 mb-2 text-primary" />
            <CardTitle>프로필</CardTitle>
            <CardDescription>
              이름, 이메일, 프로필 사진을 관리하세요.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 알림 설정 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <BellIcon className="size-8 mb-2 text-primary" />
            <CardTitle>알림</CardTitle>
            <CardDescription>
              이메일 및 푸시 알림 설정을 관리하세요.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 보안 설정 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <ShieldIcon className="size-8 mb-2 text-primary" />
            <CardTitle>보안</CardTitle>
            <CardDescription>
              비밀번호 변경 및 2단계 인증을 설정하세요.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* 준비 중 메시지 */}
      <Card>
        <CardHeader>
          <Settings2Icon className="size-8 mb-2 text-muted-foreground" />
          <CardTitle>설정 기능 준비 중</CardTitle>
          <CardDescription>
            다양한 설정 기능을 준비 중입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            프로필 수정, 알림 설정, 보안 설정 등의 기능이 곧 추가될 예정입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
