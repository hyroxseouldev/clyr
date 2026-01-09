"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Search,
  Plus,
  Dumbbell,
  Edit,
  Trash2,
  GripVertical,
  Check,
  X,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { PaginatedRoutineBlocks } from "@/db/queries/routine-block";
import type { WorkoutLibraryItem } from "@/db/queries/workout-library";
import {
  createRoutineBlockAction,
  updateRoutineBlockAction,
  deleteRoutineBlockAction,
  addRoutineItemAction,
} from "@/actions/routine-block";
import { getWorkoutLibraryAction } from "@/actions/workout-library";

interface WorkoutRoutineClientProps {
  initialData: PaginatedRoutineBlocks | null;
  pageSize: number;
}

export function WorkoutRoutineClient({
  initialData,
  pageSize,
}: WorkoutRoutineClientProps) {
  const t = useTranslations('workoutRoutine');
  const tToast = useTranslations('toast');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [formatFilter, setFormatFilter] = useState(
    searchParams.get("format") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  // 선택된 블록
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const selectedBlock =
    initialData?.items.find((b) => b.id === selectedBlockId) || null;

  // 새 블록 생성 모달
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");
  const [newBlockFormat, setNewBlockFormat] = useState("STRENGTH");
  const [isCreating, setIsCreating] = useState(false);

  // 편집 모드
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editFormat, setEditFormat] = useState("");
  const [editTargetValue, setEditTargetValue] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 운동 추가 모달
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseLibrary, setExerciseLibrary] = useState<WorkoutLibraryItem[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const totalPages = initialData?.totalPages || 1;
  const items = initialData?.items || [];

  // 검색 핸들러
  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    if (formatFilter && formatFilter !== "all")
      params.set("format", formatFilter);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    setCurrentPage(1);
  };

  const handleFormatFilter = (value: string) => {
    setFormatFilter(value);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (value && value !== "all") params.set("format", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (formatFilter && formatFilter !== "all")
      params.set("format", formatFilter);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    setCurrentPage(page);
  };

  // 새 블록 생성
  const handleCreateBlock = async () => {
    if (!newBlockName.trim()) {
      toast.error(tCommon('required'));
      return;
    }

    setIsCreating(true);

    const result = await createRoutineBlockAction({
      name: newBlockName,
      workoutFormat: newBlockFormat,
    });

    setIsCreating(false);

    if (!result.success) {
      toast.error(result.message || `${tToast('error')}: ${tCommon('submit')}`);
      return;
    }

    toast.success(tToast('created'));
    setIsCreateModalOpen(false);
    setNewBlockName("");
    setNewBlockFormat("STRENGTH");
    router.refresh();
  };

  // 블록 선택
  const handleSelectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
    setIsEditMode(false);
    const block = items.find((b) => b.id === blockId);
    if (block) {
      setEditName(block.name);
      setEditFormat(block.workoutFormat);
      setEditTargetValue(block.targetValue || "");
      setEditDescription(block.description || "");
    }
  };

  // 편집 모드 시작
  const handleStartEdit = () => {
    setIsEditMode(true);
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (selectedBlock) {
      setEditName(selectedBlock.name);
      setEditFormat(selectedBlock.workoutFormat);
      setEditTargetValue(selectedBlock.targetValue || "");
      setEditDescription(selectedBlock.description || "");
    }
  };

  // 편집 저장
  const handleSaveEdit = async () => {
    if (!selectedBlockId) return;

    setIsSaving(true);

    const result = await updateRoutineBlockAction(selectedBlockId, {
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
    if (!selectedBlockId) return;

    const result = await deleteRoutineBlockAction(selectedBlockId);

    if (!result.success) {
      toast.error(result.message || `${tToast('error')}: ${tCommon('delete')}`);
      return;
    }

    toast.success(tToast('deleted'));
    setSelectedBlockId(null);
    router.refresh();
  };

  // 운동 라이브러리 불러오기
  const handleOpenExerciseModal = async () => {
    setIsAddExerciseModalOpen(true);
    setIsLoadingExercises(true);

    const result = await getWorkoutLibraryAction({ search: exerciseSearch });

    setIsLoadingExercises(false);

    if (result.success && result.data) {
      setExerciseLibrary(result.data.items);
    }
  };

  // 운동 검색
  const handleSearchExercise = async (value: string) => {
    setExerciseSearch(value);
    setIsLoadingExercises(true);

    const result = await getWorkoutLibraryAction({ search: value });

    setIsLoadingExercises(false);

    if (result.success && result.data) {
      setExerciseLibrary(result.data.items);
    }
  };

  // 운동 추가
  const handleAddExercise = async () => {
    if (!selectedBlockId || !selectedExerciseId) {
      toast.error(tCommon('required'));
      return;
    }

    const result = await addRoutineItemAction({
      blockId: selectedBlockId,
      libraryId: selectedExerciseId,
    });

    if (!result.success) {
      toast.error(result.message || `${tToast('error')}: ${tCommon('submit')}`);
      return;
    }

    toast.success(tToast('created'));
    setSelectedExerciseId(null);
    setIsAddExerciseModalOpen(false);
    setExerciseSearch("");
    router.refresh();
  };

  // 루틴 아이템 삭제
  const handleDeleteRoutineItem = async (itemId: string) => {
    // TODO: deleteRoutineItemAction 호출 필요
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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis-start");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis-end");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />{t('newBlock')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('newBlockTitle')}</DialogTitle>
              <DialogDescription>
                {t('newBlockDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('blockName')}</Label>
                <Input
                  placeholder={t('blockNamePlaceholder')}
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('workoutFormat')}</Label>
                <Select
                  value={newBlockFormat}
                  onValueChange={setNewBlockFormat}
                >
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
              </div>
              <Button
                onClick={handleCreateBlock}
                disabled={isCreating || !newBlockName.trim()}
                className="w-full"
              >
                {isCreating ? t('creating') : t('create')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 루틴 블록 리스트 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 검색 & 필터 */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('blockNameSearchPlaceholder')}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={formatFilter || "all"}
              onValueChange={handleFormatFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('formatFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                {getWorkoutFormats().map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 블록 목록 */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {search || formatFilter
                      ? t('noSearchResults')
                      : t('noBlocks')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              items.map((block) => (
                <Card
                  key={block.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedBlockId === block.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectBlock(block.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">
                            {getFormatLabel(block.workoutFormat)}
                          </Badge>
                          {block.isLeaderboardEnabled && (
                            <Badge variant="default">{t('leaderboard')}</Badge>
                          )}
                        </div>
                        <CardTitle className="text-base">
                          {block.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {t('exerciseCount', { count: block.itemCount })}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {getPageNumbers().map((page, index) => {
                  if (typeof page === "string") {
                    return (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        {/* 우측: 블록 상세 편집 */}
        <div className="lg:col-span-2">
          {!selectedBlock ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">{t('selectBlock')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('selectBlockDesc')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('blockDetail')}</CardTitle>
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
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {isSaving ? t('saving') : t('save')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStartEdit}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t('edit')}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t('delete')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('deleteBlock')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('deleteConfirm')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteBlock}>
                                {t('delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 블록 정보 */}
                <div className="space-y-4">
                  <div>
                    <Label>{t('blockName')}</Label>
                    {isEditMode ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder={t('blockName')}
                      />
                    ) : (
                      <p className="text-sm font-medium">
                        {selectedBlock.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('workoutFormat')}</Label>
                      {isEditMode ? (
                        <Select
                          value={editFormat}
                          onValueChange={setEditFormat}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getWorkoutFormats().map((format) => (
                              <SelectItem
                                key={format.value}
                                value={format.value}
                              >
                                {format.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary">
                          {getFormatLabel(selectedBlock.workoutFormat)}
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
                          {selectedBlock.targetValue || "-"}
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
                        {selectedBlock.description || "-"}
                      </p>
                    )}
                  </div>
                </div>

                {/* 운동 목록 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t('includedExercises')}</h3>
                    <Button size="sm" variant="outline" onClick={handleOpenExerciseModal}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t('addExercise')}
                    </Button>
                  </div>

                  {selectedBlock.items.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {t('noExercises')}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {selectedBlock.items.map((item, index) => (
                        <Card key={item.id}>
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
                                onClick={() => handleDeleteRoutineItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 운동 추가 모달 */}
      <Dialog open={isAddExerciseModalOpen} onOpenChange={setIsAddExerciseModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('addExerciseTitle')}</DialogTitle>
            <DialogDescription>
              {t('addExerciseDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('exerciseSearchPlaceholder')}
                value={exerciseSearch}
                onChange={(e) => handleSearchExercise(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 운동 목록 */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {isLoadingExercises ? (
                <div className="py-8 text-center text-muted-foreground">
                  {t('loading')}
                </div>
              ) : exerciseLibrary.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Dumbbell className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">
                    {exerciseSearch ? t('noSearchResults') : t('libraryEmpty')}
                  </p>
                </div>
              ) : (
                exerciseLibrary.map((exercise) => (
                  <Card
                    key={exercise.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedExerciseId === exercise.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedExerciseId(exercise.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">{exercise.title}</p>
                            {exercise.category && (
                              <Badge variant="secondary" className="text-xs">
                                {exercise.category}
                              </Badge>
                            )}
                          </div>
                          {exercise.workoutType && (
                            <p className="text-xs text-muted-foreground">
                              {t('typeLabel', { type: exercise.workoutType })}
                            </p>
                          )}
                          {exercise.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {exercise.description}
                            </p>
                          )}
                        </div>
                        {selectedExerciseId === exercise.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* 추가 버튼 */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddExerciseModalOpen(false);
                  setSelectedExerciseId(null);
                  setExerciseSearch("");
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleAddExercise}
                disabled={!selectedExerciseId}
              >
                {t('addExercise')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
