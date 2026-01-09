"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dumbbell,
  FileText,
  Clock,
  CheckCircle2,
  Circle,
  MessageSquare,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import {
  getHomeworkSubmissionsAction,
  updateCoachCommentAction,
  toggleCoachCheckAction,
  getHomeworkPageDataAction,
} from "@/actions/workout-log";
import type { HomeworkSubmission, HomeworkPageData } from "@/db/queries/workout-log.types";

interface HomeworkClientProps {
  programId: string;
  initialData: HomeworkPageData | null;
}

export function HomeworkClient({ programId, initialData }: HomeworkClientProps) {
  const tToast = useTranslations('toast');
  const router = useRouter();
  const [pageData, setPageData] = useState<HomeworkPageData | null>(initialData);

  // 2단계 드롭다운: Phase → Day
  const [selectedPhase, setSelectedPhase] = useState<number | null>(
    initialData?.availableDays[0]?.phaseNumber ?? null
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(
    initialData?.availableDays[0]?.dayNumber ?? null
  );

  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Phase 목록 추출 (중복 제거)
  const availablePhases = useMemo(() => {
    if (!pageData?.availableDays) return [];
    const phases = pageData.availableDays.map((d) => d.phaseNumber);
    return Array.from(new Set(phases)).sort((a, b) => a - b);
  }, [pageData?.availableDays]);

  // 선택된 Phase의 Day 목록
  const availableDaysForPhase = useMemo(() => {
    if (!pageData?.availableDays || !selectedPhase) return [];
    return pageData.availableDays
      .filter((d) => d.phaseNumber === selectedPhase)
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }, [pageData?.availableDays, selectedPhase]);

  // 피드백 모달
  const [selectedLog, setSelectedLog] = useState<HomeworkSubmission | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [coachComment, setCoachComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 선택된 Phase-Day의 제출 목록 로드
  const loadSubmissions = async (phaseNumber: number, dayNumber: number) => {
    setIsLoading(true);
    const result = await getHomeworkSubmissionsAction(
      programId,
      phaseNumber,
      dayNumber
    );

    setIsLoading(false);

    if (result.success && result.data) {
      setSubmissions(result.data);
    } else {
      toast.error(result.message || tToast('homeworkLoadFailed'));
    }
  };

  // Phase 선택 핸들러
  const handlePhaseChange = (phaseString: string) => {
    const phaseNumber = parseInt(phaseString);
    setSelectedPhase(phaseNumber);

    // Phase가 변경되면 Day 목록도 변경되므로, 해당 Phase의 첫 번째 Day 자동 선택
    const firstDay = pageData?.availableDays.find(
      (d) => d.phaseNumber === phaseNumber
    );
    if (firstDay) {
      setSelectedDay(firstDay.dayNumber);
      loadSubmissions(phaseNumber, firstDay.dayNumber);
    }
  };

  // Day 선택 핸들러
  const handleDayChange = (dayString: string) => {
    const dayNumber = parseInt(dayString);
    setSelectedDay(dayNumber);

    if (selectedPhase) {
      loadSubmissions(selectedPhase, dayNumber);
    }
  };

  // 초기 데이터 로드 시 첫 번째 Phase-Day의 제출 목록 로드
  if (
    initialData?.availableDays.length &&
    selectedPhase === null &&
    selectedDay === null &&
    initialData.availableDays[0]
  ) {
    const firstDay = initialData.availableDays[0];
    setSelectedPhase(firstDay.phaseNumber);
    setSelectedDay(firstDay.dayNumber);
    loadSubmissions(firstDay.phaseNumber, firstDay.dayNumber);
  }

  // 코멘트 저장 핸들러
  const handleSaveComment = async () => {
    if (!selectedLog) return;

    setIsSaving(true);

    const result = await updateCoachCommentAction(selectedLog.id, coachComment);

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || tToast('commentSaveFailed'));
      return;
    }

    toast.success(tToast('commentSaved'));

    // 로컬 상태 업데이트
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === selectedLog.id
          ? { ...sub, coachComment: coachComment || null } as HomeworkSubmission
          : sub
      )
    );

    setSelectedLog((prev) =>
      prev ? { ...prev, coachComment: coachComment || null } : null
    );

    // 통계 업데이트
    if (pageData) {
      await refreshPageData();
    }
  };

  // 확인 완료 토글 핸들러
  const handleToggleCheck = async (logId: string) => {
    const result = await toggleCoachCheckAction(logId);

    if (!result.success) {
      toast.error(result.message || tToast('homeworkCheckFailed'));
      return;
    }

    toast.success(result.data?.isCheckedByCoach ? tToast('homeworkChecked') : tToast('homeworkUnchecked'));

    // 로컬 상태 업데이트
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === logId
          ? { ...sub, isCheckedByCoach: result.data!.isCheckedByCoach }
          : sub
      )
    );

    // 통계 업데이트
    if (pageData) {
      await refreshPageData();
    }
  };

  // 피드백 모달 열기
  const handleOpenFeedback = (log: HomeworkSubmission) => {
    setSelectedLog(log);
    setCoachComment(log.coachComment || "");
    setIsFeedbackModalOpen(true);
  };

  // 페이지 데이터 새로고침
  const refreshPageData = async () => {
    const result = await getHomeworkPageDataAction(programId);
    if (result.success && result.data) {
      setPageData(result.data);
    }
  };

  // 시간 포맷팅 (FOR_TIME)
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 제출 시간 포맷팅
  const formatSubmissionTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}분 전`;
    }
  };

  // 순위 배지 색상
  const getRankBadgeColor = (index: number) => {
    if (index === 0) return "bg-yellow-500 text-white";
    if (index === 1) return "bg-gray-400 text-white";
    if (index === 2) return "bg-orange-600 text-white";
    return "bg-muted text-muted-foreground";
  };

  if (!pageData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">데이터를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {pageData.program.title} - 숙제 관리
          </h1>
          <p className="text-muted-foreground">
            회원들의 운동 숙제를 검토하고 피드백을 남기세요
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>총 제출</CardDescription>
            <CardTitle className="text-3xl">
              {pageData.stats.totalSubmissions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              전체 숙제 제출 건수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>검토 대기</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {pageData.stats.pendingReviews}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              코치 확인이 필요한 숙제
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>검토 완료</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {pageData.stats.completedReviews}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              피드백이 완료된 숙제
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Phase-Day 필터 - 2단계 드롭다운 */}
      {pageData.availableDays.length > 0 ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">회차별 보기</h3>
            <div className="flex gap-4">
              {/* Phase 선택 */}
              <div className="flex-1 max-w-xs">
                <Label htmlFor="phase-select">Phase</Label>
                <Select
                  value={selectedPhase?.toString() ?? ""}
                  onValueChange={handlePhaseChange}
                >
                  <SelectTrigger id="phase-select">
                    <SelectValue placeholder="Phase 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePhases.map((phase) => (
                      <SelectItem key={phase} value={phase.toString()}>
                        Phase {phase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day 선택 */}
              <div className="flex-1 max-w-xs">
                <Label htmlFor="day-select">Day</Label>
                <Select
                  value={selectedDay?.toString() ?? ""}
                  onValueChange={handleDayChange}
                  disabled={!selectedPhase}
                >
                  <SelectTrigger id="day-select">
                    <SelectValue
                      placeholder={
                        selectedPhase ? "Day 선택" : "먼저 Phase를 선택하세요"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDaysForPhase.map((day) => (
                      <SelectItem key={day.dayNumber} value={day.dayNumber.toString()}>
                        Day {day.dayNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 제출 목록 */}
          {selectedPhase && selectedDay && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Phase {selectedPhase} - Day {selectedDay} 제출 현황
                    </CardTitle>
                    <CardDescription>
                      총 {submissions.length}명 제출
                    </CardDescription>
                  </div>
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">로딩 중...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      제출된 숙제가 없습니다
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((submission, index) => (
                      <Card
                        key={submission.id}
                        className={`hover:shadow-md transition-shadow ${
                          submission.isCheckedByCoach ? "bg-muted/30" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* 순위 */}
                            <div className="flex-shrink-0">
                              <Badge
                                className={getRankBadgeColor(index)}
                              >
                                {index + 1}
                              </Badge>
                            </div>

                            {/* 회원 정보 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-medium">
                                  {submission.user.fullName || "익명"}
                                </p>
                                {submission.isCheckedByCoach ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Circle className="h-4 w-4 text-orange-600" />
                                )}
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatSubmissionTime(
                                      new Date(submission.createdAt)
                                    )}
                                  </span>
                                </div>

                                {submission.totalDuration !== null && (
                                  <div className="flex items-center gap-1">
                                    <Trophy className="h-3 w-3" />
                                    <span>{formatDuration(submission.totalDuration)}</span>
                                  </div>
                                )}

                                {submission.totalVolume &&
                                  parseFloat(submission.totalVolume) > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Dumbbell className="h-3 w-3" />
                                      <span>
                                        {submission.totalVolume}회
                                      </span>
                                    </div>
                                  )}
                              </div>

                              {submission.coachComment && (
                                <div className="mt-2 p-2 bg-muted rounded text-sm">
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-muted-foreground">
                                      {submission.coachComment}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenFeedback(submission)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                피드백
                              </Button>
                              <Button
                                variant={
                                  submission.isCheckedByCoach ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleToggleCheck(submission.id)
                                }
                              >
                                {submission.isCheckedByCoach ? (
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                ) : (
                                  <Circle className="h-4 w-4 mr-2" />
                                )}
                                {submission.isCheckedByCoach ? "완료" : "확인"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">아직 플랜이 없습니다</p>
            <p className="text-sm text-muted-foreground mt-2">
              먼저 프로그램 플랜을 생성하세요
            </p>
          </CardContent>
        </Card>
      )}

      {/* 피드백 모달 */}
      {selectedLog && (
        <Dialog
          open={isFeedbackModalOpen}
          onOpenChange={setIsFeedbackModalOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>피드백 남기기</DialogTitle>
              <DialogDescription>
                {selectedLog.user.fullName || "회원"}님의 Day{" "}
                {selectedLog.blueprint?.dayNumber} 숙제에 피드백을 남기세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* 운동 결과 요약 */}
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">운동 결과</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {selectedLog.totalDuration !== null && (
                    <span>기록: {formatDuration(selectedLog.totalDuration)}</span>
                  )}
                  {selectedLog.totalVolume &&
                    parseFloat(selectedLog.totalVolume) > 0 && (
                      <span>횟수: {selectedLog.totalVolume}회</span>
                    )}
                  {selectedLog.maxWeight &&
                    parseFloat(selectedLog.maxWeight) > 0 && (
                      <span>최대 중량: {selectedLog.maxWeight}kg</span>
                    )}
                </div>
              </div>

              {/* 코치 코멘트 입력 */}
              <div className="space-y-2">
                <Label>코치 코멘트</Label>
                <Textarea
                  placeholder="회원에게 전할 피드백을 입력하세요..."
                  value={coachComment}
                  onChange={(e) => setCoachComment(e.target.value)}
                  rows={5}
                />
              </div>

              {/* 저장/취소 버튼 */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveComment}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? "저장 중..." : "저장하기"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
