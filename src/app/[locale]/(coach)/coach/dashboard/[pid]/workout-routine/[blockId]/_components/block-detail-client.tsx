"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Search,
  Plus,
  Dumbbell,
  Edit,
  Trash2,
  GripVertical,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { RoutineBlockWithItems } from "@/db/queries/routine-block";
import type { WorkoutLibraryItem } from "@/db/queries/workout-library";
import {
  updateRoutineBlockAction,
  deleteRoutineBlockAction,
  addRoutineItemAction,
  updateRoutineItemOrderAction,
  deleteRoutineItemAction,
} from "@/actions/routine-block";
import { getWorkoutLibraryAction } from "@/actions/workout-library";
import {
  getWorkoutTypeLabel,
  RECOMMENDATION_FIELD_LABELS,
  RECOMMENDATION_FIELD_PLACEHOLDERS,
  RECOMMENDATION_TEMPLATES,
  type RecommendationData,
} from "@/lib/constants/workout";

interface BlockDetailClientProps {
  block: RoutineBlockWithItems;
}

export function BlockDetailClient({ block }: BlockDetailClientProps) {
  const t = useTranslations('workoutRoutine');
  const tToast = useTranslations('toast');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState(block.name);
  const [editFormat, setEditFormat] = useState(block.workoutFormat);
  const [editTargetValue, setEditTargetValue] = useState(
    block.targetValue || ""
  );
  const [editDescription, setEditDescription] = useState(
    block.description || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  // 운동 라이브러리 검색
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseLibrary, setExerciseLibrary] = useState<WorkoutLibraryItem[]>(
    []
  );
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // 드래그 앤 드롭
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedExerciseTitle, setDraggedExerciseTitle] = useState<string>("");
  const [draggedExerciseType, setDraggedExerciseType] = useState<string>("");
  const [recommendationDialogOpen, setRecommendationDialogOpen] =
    useState(false);
  const [pendingLibraryId, setPendingLibraryId] = useState<string | null>(null);
  const [pendingExerciseTitle, setPendingExerciseTitle] = useState("");
  const [pendingExerciseType, setPendingExerciseType] = useState<string>("");
  const [recommendationData, setRecommendationData] =
    useState<RecommendationData>({});

  // 초기 로딩 시 운동 라이브러리 가져오기
  useEffect(() => {
    const loadLibrary = async () => {
      setIsLoadingLibrary(true);
      const result = await getWorkoutLibraryAction({
        pageSize: 50,
      });
      if (result.success && result.data) {
        setExerciseLibrary(result.data.items);
      }
      setIsLoadingLibrary(false);
    };

    loadLibrary();
  }, []);

  // 검색 핸들러 (버튼 클릭 시 실행)
  const handleSearchExercise = async () => {
    setIsLoadingLibrary(true);
    const result = await getWorkoutLibraryAction({
      search: exerciseSearch || undefined,
      pageSize: 50,
    });
    if (result.success && result.data) {
      setExerciseLibrary(result.data.items);
    }
    setIsLoadingLibrary(false);
  };

  // Enter 키로 검색
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchExercise();
    }
  };

  // 편집 모드 시작
  const handleStartEdit = () => {
    setIsEditMode(true);
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditName(block.name);
    setEditFormat(block.workoutFormat);
    setEditTargetValue(block.targetValue || "");
    setEditDescription(block.description || "");
  };

  // 편집 저장
  const handleSaveEdit = async () => {
    setIsSaving(true);

    const result = await updateRoutineBlockAction(block.id, {
      name: editName,
      workoutFormat: editFormat,
      targetValue: editTargetValue || null,
      description: editDescription || null,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || `${tToast('error')}: ${tCommon('save')}`);
      return;
    }

    toast.success(tToast('saved'));
    setIsEditMode(false);
    router.refresh();
  };

  // 블록 삭제
  const handleDeleteBlock = async () => {
    if (!confirm(t('deleteConfirmMessage'))) {
      return;
    }

    const result = await deleteRoutineBlockAction(block.id);

    if (!result.success) {
      toast.error(result.message || `${tToast('error')}: ${tCommon('delete')}`);
      return;
    }

    toast.success(tToast('deleted'));
    router.push("../workout-routine");
  };

  // 운동 추가 (드래그 앤 드롭)
  const handleAddExercise = async (
    libraryId: string,
    recommendation?: RecommendationData
  ) => {
    // 빈 값 필터링
    const cleanRecommendation = recommendation
      ? Object.fromEntries(
          Object.entries(recommendation).filter(
            ([_, value]) => value !== "" && value !== undefined
          )
        )
      : undefined;

    const result = await addRoutineItemAction({
      blockId: block.id,
      libraryId,
      recommendation: cleanRecommendation,
    });

    if (!result.success) {
      toast.error(result.message || `${tToast('error')}: ${tCommon('submit')}`);
      return;
    }

    toast.success(tToast('created'));
    router.refresh();
  };

  // 드롭 처리에서 Dialog 띄우기
  const handleDropWithDialog = async (
    libraryId: string,
    exerciseTitle: string,
    exerciseType: string
  ) => {
    setPendingLibraryId(libraryId);
    setPendingExerciseTitle(exerciseTitle);
    setPendingExerciseType(exerciseType);

    // workoutType별 기본 템플릿 설정
    const template =
      RECOMMENDATION_TEMPLATES[
        exerciseType as keyof typeof RECOMMENDATION_TEMPLATES
      ] || {};
    setRecommendationData({ ...template });
    setRecommendationDialogOpen(true);
    setDraggedItem(null);
  };

  // recommendation 확인 핸들러
  const handleConfirmRecommendation = async () => {
    if (!pendingLibraryId) return;

    await handleAddExercise(pendingLibraryId, recommendationData);
    setRecommendationDialogOpen(false);
    setPendingLibraryId(null);
    setPendingExerciseTitle("");
    setPendingExerciseType("");
    setRecommendationData({});
  };

  // recommendation 취소 핸들러
  const handleCancelRecommendation = () => {
    setRecommendationDialogOpen(false);
    setPendingLibraryId(null);
    setPendingExerciseTitle("");
    setPendingExerciseType("");
    setRecommendationData({});
  };

  // recommendation 필드 변경 핸들러
  const handleRecommendationChange = (
    field: keyof RecommendationData,
    value: string
  ) => {
    setRecommendationData((prev) => ({ ...prev, [field]: value }));
  };

  // 드래그 시작
  const handleDragStart = (
    itemId: string,
    isLibraryItem: boolean = false,
    title?: string,
    workoutType?: string
  ) => {
    // library item인 경우 접두사 추가
    setDraggedItem(isLibraryItem ? `library-${itemId}` : itemId);
    if (title) setDraggedExerciseTitle(title);
    if (workoutType) setDraggedExerciseType(workoutType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // 드롭 처리
  const handleDrop = async (e: React.DragEvent, targetItemId?: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    // 라이브러리 아이템인 경우
    if (draggedItem.startsWith("library-")) {
      const libraryId = draggedItem.replace("library-", "");
      // Dialog 띄우기
      await handleDropWithDialog(
        libraryId,
        draggedExerciseTitle,
        draggedExerciseType
      );
      return;
    }

    // 블록 내 아이템 순서 변경인 경우
    if (!targetItemId) {
      setDraggedItem(null);
      return;
    }

    if (draggedItem === targetItemId) {
      setDraggedItem(null);
      return;
    }

    const items = block.items;
    const draggedIndex = items.findIndex((item) => item.id === draggedItem);
    const targetIndex = items.findIndex((item) => item.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // 새 순서 계산
    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    // 순서 업데이트
    const updates = newItems.map((item, index) => ({
      id: item.id,
      orderIndex: index,
    }));

    const result = await updateRoutineItemOrderAction(block.id, updates);

    if (!result.success) {
      toast.error(`${tToast('error')}: ${tCommon('submit')}`);
      setDraggedItem(null);
      return;
    }

    setDraggedItem(null);
    router.refresh();
  };

  // 운동 삭제
  const handleDeleteExercise = async (itemId: string) => {
    const result = await deleteRoutineItemAction(itemId);

    if (!result.success) {
      toast.error(result.message || `${tToast('error')}: ${tCommon('delete')}`);
      return;
    }

    toast.success(tToast('deleted'));
    router.refresh();
  };

  const getFormatLabel = (format: string) => {
    return t(`formats.${format}`) || format;
  };

  const getWorkoutFormats = () => [
    { value: "STRENGTH", label: t('formats.STRENGTH') },
    { value: "FOR_TIME", label: t('formats.FOR_TIME') },
    { value: "AMRAP", label: t('formats.AMRAP') },
    { value: "EMOM", label: t('formats.EMOM') },
    { value: "CUSTOM", label: t('formats.CUSTOM') },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{t('blockDetailTitle')}</h1>
          <p className="text-muted-foreground">
            {t('blockDetailDesc')}
          </p>
        </div>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                {t('cancel')}
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                <Check className="h-4 w-4 mr-1" />
                {isSaving ? t('saving') : t('save')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <Edit className="h-4 w-4 mr-1" />
                {t('edit')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteBlock}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t('delete')}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 루틴 블록 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('blockName')}</Label>
                {isEditMode ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={t('blockName')}
                  />
                ) : (
                  <p className="text-sm font-medium">{block.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('workoutFormat')}</Label>
                  {isEditMode ? (
                    <Select value={editFormat} onValueChange={setEditFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getWorkoutFormats().map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary">
                      {getFormatLabel(block.workoutFormat)}
                    </Badge>
                  )}
                </div>

                <div>
                  <Label>{t('targetValue')}</Label>
                  {isEditMode ? (
                    <Input
                      value={editTargetValue}
                      onChange={(e) => setEditTargetValue(e.target.value)}
                      placeholder={t('targetValuePlaceholder')}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {block.targetValue || "-"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>{t('description')}</Label>
                {isEditMode ? (
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder={t('descriptionPlaceholder')}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {block.description || "-"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 포함된 운동 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('includedExercisesCount', { count: block.items.length })}</CardTitle>
            </CardHeader>
            <CardContent
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e)}
            >
              {block.items.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {t('dragToAdd')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {block.items.map((item, index) => (
                    <Card
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item.id)}
                      className="cursor-move transition-all hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <GripVertical className="h-4 w-4 cursor-move" />
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.libraryTitle || t('unknownExercise')}
                            </p>
                            {item.recommendation && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {JSON.stringify(item.recommendation)}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteExercise(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 운동 라이브러리 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('workoutLibrary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 검색 */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('exerciseSearchPlaceholder')}
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleSearchExercise}
                  disabled={isLoadingLibrary}
                  size="icon"
                  variant="outline"
                >
                  {isLoadingLibrary ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* 운동 목록 (드래그 소스) */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {isLoadingLibrary ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm">{t('searching')}</p>
                  </div>
                ) : exerciseLibrary.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Dumbbell className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      {exerciseSearch
                        ? t('noSearchResults')
                        : t('noExercisesInLibrary')}
                    </p>
                  </div>
                ) : (
                  exerciseLibrary.map((exercise) => (
                    <Card
                      key={exercise.id}
                      draggable
                      onDragStart={() =>
                        handleDragStart(
                          exercise.id,
                          true,
                          exercise.title,
                          exercise.workoutType
                        )
                      }
                      className="cursor-grab transition-all hover:shadow-md hover:border-primary"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {exercise.title}
                            </p>
                            <div className="flex items-center gap-1 flex-wrap mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getWorkoutTypeLabel(exercise.workoutType)}
                              </Badge>
                              {exercise.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {exercise.category}
                                </Badge>
                              )}
                              {exercise.isSystem && (
                                <Badge variant="default" className="text-xs">
                                  {t('system')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommendation Dialog */}
      <Dialog
        open={recommendationDialogOpen}
        onOpenChange={setRecommendationDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addExerciseGuide')}</DialogTitle>
            <DialogDescription>
              {t('addExerciseGuideDesc', { title: pendingExerciseTitle })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {Object.keys(
                RECOMMENDATION_TEMPLATES[
                  pendingExerciseType as keyof typeof RECOMMENDATION_TEMPLATES
                ] || {}
              ).map((field) => {
                const typedField = field as keyof RecommendationData;
                return (
                  <div key={field} className="space-y-1">
                    <Label className="text-sm font-medium">
                      {RECOMMENDATION_FIELD_LABELS[typedField]}
                    </Label>
                    <Input
                      placeholder={
                        RECOMMENDATION_FIELD_PLACEHOLDERS[typedField]
                      }
                      value={recommendationData[typedField] || ""}
                      onChange={(e) =>
                        handleRecommendationChange(typedField, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={handleCancelRecommendation}>
                <X className="h-4 w-4 mr-1" />
                {t('cancel')}
              </Button>
              <Button onClick={handleConfirmRecommendation}>
                <Check className="h-4 w-4 mr-1" />
                {t('addToRoutine')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
