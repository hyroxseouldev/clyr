"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import dynamic from "next/dynamic";

// Dynamic import TiptapEditor to avoid SSR issues
const TiptapEditor = dynamic(
  () => import("@/components/tiptap").then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border border-input rounded-md p-4 min-h-[150px] bg-muted animate-pulse" />
    ),
  }
);
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SessionTitleInput } from "@/components/ui/session-title-input";
import {
  Plus,
  Calendar,
  Dumbbell,
  FileText,
  Trash2,
  Search,
  GripVertical,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  createPhaseAction,
  deletePhaseAction,
  updateProgramBlueprintAction,
  getProgramPlanDataAction,
  addDayToPhaseAction,
  deleteProgramBlueprintAction,
} from "@/actions/program-blueprint";
import { getRoutineBlocksAction } from "@/actions/routine-block";
import {
  createBlueprintSectionAction,
  updateBlueprintSectionAction,
  deleteBlueprintSectionAction,
  reorderBlueprintSectionsAction,
  getBlueprintSectionsAction,
} from "@/actions/blueprint-sections";
import type {
  ProgramPlanData,
  ProgramBlueprintGroupedByPhase,
  ProgramBlueprintWithBlock,
} from "@/db/queries/program-blueprint";
import { cn } from "@/lib/utils";
import type { RoutineBlockWithItems } from "@/db/queries/routine-block";

interface PlanClientProps {
  programId: string;
  initialData: ProgramPlanData | null;
}

