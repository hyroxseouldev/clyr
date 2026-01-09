"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileTextIcon,
  CalendarIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  UserIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
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

const INTENSITY_LABELS: Record<string, string> = {
  LOW: "낮음",
  MEDIUM: "중간",
  HIGH: "높음",
};

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
  const [activeTab, setActiveTab] = useState<"enrollment" | "performance">("enrollment");

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
            수강 관리
          </div>
        </TabsTrigger>
        <TabsTrigger value="performance">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="size-4" />
            퍼포먼스 로그
          </div>
        </TabsTrigger>
      </TabsList>

      {/* 수강 관리 탭 */}
      <TabsContent value="enrollment" className="space-y-6">
        {/* 수강 상태 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>수강 상태</CardTitle>
            <CardDescription>
              {member.program.title} 프로그램의 수강 현황
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">상태</p>
                <p className="font-medium">
                  {member.status === "ACTIVE" && "수강 중"}
                  {member.status === "PAUSED" && "일시정지"}
                  {member.status === "EXPIRED" && "만료"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">시작일</p>
                <p className="font-medium">
                  {member.startDate
                    ? format(new Date(member.startDate), "yyyy.MM.dd", { locale: ko })
                    : "미정"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">종료일</p>
                <p className="font-medium">
                  {member.endDate
                    ? format(new Date(member.endDate), "yyyy.MM.dd", { locale: ko })
                    : "무기한"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">구매일</p>
                <p className="font-medium">
                  {format(new Date(member.createdAt), "yyyy.MM.dd", { locale: ko })}
                </p>
              </div>
            </div>

            {member.order && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">결제 금액</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("ko-KR").format(Number(member.order.amount))}원
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
              <CardTitle>회원 프로필</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.userProfile.nickname && (
                <div>
                  <p className="text-sm text-muted-foreground">닉네임</p>
                  <p className="font-medium">{member.userProfile.nickname}</p>
                </div>
              )}
              {member.userProfile.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">자기소개</p>
                  <p className="font-medium">{member.userProfile.bio}</p>
                </div>
              )}
              {member.userProfile.phoneNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">연락처</p>
                  <p className="font-medium">{member.userProfile.phoneNumber}</p>
                </div>
              )}
              {member.userProfile.fitnessLevel && (
                <div>
                  <p className="text-sm text-muted-foreground">운동 수준</p>
                  <p className="font-medium">
                    {member.userProfile.fitnessLevel === "BEGINNER" && "초급"}
                    {member.userProfile.fitnessLevel === "INTERMEDIATE" && "중급"}
                    {member.userProfile.fitnessLevel === "ADVANCED" && "고급"}
                  </p>
                </div>
              )}
              {member.userProfile.fitnessGoals && member.userProfile.fitnessGoals.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">운동 목표</p>
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
              코치 코멘트
              <Badge variant="secondary">{coachComments.length}</Badge>
            </CardTitle>
            <CardDescription>
              회원의 운동 기록에 남긴 코치 코멘트들입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {coachComments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                코치 코멘트가 없습니다.
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
            <CardTitle>3대 운동 최고 기록 (PR)</CardTitle>
            <CardDescription>
              벤치프레스, 데드리프트, 스쿼트의 최고 중량 기록입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* 벤치프레스 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">벤치프레스</p>
                  {bigThreePRs.bench && (
                    <Badge variant="default">PR</Badge>
                  )}
                </div>
                {bigThreePRs.bench ? (
                  <>
                    <p className="text-2xl font-bold">
                      {parseFloat(bigThreePRs.bench.maxWeight || "0").toFixed(1)}kg
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(bigThreePRs.bench.logDate), "yyyy.MM.dd", { locale: ko })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">기록 없음</p>
                )}
              </div>

              {/* 데드리프트 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">데드리프트</p>
                  {bigThreePRs.deadlift && (
                    <Badge variant="default">PR</Badge>
                  )}
                </div>
                {bigThreePRs.deadlift ? (
                  <>
                    <p className="text-2xl font-bold">
                      {parseFloat(bigThreePRs.deadlift.maxWeight || "0").toFixed(1)}kg
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(bigThreePRs.deadlift.logDate), "yyyy.MM.dd", { locale: ko })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">기록 없음</p>
                )}
              </div>

              {/* 스쿼트 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">스쿼트</p>
                  {bigThreePRs.squat && (
                    <Badge variant="default">PR</Badge>
                  )}
                </div>
                {bigThreePRs.squat ? (
                  <>
                    <p className="text-2xl font-bold">
                      {parseFloat(bigThreePRs.squat.maxWeight || "0").toFixed(1)}kg
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(bigThreePRs.squat.logDate), "yyyy.MM.dd", { locale: ko })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">기록 없음</p>
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
              운동 기록
              <Badge variant="secondary">{workoutLogs.length}</Badge>
            </CardTitle>
            <CardDescription>
              회원의 최근 운동 기록입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workoutLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileTextIcon className="size-12 mx-auto mb-4 opacity-50" />
                <p>운동 기록이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workoutLogs.slice(0, 20).map((log) => {
                  const exerciseName = log.content?.exerciseName as string | undefined || "운동";
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
                          {INTENSITY_LABELS[log.intensity || "MEDIUM"]}
                        </Badge>
                      </div>

                    {parseFloat(log.maxWeight || "0") > 0 && (
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-medium">최대 중량:</span>{" "}
                          {parseFloat(log.maxWeight || "0").toFixed(1)}kg
                        </p>
                      </div>
                    )}

                    {log.coachComment && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <p className="font-medium text-xs text-muted-foreground mb-1">
                          코치 코멘트:
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
