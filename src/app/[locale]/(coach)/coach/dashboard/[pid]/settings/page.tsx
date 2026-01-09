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

  const { data: program } = await getProgramByIdAction(pid);

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">프로그램 설정</h1>
        <p className="text-muted-foreground">
          프로그램의 세부 설정을 관리하세요.
        </p>
      </div>

      {/* 설정 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 기본 정보 설정 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <PencilIcon className="size-8 mb-2 text-primary" />
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>
              제목, 설명, 썸네일 이미지를 수정하세요.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 가격 설정 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <DollarSignIcon className="size-8 mb-2 text-primary" />
            <CardTitle>가격 설정</CardTitle>
            <CardDescription>
              프로그램 가격과 결제 방식을 설정하세요.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 프로그램 관리 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <Settings2Icon className="size-8 mb-2 text-primary" />
            <CardTitle>프로그램 관리</CardTitle>
            <CardDescription>
              공개 여부, 삭제 등 프로그램을 관리하세요.
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
            다양한 프로그램 설정 기능을 준비 중입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            기본 정보 수정, 가격 설정, 공개 여부 관리 등의 기능이 곧 추가될
            예정입니다.
          </p>
        </CardContent>
      </Card>

      {program && <SettingTab programId={pid} program={program} />}
    </div>
  );
}