export function PlanClient({ programId, initialData }: PlanClientProps) {
  const tToast = useTranslations("toast");
  const tPlan = useTranslations("plan");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [planData, setPlanData] = useState<ProgramPlanData | null>(initialData);
  const [selectedPhase, setSelectedPhase] = useState<number>(
    initialData?.blueprints[0]?.phaseNumber || 1
  );
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");

  // 페이즈 생성 모달
  const [isCreatePhaseOpen, setIsCreatePhaseOpen] = useState(false);
  const [newPhaseNumber, setNewPhaseNumber] = useState(1);
  const [newDayCount, setNewDayCount] = useState(7);
  const [isCreatingPhase, setIsCreatingPhase] = useState(false);

  // 블루프린트 편집 모달
  const [selectedBlueprint, setSelectedBlueprint] =
    useState<ProgramBlueprintWithBlock | null>(null);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);

  // 페이즈 삭제 확인 모달
  const [isDeletePhaseOpen, setIsDeletePhaseOpen] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState<number | null>(null);

  // 일차 추가/삭제 관련
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<ProgramBlueprintWithBlock | null>(null);
  const [isDeleteDayOpen, setIsDeleteDayOpen] = useState(false);

  const selectedPhaseData = planData?.blueprints.find(
    (bp) => bp.phaseNumber === selectedPhase
  );

  // 데이터 다시 로드
  const refreshPlanData = async () => {
    const result = await getProgramPlanDataAction(programId);
    if (result.success && result.data) {
      setPlanData(result.data);
    }
  };

  // 페이즈 생성 핸들러
  const handleCreatePhase = async () => {
    if (planData?.blueprints.some((bp) => bp.phaseNumber === newPhaseNumber)) {
      toast.error(tToast("phaseExists"));
      return;
    }

    setIsCreatingPhase(true);

    const result = await createPhaseAction({
      programId,
      phaseNumber: newPhaseNumber,
      dayCount: newDayCount,
    });

    setIsCreatingPhase(false);

    if (!result.success) {
      toast.error(result.message || tToast("phaseCreateFailed"));
      return;
    }

    toast.success(tToast("phaseCreated"));
    setIsCreatePhaseOpen(false);

    // 데이터 다시 로드
    await refreshPlanData();

    // 새로 생성된 페이즈로 선택
    setSelectedPhase(newPhaseNumber);
  };

  // 페이즈 삭제 핸들러
  const handleDeletePhase = async (phaseNumber: number) => {
    // 삭제 확인 모달 열기
    setPhaseToDelete(phaseNumber);
    setIsDeletePhaseOpen(true);
  };

  // 페이즈 삭제 확인 핸들러
  const confirmDeletePhase = async () => {
    if (phaseToDelete === null) return;

    const result = await deletePhaseAction(programId, phaseToDelete);

    if (!result.success) {
      toast.error(result.message || tToast("phaseDeleteFailed"));
      setIsDeletePhaseOpen(false);
      setPhaseToDelete(null);
      return;
    }

    toast.success(tToast("phaseDeleted"));

    // 데이터 다시 로드
    await refreshPlanData();

    // 삭제된 페이즈가 선택되어 있으면 첫 번째 페이즈로 이동
    if (selectedPhase === phaseToDelete) {
      const remainingPhases = planData?.blueprints.filter(
        (bp) => bp.phaseNumber !== phaseToDelete
      );
      if (remainingPhases && remainingPhases.length > 0) {
        setSelectedPhase(remainingPhases[0].phaseNumber);
      }
    }

    setIsDeletePhaseOpen(false);
    setPhaseToDelete(null);
  };

  // 일차 추가 핸들러
  const handleAddDay = async () => {
    if (!selectedPhaseData || selectedPhaseData.days.length >= 7) {
      toast.error(tToast("maxDaysReached"));
      return;
    }

    setIsAddingDay(true);

    const result = await addDayToPhaseAction({
      programId,
      phaseNumber: selectedPhase,
    });

    setIsAddingDay(false);

    if (!result.success) {
      toast.error(result.message || tToast("addDayFailed"));
      return;
    }

    toast.success(tToast("dayAdded"));
    await refreshPlanData();
  };

  // 일차 삭제 핸들러
  const handleDeleteDay = (blueprint: ProgramBlueprintWithBlock) => {
    setDayToDelete(blueprint);
    setIsDeleteDayOpen(true);
  };

  // 일차 삭제 확인 핸들러
  const confirmDeleteDay = async () => {
    if (!dayToDelete) return;

    const result = await deleteProgramBlueprintAction(dayToDelete.id, programId);

    if (!result.success) {
      toast.error(result.message || tToast("deleteDayFailed"));
      return;
    }

    toast.success(tToast("dayDeleted"));
    await refreshPlanData();
    setIsDeleteDayOpen(false);
    setDayToDelete(null);
  };

  // 블루프린트 카드 클릭 핸들러
  const handleBlueprintClick = (blueprint: ProgramBlueprintWithBlock) => {
    setSelectedBlueprint(blueprint);
    setIsBlueprintModalOpen(true);
  };

  if (!planData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">{tPlan("cannotLoadPlan")}</p>
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
            {planData.programTitle} - {tPlan("title")}
          </h1>
          <p className="text-muted-foreground">
            {tPlan("subtitle", { weeks: planData.durationWeeks })}
          </p>
        </div>
        <Dialog open={isCreatePhaseOpen} onOpenChange={setIsCreatePhaseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {tPlan("createPhase")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tPlan("createPhase")}</DialogTitle>
              <DialogDescription>{tPlan("createPhaseDesc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{tPlan("phaseNumber")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={newPhaseNumber}
                  onChange={(e) =>
                    setNewPhaseNumber(parseInt(e.target.value) || 1)
                  }
                  placeholder={tPlan("phaseNumberPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{tPlan("dayCount")}</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={newDayCount}
                  onChange={(e) =>
                    setNewDayCount(parseInt(e.target.value) || 7)
                  }
                  placeholder={tPlan("dayCountPlaceholder")}
                />
              </div>
              <Button
                onClick={handleCreatePhase}
                disabled={isCreatingPhase}
                className="w-full"
              >
                {isCreatingPhase
                  ? tPlan("creating")
                  : tPlan("createPhaseButton")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 프로그램 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{tPlan("programInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {tPlan("phaseCount")}
              </p>
              <p className="text-lg font-semibold">
                {planData.blueprints.length}
                {tPlan("phaseUnit")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {tPlan("totalDays")}
              </p>
              <p className="text-lg font-semibold">
                {planData.blueprints.reduce(
                  (sum, bp) => sum + bp.days.length,
                  0
                )}
                {tPlan("dayUnit")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 뷰 모드 및 페이즈 탭 */}
      {planData.blueprints.length > 0 ? (
        <div className="space-y-6">
          {/* 뷰 모드 토글 및 페이즈 선택 */}
          <div className="flex items-center justify-between">
            <Tabs
              value={selectedPhase.toString()}
              onValueChange={(v) => setSelectedPhase(parseInt(v))}
            >
              <TabsList>
                {planData.blueprints.map((phase) => (
                  <TabsTrigger
                    key={phase.phaseNumber}
                    value={phase.phaseNumber.toString()}
                  >
                    Phase {phase.phaseNumber}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              {/* 뷰 모드 토글 */}
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as "grid" | "calendar")}
              >
                <TabsList>
                  <TabsTrigger value="grid">
                    {tPlan("viewMode.grid")}
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    {tPlan("viewMode.calendar")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* 페이즈 삭제 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeletePhase(selectedPhase)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {tPlan("deletePhase")}
              </Button>
            </div>
          </div>

          {/* 그리드 뷰 */}
          {viewMode === "grid" && selectedPhaseData && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {tPlan("dayView", {
                    phase: selectedPhaseData.phaseNumber,
                    days: Math.min(selectedPhaseData.days.length, 7),
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tPlan("dayViewDesc")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* 기존 일차 카드 (7일 제한) */}
                {selectedPhaseData.days.slice(0, 7).map((blueprint) => (
                  <Card
                    key={blueprint.id}
                    className="cursor-pointer hover:shadow-md transition-shadow relative group"
                    onClick={() => handleBlueprintClick(blueprint)}
                  >
                    {/* 삭제 버튼 - hover 시 표시 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDay(blueprint);
                      }}
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="bg-white border-2 border-transparent text-destructive rounded-full p-1.5 hover:bg-destructive hover:text-white hover:border-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </div>
                    </button>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 pr-8">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              Day {blueprint.dayNumber}
                            </Badge>
                          </div>
                          <CardTitle className="text-base line-clamp-2">
                            {blueprint.dayTitle || `Day ${blueprint.dayNumber}`}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {blueprint.routineBlocks &&
                      blueprint.routineBlocks.length > 0 ? (
                        <div className="space-y-2">
                          {blueprint.routineBlocks.map((block) => (
                            <div
                              key={block.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Dumbbell className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="font-medium truncate">
                                {block.name}
                              </span>
                            </div>
                          ))}
                          {blueprint.notes && (
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">
                                {blueprint.notes}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {tPlan("noRoutineBlock")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* 새 일차 추가 카드 (7일 미만일 때만) */}
                {selectedPhaseData.days.length < 7 && (
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow border-dashed"
                    onClick={handleAddDay}
                  >
                    <CardContent className="flex flex-col items-center justify-center min-h-[120px] text-muted-foreground hover:text-foreground transition-colors">
                      {isAddingDay ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
                      ) : (
                        <>
                          <Plus className="h-9 w-9 mb-1.5" />
                          <p className="font-medium text-sm">{tPlan("addNewDay")}</p>
                          <p className="text-xs">
                            {tPlan("addNewDayDesc", { current: selectedPhaseData.days.length })}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* 캘린더 뷰 */}
          {viewMode === "calendar" && selectedPhaseData && (
            <CalendarView
              phaseData={selectedPhaseData}
              onDayClick={handleBlueprintClick}
            />
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">{tPlan("noPhase")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {tPlan("createPhaseHint")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 블루프린트 편집 모달 */}
      {selectedBlueprint && (
        <BlueprintEditorModal
          key={selectedBlueprint.id}
          programId={programId}
          blueprint={selectedBlueprint}
          open={isBlueprintModalOpen}
          onOpenChange={setIsBlueprintModalOpen}
          onSave={refreshPlanData}
        />
      )}

      {/* 페이즈 삭제 확인 Dialog */}
      <Dialog open={isDeletePhaseOpen} onOpenChange={setIsDeletePhaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tPlan("deletePhase")}</DialogTitle>
            <DialogDescription>
              {tPlan("deletePhaseConfirm", { phase: phaseToDelete ?? 0 })}
              <br />
              <span className="text-destructive font-medium">
                {tPlan("deletePhaseWarning")}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={confirmDeletePhase}
              className="flex-1"
            >
              {tPlan("confirmDelete")}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeletePhaseOpen(false);
                setPhaseToDelete(null);
              }}
              className="flex-1"
            >
              {tPlan("cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 일차 삭제 확인 Dialog */}
      <Dialog open={isDeleteDayOpen} onOpenChange={setIsDeleteDayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tPlan("deleteDay")}</DialogTitle>
            <DialogDescription>
              {tPlan("deleteDayConfirm", { day: dayToDelete?.dayNumber ?? 0 })}
              <br />
              <span className="text-destructive font-medium">
                {tPlan("deleteDayWarning")}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={confirmDeleteDay}
              className="flex-1"
            >
              {tPlan("confirmDelete")}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDayOpen(false);
                setDayToDelete(null);
              }}
              className="flex-1"
            >
              {tPlan("cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 캘린더 뷰 컴포넌트
interface CalendarViewProps {
  phaseData: ProgramBlueprintGroupedByPhase;
  onDayClick: (blueprint: ProgramBlueprintWithBlock) => void;
}

function CalendarView({ phaseData, onDayClick }: CalendarViewProps) {
  const tPlan = useTranslations("plan");

  // 일차를 주차별로 그룹화 (7일 단위)
  const weeks: ProgramBlueprintWithBlock[][] = [];
  for (let i = 0; i < phaseData.days.length; i += 7) {
    weeks.push(phaseData.days.slice(i, i + 7));
  }

  // 요일 표시
  const weekDays = tPlan.raw("weekDays") as string[];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {tPlan("calendarView", { phase: phaseData.phaseNumber })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {tPlan("calendarViewDesc")}
        </p>
      </div>

      {weeks.map((week, weekIndex) => (
        <Card key={weekIndex}>
          <CardHeader>
            <CardTitle className="text-base">
              {tPlan("week", { week: weekIndex + 1 })}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Day {weekIndex * 7 + 1} - Day{" "}
                {Math.min((weekIndex + 1) * 7, phaseData.days.length)})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 캘린더 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {week.map((blueprint) => {
                const isRestDay =
                  !blueprint.routineBlocks ||
                  blueprint.routineBlocks.length === 0;

                return (
                  <div
                    key={blueprint.id}
                    onClick={() => onDayClick(blueprint)}
                    className={`
                      min-h-[120px] p-2 rounded-md border cursor-pointer
                      transition-all hover:shadow-md hover:border-primary/50
                      ${
                        isRestDay ? "bg-muted/50 border-muted" : "bg-background"
                      }
                    `}
                  >
                    <div className="space-y-1">
                      {/* Day 번호 */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          D{blueprint.dayNumber}
                        </Badge>
                        {isRestDay && (
                          <Badge variant="secondary" className="text-xs">
                            {tPlan("rest")}
                          </Badge>
                        )}
                      </div>

                      {/* 일차 제목 */}
                      <p className="text-xs font-medium line-clamp-2 mt-1">
                        {blueprint.dayTitle || `Day ${blueprint.dayNumber}`}
                      </p>

                      {/* 루틴 블록 정보 (support multiple blocks) */}
                      {blueprint.routineBlocks &&
                        blueprint.routineBlocks.length > 0 && (
                          <div className="mt-auto">
                            {blueprint.routineBlocks
                              .slice(0, 2)
                              .map((block) => (
                                <div
                                  key={block.id}
                                  className="flex items-center gap-1"
                                >
                                  <Dumbbell className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {block.name}
                                  </p>
                                </div>
                              ))}
                            {blueprint.routineBlocks.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{blueprint.routineBlocks.length - 2} more
                              </p>
                            )}
                            {blueprint.notes && (
                              <div className="flex items-start gap-1 mt-1">
                                <FileText className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {blueprint.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}

              {/* 빈 셀 채우기 (7일이 안 되는 경우) */}
              {Array.from({ length: 7 - week.length }).map((_, emptyIndex) => (
                <div
                  key={`empty-${emptyIndex}`}
                  className="min-h-[120px] p-2 rounded-md border border-dashed border-muted bg-muted/30"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 블루프린트 편집 모달 컴포넌트
interface BlueprintEditorModalProps {
  programId: string;
  blueprint: ProgramBlueprintWithBlock;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

function BlueprintEditorModal({
  programId,
  blueprint,
  open,
  onOpenChange,
  onSave,
}: BlueprintEditorModalProps) {
  const tToast = useTranslations("toast");
  const tPlan = useTranslations("plan");
  const tCommon = useTranslations("common");
  const [dayTitle, setDayTitle] = useState(blueprint.dayTitle || "");
  const [notes, setNotes] = useState(blueprint.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  // 루틴 블록 해제 확인 모달
  const [isRemoveBlockOpen, setIsRemoveBlockOpen] = useState(false);

  // 루틴 블록 선택 (support multiple blocks)
  const [isBlockSelectorOpen, setIsBlockSelectorOpen] = useState(false);
  const [routineBlocks, setRoutineBlocks] = useState<RoutineBlockWithItems[]>(
    []
  );
  const [blockSearch, setBlockSearch] = useState("");
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>(
    blueprint.routineBlocks?.map((rb) => rb.id) || []
  );
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  // Sections management
  const [sections, setSections] = useState<
    Array<{ id: string; title: string; content: string; orderIndex: number }>
  >(blueprint.sections || []);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<{
    id: string;
    title: string;
    content: string;
  } | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionContent, setNewSectionContent] = useState("");
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  // 루틴 블록 목록 로드
  const loadRoutineBlocks = async () => {
    setIsLoadingBlocks(true);
    const result = await getRoutineBlocksAction({ pageSize: 100 });
    setIsLoadingBlocks(false);

    if (result.success && result.data) {
      setRoutineBlocks(result.data.items);
    }
  };

  // Fix Issue 1: Load routine blocks when modal opens
  useEffect(() => {
    if (open && routineBlocks.length === 0) {
      loadRoutineBlocks();
    }
  }, [open]);

  // Load sections when modal opens
  useEffect(() => {
    if (open) {
      loadSections();
    }
  }, [open]);

  const loadSections = async () => {
    setIsLoadingSections(true);
    const result = await getBlueprintSectionsAction(blueprint.id);
    setIsLoadingSections(false);

    if (result.success && result.data) {
      setSections(result.data);
    }
  };

  // 루틴 블록 선택 모달이 열릴 때 블록 목록 로드
  const handleBlockSelectorOpen = () => {
    loadRoutineBlocks();
    setIsBlockSelectorOpen(true);
  };

  // 루틴 블록 추가 핸들러 (add to array)
  const handleBlockAdd = async (blockId: string) => {
    setIsSaving(true);

    const newBlockIds = [...selectedBlockIds, blockId];

    const result = await updateProgramBlueprintAction(blueprint.id, {
      routineBlockIds: newBlockIds,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || tToast("routineBlockAssignFailed"));
      return;
    }

    toast.success(tToast("routineBlockAssigned"));
    setSelectedBlockIds(newBlockIds);
    setIsBlockSelectorOpen(false);
    onSave();
  };

  // 루틴 블록 제거 핸들러 (remove from array)
  const handleBlockRemove = async (blockId: string) => {
    setIsSaving(true);

    const newBlockIds = selectedBlockIds.filter((id) => id !== blockId);

    const result = await updateProgramBlueprintAction(blueprint.id, {
      routineBlockIds: newBlockIds,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || tToast("routineBlockUnassignFailed"));
      return;
    }

    toast.success(tToast("routineBlockUnassigned"));
    setSelectedBlockIds(newBlockIds);
    onSave();
  };

  // 루틴 블록 모두 제거 핸들러
  const handleClearAllBlocks = () => {
    setIsRemoveBlockOpen(true);
  };

  // 루틴 블록 모두 제거 확인 핸들러
  const confirmClearAllBlocks = async () => {
    setIsSaving(true);

    const result = await updateProgramBlueprintAction(blueprint.id, {
      routineBlockIds: [],
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || tToast("routineBlockUnassignFailed"));
      setIsRemoveBlockOpen(false);
      return;
    }

    toast.success(tToast("routineBlockUnassigned"));
    setSelectedBlockIds([]);
    setIsRemoveBlockOpen(false);
    onSave();
  };

  // Drag and drop handlers (native HTML5 API)
  const handleDragStart = (blockId: string) => {
    setDraggedBlockId(blockId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === targetBlockId) {
      setDraggedBlockId(null);
      return;
    }

    const oldIndex = selectedBlockIds.indexOf(draggedBlockId);
    const newIndex = selectedBlockIds.indexOf(targetBlockId);

    if (oldIndex === -1 || newIndex === -1) {
      setDraggedBlockId(null);
      return;
    }

    // Reorder array
    const newIds = [...selectedBlockIds];
    const [removed] = newIds.splice(oldIndex, 1);
    newIds.splice(newIndex, 0, removed);

    setIsSaving(true);

    const result = await updateProgramBlueprintAction(blueprint.id, {
      routineBlockIds: newIds,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || tToast("routineBlockAssignFailed"));
      setDraggedBlockId(null);
      return;
    }

    setSelectedBlockIds(newIds);
    setDraggedBlockId(null);
    onSave();
  };

  // Section handlers
  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    setIsSaving(true);

    const result = await createBlueprintSectionAction({
      blueprintId: blueprint.id,
      programId: programId,
      title: newSectionTitle.trim(),
      content: newSectionContent,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || "섹션 추가에 실패했습니다.");
      return;
    }

    toast.success("섹션이 추가되었습니다.");
    setNewSectionTitle("");
    setNewSectionContent("");
    setIsSectionFormOpen(false);
    loadSections();
  };

  const handleEditSection = (section: {
    id: string;
    title: string;
    content: string;
  }) => {
    setEditingSection(section);
    setNewSectionTitle(section.title);
    setNewSectionContent(section.content);
    setIsSectionFormOpen(true);
  };

  const handleUpdateSection = async () => {
    if (!editingSection || !newSectionTitle.trim()) {
      return;
    }

    setIsSaving(true);

    const result = await updateBlueprintSectionAction(editingSection.id, {
      title: newSectionTitle.trim(),
      content: newSectionContent,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || "섹션 수정에 실패했습니다.");
      return;
    }

    toast.success("섹션이 수정되었습니다.");
    setEditingSection(null);
    setNewSectionTitle("");
    setNewSectionContent("");
    setIsSectionFormOpen(false);
    loadSections();
  };

  const handleDeleteSection = async (sectionId: string) => {
    setIsSaving(true);

    const result = await deleteBlueprintSectionAction(
      sectionId,
      blueprint.id,
      programId
    );

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || "섹션 삭제에 실패했습니다.");
      return;
    }

    toast.success("섹션이 삭제되었습니다.");
    loadSections();
  };

  // Section drag and drop handlers
  const handleSectionDragStart = (sectionId: string) => {
    setDraggedSectionId(sectionId);
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleSectionDrop = async (
    e: React.DragEvent,
    targetSectionId: string
  ) => {
    e.preventDefault();
    if (!draggedSectionId || draggedSectionId === targetSectionId) {
      setDraggedSectionId(null);
      return;
    }

    const oldIndex = sections.findIndex((s) => s.id === draggedSectionId);
    const newIndex = sections.findIndex((s) => s.id === targetSectionId);

    if (oldIndex === -1 || newIndex === -1) {
      setDraggedSectionId(null);
      return;
    }

    // Reorder array
    const newSections = [...sections];
    const [removed] = newSections.splice(oldIndex, 1);
    newSections.splice(newIndex, 0, removed);

    setIsSaving(true);

    const result = await reorderBlueprintSectionsAction({
      blueprintId: blueprint.id,
      programId: programId,
      sectionIds: newSections.map((s) => s.id),
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || "순서 변경에 실패했습니다.");
      setDraggedSectionId(null);
      return;
    }

    setSections(newSections);
    setDraggedSectionId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const result = await updateProgramBlueprintAction(blueprint.id, {
      dayTitle: dayTitle || null,
      notes: notes || null,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || `${tToast("error")}: ${tToast("saved")}`);
      return;
    }

    toast.success(tToast("saved"));
    onOpenChange(false);
    onSave();
  };

  // 필터링된 루틴 블록 목록 (exclude already selected)
  const filteredBlocks = routineBlocks.filter(
    (block) =>
      !selectedBlockIds.includes(block.id) &&
      block.name.toLowerCase().includes(blockSearch.toLowerCase())
  );

  // 선택된 블록들 정보
  const selectedBlocks = selectedBlockIds
    .map((id) => routineBlocks.find((b) => b.id === id))
    .filter((b): b is RoutineBlockWithItems => b !== undefined);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {tPlan("editDay", { day: blueprint.dayNumber })}
            </DialogTitle>
            <DialogDescription>{tPlan("editDayDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* 일차 제목 */}
            <div className="space-y-2">
              <Label>{tPlan("dayTitle")}</Label>
              <Input
                placeholder={tPlan("dayTitlePlaceholder")}
                value={dayTitle}
                onChange={(e) => setDayTitle(e.target.value)}
              />
            </div>

            {/* 코치 노트 */}
            <div className="space-y-2">
              <Label>{tPlan("coachNotes")}</Label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder={tPlan("coachNotesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* 루틴 블록 지정 (support multiple blocks with drag-and-drop) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{tPlan("routineBlock")}</Label>
                <div className="flex gap-2">
                  {selectedBlockIds.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllBlocks}
                      disabled={isSaving}
                      className="text-destructive hover:text-destructive"
                    >
                      {tPlan("unassign")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBlockSelectorOpen}
                  >
                    {selectedBlockIds.length > 0
                      ? tPlan("change")
                      : tPlan("select")}
                  </Button>
                </div>
              </div>

              {selectedBlocks.length > 0 ? (
                <div className="space-y-2">
                  {selectedBlocks.map((block, index) => {
                    const blockId = selectedBlockIds[index];
                    const isDragging = draggedBlockId === blockId;

                    return (
                      <div
                        key={blockId}
                        draggable
                        onDragStart={() => handleDragStart(blockId)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, blockId)}
                        className={cn(
                          "p-3 rounded-md flex items-center gap-2 transition-all",
                          isDragging ? "opacity-50" : "bg-muted",
                          !isDragging && "cursor-move hover:bg-muted/80"
                        )}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Dumbbell className="h-4 w-4 text-muted-foreground shrink-0" />
                            <p className="text-sm font-medium truncate">
                              {block.name}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {tPlan("exerciseCount", { count: block.itemCount })}{" "}
                            • {block.workoutFormat}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBlockRemove(blockId)}
                          disabled={isSaving}
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground">
                    {tPlan("selectRoutineBlock")}
                  </p>
                </div>
              )}
            </div>

            {/* Sections management */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{tPlan("sections") || "섹션"}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSection(null);
                    setNewSectionTitle("");
                    setNewSectionContent("");
                    setIsSectionFormOpen(true);
                  }}
                  disabled={isSaving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {tPlan("addSection") || "섹션 추가"}
                </Button>
              </div>

              {isLoadingSections ? (
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground">로딩 중...</p>
                </div>
              ) : sections.length > 0 ? (
                <div className="space-y-2">
                  {sections.map((section) => {
                    const isDragging = draggedSectionId === section.id;

                    return (
                      <div
                        key={section.id}
                        draggable
                        onDragStart={() => handleSectionDragStart(section.id)}
                        onDragOver={handleSectionDragOver}
                        onDrop={(e) => handleSectionDrop(e, section.id)}
                        className={cn(
                          "p-3 rounded-md border transition-all",
                          isDragging ? "opacity-50" : "bg-muted",
                          !isDragging && "cursor-move hover:bg-muted/80"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">
                              {section.title}
                            </h4>
                            {section.content && (
                              <div
                                className="text-xs text-muted-foreground line-clamp-2 mt-1"
                                dangerouslySetInnerHTML={{
                                  __html: section.content,
                                }}
                              />
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSection(section)}
                              disabled={isSaving}
                              className="h-8 w-8 p-0"
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSection(section.id)}
                              disabled={isSaving}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground">
                    {tPlan("noSections") || "추가된 섹션이 없습니다."}
                  </p>
                </div>
              )}
            </div>

            {/* 저장/취소 버튼 */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? tPlan("saving") : tPlan("saveButton")}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                {tPlan("cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 루틴 블록 선택 모달 */}
      <Dialog open={isBlockSelectorOpen} onOpenChange={setIsBlockSelectorOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{tPlan("selectRoutineBlockTitle")}</DialogTitle>
            <DialogDescription>
              {tPlan("selectRoutineBlockDesc")}
            </DialogDescription>
          </DialogHeader>

          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={tPlan("searchBlock")}
              value={blockSearch}
              onChange={(e) => setBlockSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 블록 목록 */}
          <div className="flex-1 overflow-y-auto space-y-2 mt-4">
            {isLoadingBlocks ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {tPlan("loadingBlocks")}
                </p>
              </div>
            ) : filteredBlocks.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {blockSearch
                    ? tPlan("noSearchResults")
                    : tPlan("noBlocksFound")}
                </p>
              </div>
            ) : (
              filteredBlocks.map((block) => (
                <Card
                  key={block.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleBlockAdd(block.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {block.workoutFormat}
                          </Badge>
                          {block.isLeaderboardEnabled && (
                            <Badge variant="default">
                              {tPlan("leaderboard")}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base">
                          {block.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Dumbbell className="h-4 w-4" />
                      <span>
                        {tPlan("exerciseCount", { count: block.itemCount })}
                      </span>
                    </div>
                    {block.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {block.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 루틴 블록 해제 확인 Dialog */}
      <Dialog open={isRemoveBlockOpen} onOpenChange={setIsRemoveBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tPlan("unassignBlockTitle")}</DialogTitle>
            <DialogDescription>
              {tPlan("unassignBlockConfirm")}
              <br />
              <span className="text-destructive font-medium">
                {tPlan("deletePhaseWarning")}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={confirmClearAllBlocks}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? tPlan("unassigning") : tPlan("unassign")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsRemoveBlockOpen(false)}
              disabled={isSaving}
              className="flex-1"
            >
              {tPlan("cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Section form dialog */}
      <Dialog
        open={isSectionFormOpen}
        onOpenChange={(open) => {
          setIsSectionFormOpen(open);
          if (!open) {
            // Reset form when dialog closes
            setEditingSection(null);
            setNewSectionTitle("");
            setNewSectionContent("");
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingSection
                ? tPlan("editSection") || "섹션 수정"
                : tPlan("addSection") || "섹션 추가"}
            </DialogTitle>
            <DialogDescription>
              {tPlan("sectionFormDesc") || "섹션의 제목과 내용을 입력하세요."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 mt-4">
            {/* Section title */}
            <SessionTitleInput
              value={newSectionTitle}
              onChange={setNewSectionTitle}
              label={tPlan("sectionTitle") || "제목"}
              disabled={isSaving}
            />

            {/* Section content (TipTap editor) */}
            <div className="space-y-2">
              <Label>{tPlan("sectionContent") || "내용"}</Label>
              <TiptapEditor
                content={newSectionContent}
                onChange={setNewSectionContent}
                placeholder={
                  tPlan("sectionContentPlaceholder") || "내용을 입력하세요"
                }
                editable={!isSaving}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={editingSection ? handleUpdateSection : handleAddSection}
              disabled={isSaving || !newSectionTitle.trim()}
              className="flex-1"
            >
              {isSaving
                ? tPlan("saving") || "저장 중..."
                : editingSection
                ? tPlan("update") || "수정"
                : tPlan("add") || "추가"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSectionFormOpen(false);
                setEditingSection(null);
                setNewSectionTitle("");
                setNewSectionContent("");
              }}
              disabled={isSaving}
              className="flex-1"
            >
              {tPlan("cancel") || "취소"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
