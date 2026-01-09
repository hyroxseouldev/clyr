"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileTextIcon,
  CalendarIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  UserIcon,
  ShoppingBagIcon,
  LoaderIcon,
} from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import type { Enrollment, WorkoutLog } from "@/db/schema";

interface MemberDetailClientProps {
  programId: string;
  memberId: string;
  member: Enrollment & {
    user: {
      id: string;
      email: string;
      fullName: string | null;
      avatarUrl: string | null;
    };
    program: {
      id: string;
      title: string;
    };
    order: {
      id: string;
      amount: string;
      status: string;
      createdAt: Date;
    } | null;
    userProfile: {
      nickname: string | null;
      bio: string | null;
      phoneNumber: string | null;
      fitnessGoals: string[] | null;
      fitnessLevel: string | null;
    } | null;
  };
  workoutLogs: WorkoutLog[];
  coachComments: Array<{
    id: string;
    logDate: Date;
    coachComment: string | null;
    isCheckedByCoach: boolean | null;
    createdAt: Date;
  }>;
}

const INTENSITY_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "outline",
};

export function MemberDetailClient({
  programId,
  memberId,
  member,
  workoutLogs,
  coachComments,
}: MemberDetailClientProps) {
  const t = useTranslations('memberDetail');
  const tToast = useTranslations('toast');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"enrollment" | "performance">("enrollment");
  const [isUpdating, setIsUpdating] = useState(false);

  // 상태 변경 핸들러
  const handleStatusChange = async (newStatus: "ACTIVE" | "EXPIRED" | "PAUSED") => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/members/${member.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to change status");

      toast.success(tToast('statusChanged'));
      router.refresh();
    } catch (error) {
      toast.error(tToast('statusChangeFailed'));
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 기간 연장 핸들러
  const handleExtendEnrollment = async (days: number) => {
    setIsUpdating(true);
    try {
      const newEndDate = member.endDate
        ? addDays(new Date(member.endDate), days)
        : addDays(new Date(), days);

      const response = await fetch(`/api/members/${member.id}/extend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endDate: newEndDate.toISOString() }),
      });

      if (!response.ok) throw new Error("Failed to extend period");

      toast.success(tToast('periodExtended', { days }));
      router.refresh();
    } catch (error) {
      toast.error(tToast('periodExtendFailed'));
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 3대 운동 PR 계산 (content에서 운동 이름 찾기)
  const bigThreePRs = {
    bench: workoutLogs
      .filter(log => {
        const exerciseName = log.content?.exerciseName as string | undefined || "";
        return exerciseName.toLowerCase().includes("벤치") || exerciseName.toLowerCase().includes("bench");
      })
      .sort((a, b) => parseFloat(b.maxWeight || "0") - parseFloat(a.maxWeight || "0"))[0],
    deadlift: workoutLogs
      .filter(log => {
        const exerciseName = log.content?.exerciseName as string | undefined || "";
        return exerciseName.toLowerCase().includes("데드") || exerciseName.toLowerCase().includes("deadlift");
      })
      .sort((a, b) => parseFloat(b.maxWeight || "0") - parseFloat(a.maxWeight || "0"))[0],
    squat: workoutLogs
      .filter(log => {
        const exerciseName = log.content?.exerciseName as string | undefined || "";
        return exerciseName.toLowerCase().includes("스쿼트") || exerciseName.toLowerCase().includes("squat");
      })
      .sort((a, b) => parseFloat(b.maxWeight || "0") - parseFloat(a.maxWeight || "0"))[0],
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="enrollment">
          <div className="flex items-center gap-2">
            <UserIcon className="size-4" />
            {t('enrollmentManagement')}
          </div>
        </TabsTrigger>
        <TabsTrigger value="performance">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="size-4" />
            {t('performanceLog')}
          </div>
        </TabsTrigger>
      </TabsList>

      {/* 수강 관리 탭 */}
      <TabsContent value="enrollment" className="space-y-6">
        {/* 수강 상태 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('enrollmentStatus')}</CardTitle>
            <CardDescription>
              {t('enrollmentStatusDesc', { program: member.program.title })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('status')}</p>
                <Select
                  value={member.status}
                  onValueChange={(value) => handleStatusChange(value as "ACTIVE" | "EXPIRED" | "PAUSED")}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {member.status === "ACTIVE" && t('active')}
                      {member.status === "PAUSED" && t('paused')}
                      {member.status === "EXPIRED" && t('expired')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t('active')}</SelectItem>
                    <SelectItem value="PAUSED">{t('paused')}</SelectItem>
                    <SelectItem value="EXPIRED">{t('expired')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('startDate')}</p>
                <p className="font-medium">
                  {member.startDate
                    ? format(new Date(member.startDate), "yyyy.MM.dd", { locale: ko })
                    : t('undecided')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('endDate')}</p>
                <p className="font-medium">
                  {member.endDate
                    ? format(new Date(member.endDate), "yyyy.MM.dd", { locale: ko })
                    : t('unlimited')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('purchaseDate')}</p>
                <p className="font-medium">
                  {format(new Date(member.createdAt), "yyyy.MM.dd", { locale: ko })}
                </p>
              </div>
            </div>

            {/* 수강 기간 연장 버튼 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('extendPeriod')}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtendEnrollment(7)}
                  disabled={isUpdating}
                >
                  +7{t('days')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtendEnrollment(30)}
                  disabled={isUpdating}
                >
                  +30{t('days')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtendEnrollment(90)}
                  disabled={isUpdating}
                >
                  +90{t('days')}
                </Button>
              </div>
            </div>

            {member.order && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">{t('paymentAmount')}</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("ko-KR").format(Number(member.order.amount))}{t('won')}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 회원 프로필 정보 */}
        {member.userProfile && (
          <Card>
            <CardHeader>
              <CardTitle>{t('memberProfile')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.userProfile.nickname && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('nickname')}</p>
                  <p className="font-medium">{member.userProfile.nickname}</p>
                </div>
              )}
              {member.userProfile.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('bio')}</p>
                  <p className="font-medium">{member.userProfile.bio}</p>
                </div>
              )}
              {member.userProfile.phoneNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('phoneNumber')}</p>
                  <p className="font-medium">{member.userProfile.phoneNumber}</p>
                </div>
              )}
              {member.userProfile.fitnessLevel && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('fitnessLevel')}</p>
                  <p className="font-medium">
                    {member.userProfile.fitnessLevel === "BEGINNER" && t('beginner')}
                    {member.userProfile.fitnessLevel === "INTERMEDIATE" && t('intermediate')}
                    {member.userProfile.fitnessLevel === "ADVANCED" && t('advanced')}
                  </p>
                </div>
              )}
              {member.userProfile.fitnessGoals && member.userProfile.fitnessGoals.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('fitnessGoals')}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {member.userProfile.fitnessGoals.map((goal, i) => (
                      <Badge key={i} variant="secondary">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 코치 코멘트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareIcon className="size-5" />
              {t('coachComments')}
              <Badge variant="secondary">{coachComments.length}</Badge>
            </CardTitle>
            <CardDescription>
              {t('coachCommentsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {coachComments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('noCoachComments')}
              </p>
            ) : (
              <div className="space-y-4">
                {coachComments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-primary pl-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <CalendarIcon className="size-4" />
                      {format(new Date(comment.logDate), "yyyy.MM.dd", { locale: ko })}
                    </div>
                    <p className="text-sm">{comment.coachComment}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* 퍼포먼스 로그 탭 */}
      <TabsContent value="performance" className="space-y-6">
        {/* 3대 운동 PR */}
        <Card>
          <CardHeader>
            <CardTitle>{t('bigThreePR')}</CardTitle>
            <CardDescription>
              {t('bigThreePRDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* 벤치프레스 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{t('benchPress')}</p>
                  {bigThreePRs.bench && (
                    <Badge variant="default">PR</Badge>
                  )}
                </div>
                {bigThreePRs.bench ? (
                  <>
                    <p className="text-2xl font-bold">
                      {parseFloat(bigThreePRs.bench.maxWeight || "0").toFixed(1)}{t('kg')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(bigThreePRs.bench.logDate), "yyyy.MM.dd", { locale: ko })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('noRecord')}</p>
                )}
              </div>

              {/* 데드리프트 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{t('deadlift')}</p>
                  {bigThreePRs.deadlift && (
                    <Badge variant="default">PR</Badge>
                  )}
                </div>
                {bigThreePRs.deadlift ? (
                  <>
                    <p className="text-2xl font-bold">
                      {parseFloat(bigThreePRs.deadlift.maxWeight || "0").toFixed(1)}{t('kg')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(bigThreePRs.deadlift.logDate), "yyyy.MM.dd", { locale: ko })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('noRecord')}</p>
                )}
              </div>

              {/* 스쿼트 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{t('squat')}</p>
                  {bigThreePRs.squat && (
                    <Badge variant="default">PR</Badge>
                  )}
                </div>
                {bigThreePRs.squat ? (
                  <>
                    <p className="text-2xl font-bold">
                      {parseFloat(bigThreePRs.squat.maxWeight || "0").toFixed(1)}{t('kg')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(bigThreePRs.squat.logDate), "yyyy.MM.dd", { locale: ko })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('noRecord')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 운동 기록 타임라인 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="size-5" />
              {t('workoutLog')}
              <Badge variant="secondary">{workoutLogs.length}</Badge>
            </CardTitle>
            <CardDescription>
              {t('workoutLogDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workoutLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileTextIcon className="size-12 mx-auto mb-4 opacity-50" />
                <p>{t('noWorkoutLog')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workoutLogs.slice(0, 20).map((log) => {
                  const exerciseName = log.content?.exerciseName as string | undefined || t('exercise');
                  return (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{exerciseName}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(log.logDate), "yyyy.MM.dd HH:mm", { locale: ko })}
                          </p>
                        </div>
                        <Badge
                          variant={INTENSITY_VARIANTS[log.intensity || "MEDIUM"]}
                        >
                          {t(`intensity.${log.intensity || "MEDIUM"}`)}
                        </Badge>
                      </div>

                    {parseFloat(log.maxWeight || "0") > 0 && (
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-medium">{t('maxWeight')}:</span>{" "}
                          {parseFloat(log.maxWeight || "0").toFixed(1)}{t('kg')}
                        </p>
                      </div>
                    )}

                    {log.coachComment && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <p className="font-medium text-xs text-muted-foreground mb-1">
                          {t('coachComment')}:
                        </p>
                        <p>{log.coachComment}</p>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
