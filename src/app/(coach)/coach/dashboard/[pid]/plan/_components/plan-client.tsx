"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Plus,
  Calendar,
  Dumbbell,
  FileText,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  createPhaseAction,
  deletePhaseAction,
  updateProgramBlueprintAction,
  getProgramPlanDataAction,
} from "@/actions/programBlueprint";
import { getRoutineBlocksAction } from "@/actions/routineBlock";
import type {
  ProgramPlanData,
  ProgramBlueprintGroupedByPhase,
  ProgramBlueprintWithBlock,
} from "@/db/queries/programBlueprint";
import type { RoutineBlockWithItems } from "@/db/queries/routineBlock";

interface PlanClientProps {
  programId: string;
  initialData: ProgramPlanData | null;
}

export function PlanClient({ programId, initialData }: PlanClientProps) {
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
      toast.error("이미 존재하는 페이즈 번호입니다.");
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
      toast.error(result.message || "페이즈 생성에 실패했습니다.");
      return;
    }

    toast.success("페이즈가 생성되었습니다.");
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
      toast.error(result.message || "페이즈 삭제에 실패했습니다.");
      setIsDeletePhaseOpen(false);
      setPhaseToDelete(null);
      return;
    }

    toast.success("페이즈가 삭제되었습니다.");

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

  // 블루프린트 카드 클릭 핸들러
  const handleBlueprintClick = (blueprint: ProgramBlueprintWithBlock) => {
    setSelectedBlueprint(blueprint);
    setIsBlueprintModalOpen(true);
  };

  // 루틴 블록이 없는 날은 "휴식일"로 표시
  const getDayTypeLabel = (blueprint: ProgramBlueprintWithBlock) => {
    if (!blueprint.routineBlockId) {
      return { label: "휴식일", variant: "secondary" as const };
    }
    return {
      label: blueprint.routineBlockFormat || "운동",
      variant: "default" as const,
    };
  };

  if (!planData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">
            플랜 데이터를 불러올 수 없습니다
          </p>
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
            {planData.programTitle} - 프로그램 플랜
          </h1>
          <p className="text-muted-foreground">
            총 {planData.durationWeeks}주 프로그램의 운동 일정을 설계하세요
          </p>
        </div>
        <Dialog open={isCreatePhaseOpen} onOpenChange={setIsCreatePhaseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />새 페이즈 만들기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 페이즈 만들기</DialogTitle>
              <DialogDescription>
                새로운 페이즈를 생성하고 일차를 추가합니다
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>페이즈 번호</Label>
                <Input
                  type="number"
                  min="1"
                  value={newPhaseNumber}
                  onChange={(e) =>
                    setNewPhaseNumber(parseInt(e.target.value) || 1)
                  }
                  placeholder="예: 1"
                />
              </div>
              <div className="space-y-2">
                <Label>일차 수</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={newDayCount}
                  onChange={(e) =>
                    setNewDayCount(parseInt(e.target.value) || 7)
                  }
                  placeholder="예: 7 (일주일)"
                />
              </div>
              <Button
                onClick={handleCreatePhase}
                disabled={isCreatingPhase}
                className="w-full"
              >
                {isCreatingPhase ? "생성 중..." : "페이즈 생성하기"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 프로그램 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>프로그램 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">페이즈 수</p>
              <p className="text-lg font-semibold">
                {planData.blueprints.length}개
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 일차</p>
              <p className="text-lg font-semibold">
                {planData.blueprints.reduce(
                  (sum, bp) => sum + bp.days.length,
                  0
                )}
                일
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
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "calendar")}>
                <TabsList>
                  <TabsTrigger value="grid">그리드</TabsTrigger>
                  <TabsTrigger value="calendar">캘린더</TabsTrigger>
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
                페이즈 삭제
              </Button>
            </div>
          </div>

          {/* 그리드 뷰 */}
          {viewMode === "grid" && selectedPhaseData && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  Phase {selectedPhaseData.phaseNumber} -{" "}
                  {selectedPhaseData.days.length}일차
                </h3>
                <p className="text-sm text-muted-foreground">
                  각 카드를 클릭하여 루틴 블록을 지정하거나 편집하세요
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {selectedPhaseData.days.map((blueprint) => {
                  const dayType = getDayTypeLabel(blueprint);

                  return (
                    <Card
                      key={blueprint.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleBlueprintClick(blueprint)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                Day {blueprint.dayNumber}
                              </Badge>
                              <Badge variant={dayType.variant}>
                                {dayType.label}
                              </Badge>
                            </div>
                            <CardTitle className="text-base line-clamp-2">
                              {blueprint.dayTitle ||
                                `Day ${blueprint.dayNumber}`}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {blueprint.routineBlockName ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Dumbbell className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {blueprint.routineBlockName}
                              </span>
                            </div>
                            {blueprint.notes && (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">
                                  {blueprint.notes}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            루틴 블록을 지정해주세요
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 캘린더 뷰 */}
          {viewMode === "calendar" && selectedPhaseData && (
            <CalendarView
              phaseData={selectedPhaseData}
              onDayClick={handleBlueprintClick}
              getDayTypeLabel={getDayTypeLabel}
            />
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">아직 페이즈가 없습니다</p>
            <p className="text-sm text-muted-foreground mt-2">
              새 페이즈를 만들어서 프로그램을 시작하세요
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
            <DialogTitle>페이즈 삭제</DialogTitle>
            <DialogDescription>
              페이즈 {phaseToDelete}를 삭제하시겠습니까?
              <br />
              <span className="text-destructive font-medium">
                이 작업은 되돌릴 수 없습니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={confirmDeletePhase}
              className="flex-1"
            >
              삭제
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeletePhaseOpen(false);
                setPhaseToDelete(null);
              }}
              className="flex-1"
            >
              취소
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
  getDayTypeLabel: (blueprint: ProgramBlueprintWithBlock) => {
    label: string;
    variant: "default" | "secondary";
  };
}

function CalendarView({
  phaseData,
  onDayClick,
  getDayTypeLabel,
}: CalendarViewProps) {
  // 일차를 주차별로 그룹화 (7일 단위)
  const weeks: ProgramBlueprintWithBlock[][] = [];
  for (let i = 0; i < phaseData.days.length; i += 7) {
    weeks.push(phaseData.days.slice(i, i + 7));
  }

  // 요일 표시
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Phase {phaseData.phaseNumber} - 캘린더 뷰
        </h3>
        <p className="text-sm text-muted-foreground">
          주차별 캘린더에서 운동 일정을 확인하세요
        </p>
      </div>

      {weeks.map((week, weekIndex) => (
        <Card key={weekIndex}>
          <CardHeader>
            <CardTitle className="text-base">
              {weekIndex + 1}주차
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Day {weekIndex * 7 + 1} - Day {Math.min((weekIndex + 1) * 7, phaseData.days.length)})
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
                const dayType = getDayTypeLabel(blueprint);
                const isRestDay = !blueprint.routineBlockId;

                return (
                  <div
                    key={blueprint.id}
                    onClick={() => onDayClick(blueprint)}
                    className={`
                      min-h-[120px] p-2 rounded-md border cursor-pointer
                      transition-all hover:shadow-md hover:border-primary/50
                      ${isRestDay ? "bg-muted/50 border-muted" : "bg-background"}
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
                            휴식
                          </Badge>
                        )}
                      </div>

                      {/* 일차 제목 */}
                      <p className="text-xs font-medium line-clamp-2 mt-1">
                        {blueprint.dayTitle || `Day ${blueprint.dayNumber}`}
                      </p>

                      {/* 루틴 블록 정보 */}
                      {blueprint.routineBlockName && (
                        <div className="mt-auto">
                          <div className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {blueprint.routineBlockName}
                            </p>
                          </div>
                          {blueprint.notes && (
                            <div className="flex items-start gap-1 mt-1">
                              <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
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
  const [dayTitle, setDayTitle] = useState(blueprint.dayTitle || "");
  const [notes, setNotes] = useState(blueprint.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  // 루틴 블록 해제 확인 모달
  const [isRemoveBlockOpen, setIsRemoveBlockOpen] = useState(false);

  // 루틴 블록 선택
  const [isBlockSelectorOpen, setIsBlockSelectorOpen] = useState(false);
  const [routineBlocks, setRoutineBlocks] = useState<RoutineBlockWithItems[]>(
    []
  );
  const [blockSearch, setBlockSearch] = useState("");
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    blueprint.routineBlockId || null
  );

  // 루틴 블록 목록 로드
  const loadRoutineBlocks = async () => {
    setIsLoadingBlocks(true);
    const result = await getRoutineBlocksAction({ pageSize: 100 });
    setIsLoadingBlocks(false);

    if (result.success && result.data) {
      setRoutineBlocks(result.data.items);
    }
  };

  // 루틴 블록 선택 모달이 열릴 때 블록 목록 로드
  const handleBlockSelectorOpen = () => {
    loadRoutineBlocks();
    setIsBlockSelectorOpen(true);
  };

  // 루틴 블록 선택 핸들러
  const handleBlockSelect = async (blockId: string) => {
    setIsSaving(true);

    const result = await updateProgramBlueprintAction(blueprint.id, {
      routineBlockId: blockId || null,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || "루틴 블록 지정에 실패했습니다.");
      return;
    }

    toast.success("루틴 블록이 지정되었습니다.");
    setSelectedBlockId(blockId);
    setIsBlockSelectorOpen(false);
    onSave();
  };

  // 루틴 블록 제거 핸들러
  const handleBlockRemove = () => {
    setIsRemoveBlockOpen(true);
  };

  // 루틴 블록 제거 확인 핸들러
  const confirmBlockRemove = async () => {
    setIsSaving(true);

    const result = await updateProgramBlueprintAction(blueprint.id, {
      routineBlockId: null,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || "루틴 블록 해제에 실패했습니다.");
      setIsRemoveBlockOpen(false);
      return;
    }

    toast.success("루틴 블록이 해제되었습니다.");
    setSelectedBlockId(null);
    setIsRemoveBlockOpen(false);
    onSave();
  };

  const handleSave = async () => {
    setIsSaving(true);

    const result = await updateProgramBlueprintAction(blueprint.id, {
      dayTitle: dayTitle || null,
      notes: notes || null,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || "저장에 실패했습니다.");
      return;
    }

    toast.success("저장되었습니다.");
    onOpenChange(false);
    onSave();
  };

  // 필터링된 루틴 블록 목록
  const filteredBlocks = routineBlocks.filter((block) =>
    block.name.toLowerCase().includes(blockSearch.toLowerCase())
  );

  // 선택된 블록 정보
  const selectedBlock = routineBlocks.find((b) => b.id === selectedBlockId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Day {blueprint.dayNumber} 편집</DialogTitle>
            <DialogDescription>
              일차 제목, 코치 노트, 루틴 블록을 지정하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* 일차 제목 */}
            <div className="space-y-2">
              <Label>일차 제목</Label>
              <Input
                placeholder="예: 하이록스 근지구력 테스트"
                value={dayTitle}
                onChange={(e) => setDayTitle(e.target.value)}
              />
            </div>

            {/* 코치 노트 */}
            <div className="space-y-2">
              <Label>코치 노트</Label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="해당 일차의 운동을 시작하기 전 회원이 읽어야 할 주의사항을 입력하세요"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* 루틴 블록 지정 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>루틴 블록</Label>
                <div className="flex gap-2">
                  {selectedBlockId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBlockRemove}
                      disabled={isSaving}
                      className="text-destructive hover:text-destructive"
                    >
                      해제
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBlockSelectorOpen}
                  >
                    {selectedBlockId ? "변경" : "선택"}
                  </Button>
                </div>
              </div>

              {selectedBlock ? (
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{selectedBlock.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedBlock.itemCount}개 운동 •{" "}
                    {selectedBlock.workoutFormat}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground">
                    루틴 블록을 선택해주세요
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
                {isSaving ? "저장 중..." : "저장하기"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 루틴 블록 선택 모달 */}
      <Dialog open={isBlockSelectorOpen} onOpenChange={setIsBlockSelectorOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>루틴 블록 선택</DialogTitle>
            <DialogDescription>
              이 일차에 지정할 루틴 블록을 선택하세요
            </DialogDescription>
          </DialogHeader>

          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="블록 이름 검색..."
              value={blockSearch}
              onChange={(e) => setBlockSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 블록 목록 */}
          <div className="flex-1 overflow-y-auto space-y-2 mt-4">
            {isLoadingBlocks ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            ) : filteredBlocks.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {blockSearch
                    ? "검색 결과가 없습니다"
                    : "루틴 블록이 없습니다"}
                </p>
              </div>
            ) : (
              filteredBlocks.map((block) => (
                <Card
                  key={block.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleBlockSelect(block.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {block.workoutFormat}
                          </Badge>
                          {block.isLeaderboardEnabled && (
                            <Badge variant="default">리더보드</Badge>
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
                      <span>운동 {block.itemCount}개</span>
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
            <DialogTitle>루틴 블록 해제</DialogTitle>
            <DialogDescription>
              루틴 블록 지정을 해제하시겠습니까?
              <br />
              <span className="text-destructive font-medium">
                이 작업은 되돌릴 수 없습니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={confirmBlockRemove}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? "해제 중..." : "해제"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsRemoveBlockOpen(false)}
              disabled={isSaving}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
