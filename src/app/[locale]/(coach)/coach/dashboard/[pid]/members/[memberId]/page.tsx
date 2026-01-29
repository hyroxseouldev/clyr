import { notFound, redirect } from "next/navigation";
import { getMemberDetailAction } from "@/actions/member";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemberStatusBadge } from "@/components/coach/member-status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberDetailClient } from "./member-detail-client";
import {
  UserIcon,
  MailIcon,
  ArrowLeftIcon,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

interface PageProps {
  params: Promise<{
    pid: string;
    memberId: string;
  }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { pid: programId, memberId } = await params;
  const t = await getTranslations("memberDetail");

  // 회원 상세 정보 조회
  const memberResult = await getMemberDetailAction(programId, memberId);
  if (!memberResult.success || !memberResult.data) {
    if (memberResult.message?.includes("권한") || memberResult.message?.includes("인증")) {
      redirect("/signin");
    }
    notFound();
  }

  const member = memberResult.data;

  return (
    <div className="container max-w-5xl py-6">
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={`/coach/dashboard/${programId}/members`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            {t("backToList")}
          </Link>
        </Button>

        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={member.user.avatarUrl || undefined} />
            <AvatarFallback>
              {member.user.fullName
                ?.split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {t("detailTitle", { name: member.user.fullName || t("noName") })}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MailIcon className="size-4" />
                {member.user.email}
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="size-4" />
                {member.startDate
                  ? format(new Date(member.startDate), "yyyy.MM.dd", { locale: ko })
                  : t("startDateUndecided")}
                {" ~ "}
                {member.endDate
                  ? format(new Date(member.endDate), "yyyy.MM.dd", { locale: ko })
                  : t("unlimited")}
              </div>
            </div>
          </div>
          <MemberStatusBadge status={member.status} />
        </div>
      </div>

      {/* 클라이언트 컴포넌트로 탭 기능 제공 */}
      <MemberDetailClient
        programId={programId}
        memberId={memberId}
        member={member}
      />
    </div>
  );
}
