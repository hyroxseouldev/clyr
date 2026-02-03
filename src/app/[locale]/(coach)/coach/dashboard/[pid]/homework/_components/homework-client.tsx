"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
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
  Clock,
  MessageSquare,
  Trophy,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateCoachCommentOnSectionRecordAction,
  getGroupedHomeworkPageDataAction,
} from "@/actions/section-record";
import type {
  SectionRecordWithBlueprint,
  GroupedHomeworkPageData,
} from "@/db/queries/section-records.types";

interface HomeworkClientProps {
  programId: string;
  initialData: GroupedHomeworkPageData | null;
}

export function HomeworkClient({ programId, initialData }: HomeworkClientProps) {
  const t = useTranslations("homework");
  const tToast = useTranslations("toast");
  const router = useRouter();
  const [pageData, setPageData] = useState<GroupedHomeworkPageData | null>(initialData);

  // Accordion state for blueprints and sections
  const [expandedBlueprints, setExpandedBlueprints] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // 피드백 모달
  const [selectedLog, setSelectedLog] = useState<SectionRecordWithBlueprint | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [coachComment, setCoachComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Expand all blueprints by default on initial load
  if (initialData?.blueprintGroups.length && expandedBlueprints.size === 0) {
    const allBlueprintKeys = initialData.blueprintGroups.map(
      (bp) => `${bp.blueprint.phaseNumber}-${bp.blueprint.dayNumber}`
    );
    setExpandedBlueprints(new Set(allBlueprintKeys));
  }

  // Toggle functions for accordion
  const toggleBlueprint = (blueprintKey: string) => {
    setExpandedBlueprints((prev) => {
      const next = new Set(prev);
      if (next.has(blueprintKey)) {
        next.delete(blueprintKey);
      } else {
        next.add(blueprintKey);
      }
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // 코멘트 저장 핸들러
  const handleSaveComment = async () => {
    if (!selectedLog) return;

    setIsSaving(true);

    const result = await updateCoachCommentOnSectionRecordAction(
      selectedLog.id,
      coachComment
    );

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || tToast("commentSaveFailed"));
      return;
    }

    toast.success(tToast("commentSaved"));

    // Update local state - find and update the record in blueprintGroups
    setPageData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blueprintGroups: prev.blueprintGroups.map((bg) => ({
          ...bg,
          sections: bg.sections.map((sg) => ({
            ...sg,
            records: sg.records.map((r) =>
              r.id === selectedLog.id
                ? { ...r, coachComment: coachComment || null }
                : r
            ),
          })),
        })),
      };
    });

    setSelectedLog((prev) =>
      prev ? { ...prev, coachComment: coachComment || null } : null
    );

    // 통계 업데이트
    await refreshPageData();
  };

  // 피드백 모달 열기
  const handleOpenFeedback = (log: SectionRecordWithBlueprint) => {
    setSelectedLog(log);
    setCoachComment(log.coachComment || "");
    setIsFeedbackModalOpen(true);
  };

  // 페이지 데이터 새로고침
  const refreshPageData = async () => {
    const result = await getGroupedHomeworkPageDataAction(programId);
    if (result.success && result.data) {
      setPageData(result.data);
    }
  };

  // 시간 포맷팅 (FOR_TIME)
  const formatTime = (seconds: number) => {
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
      return t("timeAgo.days", { days: diffDays });
    } else if (diffHours > 0) {
      return t("timeAgo.hours", { hours: diffHours });
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return t("timeAgo.minutes", { minutes: diffMins });
    }
  };

  // 순위 배지 색상
  const getRankBadgeColor = (index: number) => {
    if (index === 0) return "bg-yellow-500 text-white";
    if (index === 1) return "bg-gray-400 text-white";
    if (index === 2) return "bg-orange-600 text-white";
    return "bg-muted text-muted-foreground";
  };

  // 레코드 타입별 렌더링
  const renderContentByRecordType = (record: SectionRecordWithBlueprint) => {
    const { recordType, content } = record;
    if (!content) return null;

    switch (recordType) {
      case "TIME_BASED":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{formatTime(content.time as number)}</span>
          </div>
        );

      case "WEIGHT_BASED":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Dumbbell className="h-4 w-4" />
            <span>{String(content.weight)}kg</span>
          </div>
        );

      case "REP_BASED":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4" />
            <span>{String(content.reps)} reps</span>
          </div>
        );

      case "DISTANCE_BASED":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4" />
            <span>{String(content.distance)}m</span>
          </div>
        );

      case "SURVEY":
        return (
          <div className="text-sm">
            {typeof content.response === "string"
              ? content.response
              : JSON.stringify(content.response)}
          </div>
        );

      case "CHECKLIST":
        return (
          <ul className="list-disc list-inside text-sm">
            {Array.isArray(content.items) &&
              content.items.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
          </ul>
        );

      case "PHOTO":
        return (
          <div className="flex gap-2">
            {Array.isArray(content.photos) &&
              content.photos.map((photo: string, idx: number) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Submission ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
              ))}
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            {typeof content.value === "string"
              ? content.value
              : JSON.stringify(content.value)}
          </div>
        );
    }
  };

  if (!pageData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">{t("cannotLoadData")}</p>
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
            {t("subtitle", { programTitle: pageData.program.title })}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("stats.totalSubmissions")}</CardDescription>
            <CardTitle className="text-3xl">
              {pageData.stats.totalSubmissions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("stats.totalSubmissionsDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("stats.pendingReviews")}</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {pageData.stats.pendingReviews}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("stats.pendingReviewsDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("stats.completedReviews")}</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {pageData.stats.completedReviews}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("stats.completedReviewsDesc")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Blueprint → Section → Records grouped display */}
      {pageData.blueprintGroups.length > 0 ? (
        <div className="space-y-4">
          {pageData.blueprintGroups.map((blueprintGroup) => {
            const blueprintKey = `${blueprintGroup.blueprint.phaseNumber}-${blueprintGroup.blueprint.dayNumber}`;
            const isBlueprintExpanded = expandedBlueprints.has(blueprintKey);

            return (
              <Card key={blueprintKey}>
                {/* Blueprint Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleBlueprint(blueprintKey)}
                >
                  <div className="flex items-center gap-2">
                    {isBlueprintExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <h3 className="text-lg font-semibold">
                      {t("blueprint", {
                        phase: blueprintGroup.blueprint.phaseNumber,
                        day: blueprintGroup.blueprint.dayNumber,
                      })}
                    </h3>
                    <Badge variant="secondary">
                      {blueprintGroup.sections.reduce((sum, s) => sum + s.records.length, 0)}{" "}
                      {t("records")}
                    </Badge>
                  </div>
                </div>

                {/* Sections within Blueprint */}
                {isBlueprintExpanded && (
                  <div className="border-t">
                    {blueprintGroup.sections.map((sectionGroup) => {
                      const isSectionExpanded = expandedSections.has(sectionGroup.section.id);

                      return (
                        <div key={sectionGroup.section.id} className="border-b last:border-b-0">
                          {/* Section Header */}
                          <div
                            className="flex items-center justify-between p-3 px-6 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection(sectionGroup.section.id)}
                          >
                            <div className="flex items-center gap-2">
                              {isSectionExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-medium">{sectionGroup.section.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {t("sectionRecordCount", { count: sectionGroup.records.length })}
                              </Badge>
                            </div>
                          </div>

                          {/* Records within Section */}
                          {isSectionExpanded && (
                            <div className="p-4 px-6 space-y-3">
                              {sectionGroup.records.map((record, index) => (
                                <Card
                                  key={record.id}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                      {/* 순위 */}
                                      <div className="flex-shrink-0">
                                        <Badge className={getRankBadgeColor(index)}>
                                          {index + 1}
                                        </Badge>
                                      </div>

                                      {/* 회원 정보 */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <p className="font-medium">
                                            {record.user.fullName || t("anonymous")}
                                          </p>
                                        </div>

                                        {/* Content based on recordType */}
                                        <div className="mb-2">
                                          {renderContentByRecordType(record)}
                                        </div>

                                        {/* Time submitted */}
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          <span>
                                            {formatSubmissionTime(new Date(record.completedAt))}
                                          </span>
                                        </div>

                                        {/* Coach comment */}
                                        {record.coachComment && (
                                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                                            <div className="flex items-start gap-2">
                                              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                              <p className="text-muted-foreground">
                                                {record.coachComment}
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
                                          onClick={() => handleOpenFeedback(record)}
                                        >
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          {t("feedback")}
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">{t("noBlueprints")}</p>
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
              <DialogTitle>{t("feedbackTitle")}</DialogTitle>
              <DialogDescription>
                {t("feedbackDesc", {
                  member: selectedLog.user.fullName || t("member"),
                  section: selectedLog.section.title,
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Submission result */}
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">{t("submission")}</p>
                {renderContentByRecordType(selectedLog)}
              </div>

              {/* Coach comment input */}
              <div className="space-y-2">
                <Label>{t("coachComment")}</Label>
                <Textarea
                  placeholder={t("coachCommentPlaceholder")}
                  value={coachComment}
                  onChange={(e) => setCoachComment(e.target.value)}
                  rows={5}
                />
              </div>

              {/* Save/Cancel buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveComment}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? t("saving") : t("saveButton")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="flex-1"
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
