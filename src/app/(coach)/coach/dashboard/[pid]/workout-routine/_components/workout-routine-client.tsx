"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import type { PaginatedRoutineBlocks } from "@/db/queries/routineBlock";

interface WorkoutRoutineClientProps {
  initialData: PaginatedRoutineBlocks | null;
  pageSize: number;
}

const WORKOUT_FORMATS = [
  { value: "STRENGTH", label: "Strength (중량)" },
  { value: "FOR_TIME", label: "For Time (빠른순)" },
  { value: "AMRAP", label: "AMRAP (회수순)" },
  { value: "EMOM", label: "EMOM (분당회수)" },
  { value: "CUSTOM", label: "Custom" },
];

export function WorkoutRoutineClient({
  initialData,
  pageSize,
}: WorkoutRoutineClientProps) {
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
      toast.error("블록 이름을 입력해주세요");
      return;
    }

    setIsCreating(true);
    // TODO: API 호출
    setTimeout(() => {
      toast.success("루틴 블록이 생성되었습니다");
      setIsCreateModalOpen(false);
      setNewBlockName("");
      setNewBlockFormat("STRENGTH");
      setIsCreating(false);
      router.refresh();
    }, 1000);
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
    // TODO: API 호출
    setTimeout(() => {
      toast.success("저장되었습니다");
      setIsEditMode(false);
      setIsSaving(false);
      router.refresh();
    }, 1000);
  };

  // 블록 삭제
  const handleDeleteBlock = async () => {
    if (!selectedBlockId) return;

    // TODO: API 호출
    toast.success("삭제되었습니다");
    setSelectedBlockId(null);
    router.refresh();
  };

  const getFormatLabel = (format: string) => {
    return WORKOUT_FORMATS.find((f) => f.value === format)?.label || format;
  };

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
          <h1 className="text-2xl font-bold">루틴 블록 관리</h1>
          <p className="text-muted-foreground">
            재사용 가능한 운동 루틴을 만들고 관리하세요
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />새 블록 만들기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 루틴 블록 만들기</DialogTitle>
              <DialogDescription>
                재사용 가능한 운동 루틴 블록을 생성합니다
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>블록 이름</Label>
                <Input
                  placeholder="예: [하체] 스쿼트 집중 파워"
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>운동 포맷</Label>
                <Select
                  value={newBlockFormat}
                  onValueChange={setNewBlockFormat}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKOUT_FORMATS.map((format) => (
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
                {isCreating ? "생성 중..." : "생성하기"}
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
                placeholder="블록 이름 검색..."
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
                <SelectValue placeholder="포맷 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {WORKOUT_FORMATS.map((format) => (
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
                      ? "검색 결과가 없습니다"
                      : "루틴 블록이 없습니다"}
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
                            <Badge variant="default">리더보드</Badge>
                          )}
                        </div>
                        <CardTitle className="text-base">
                          {block.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          운동 {block.itemCount}개
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
                <p className="text-lg font-medium">블록을 선택해주세요</p>
                <p className="text-sm text-muted-foreground mt-2">
                  좌측 목록에서 루틴 블록을 선택하면 상세 내용을 볼 수 있습니다
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>블록 상세</CardTitle>
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
                          취소
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {isSaving ? "저장 중..." : "저장"}
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
                          편집
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              삭제
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>블록 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                정말로 이 루틴 블록을 삭제하시겠습니까? 이
                                작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteBlock}>
                                삭제
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
                    <Label>블록 이름</Label>
                    {isEditMode ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="블록 이름"
                      />
                    ) : (
                      <p className="text-sm font-medium">
                        {selectedBlock.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>운동 포맷</Label>
                      {isEditMode ? (
                        <Select
                          value={editFormat}
                          onValueChange={setEditFormat}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WORKOUT_FORMATS.map((format) => (
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
                      <Label>목표값</Label>
                      {isEditMode ? (
                        <Input
                          value={editTargetValue}
                          onChange={(e) => setEditTargetValue(e.target.value)}
                          placeholder="예: 20min, 5 rounds"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {selectedBlock.targetValue || "-"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>설명</Label>
                    {isEditMode ? (
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="블록에 대한 설명"
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
                    <h3 className="text-lg font-semibold">포함된 운동</h3>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      운동 추가
                    </Button>
                  </div>

                  {selectedBlock.items.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          추가된 운동이 없습니다
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
                                  {item.libraryTitle || "알 수 없는 운동"}
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
    </div>
  );
}
