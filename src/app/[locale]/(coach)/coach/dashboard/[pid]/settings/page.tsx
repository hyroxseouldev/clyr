import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings2Icon,
  PencilIcon,
  TrashIcon,
  DollarSignIcon,
} from "lucide-react";
import SettingTab from "@/app/[locale]/(coach)/coach/dashboard/[pid]/_components/setting-tab";
import { getProgramByIdAction } from "@/actions";
import { getTranslations } from "next-intl/server";

/**
 * 프로그램 설정 페이지
 * 프로그램의 기본 정보, 가격, 공개 여부 등을 설정할 수 있습니다.
 */
export default async function ProgramSettingsPage({
  params,
}: {
  params: Promise<{ pid: string }>;
}) {
  const { pid } = await params;
  const t = await getTranslations('settings');

  const { data: program } = await getProgramByIdAction(pid);

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* 설정 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 기본 정보 설정 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <PencilIcon className="size-8 mb-2 text-primary" />
            <CardTitle>{t('basicInfo')}</CardTitle>
            <CardDescription>
              {t('basicInfoDesc')}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 가격 설정 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <DollarSignIcon className="size-8 mb-2 text-primary" />
            <CardTitle>{t('priceSettings')}</CardTitle>
            <CardDescription>
              {t('priceSettingsDesc')}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 프로그램 관리 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <Settings2Icon className="size-8 mb-2 text-primary" />
            <CardTitle>{t('programManagement')}</CardTitle>
            <CardDescription>
              {t('programManagementDesc')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* 준비 중 메시지 */}
      <Card>
        <CardHeader>
          <Settings2Icon className="size-8 mb-2 text-muted-foreground" />
          <CardTitle>{t('comingSoon')}</CardTitle>
          <CardDescription>
            {t('comingSoonDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('featuresComingSoon')}
          </p>
        </CardContent>
      </Card>

      {program && <SettingTab programId={pid} program={program} />}
    </div>
  );
}
