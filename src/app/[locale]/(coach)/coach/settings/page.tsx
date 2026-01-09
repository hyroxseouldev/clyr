import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings2Icon, UserIcon, BellIcon, ShieldIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
/**
 * 코치의 설정 페이지
 * 계정 설정, 알림 설정 등을 관리할 수 있습니다.
 */
export default async function SettingsPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale, namespace: "settings" });
  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("pageDescription")}</p>
        </div>
      </div>

      {/* 설정 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 프로필 설정 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <UserIcon className="size-8 mb-2 text-primary" />
            <CardTitle>{t("profile")}</CardTitle>
            <CardDescription>{t("profileDesc")}</CardDescription>
          </CardHeader>
        </Card>

        {/* 알림 설정 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <BellIcon className="size-8 mb-2 text-primary" />
            <CardTitle>{t("notifications")}</CardTitle>
            <CardDescription>{t("notificationsDesc")}</CardDescription>
          </CardHeader>
        </Card>

        {/* 보안 설정 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <ShieldIcon className="size-8 mb-2 text-primary" />
            <CardTitle>{t("security")}</CardTitle>
            <CardDescription>{t("securityDesc")}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* 준비 중 메시지 */}
      <Card>
        <CardHeader>
          <Settings2Icon className="size-8 mb-2 text-muted-foreground" />
          <CardTitle>{t("comingSoonTitle")}</CardTitle>
          <CardDescription>{t("comingSoonDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("comingSoonMessage")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
