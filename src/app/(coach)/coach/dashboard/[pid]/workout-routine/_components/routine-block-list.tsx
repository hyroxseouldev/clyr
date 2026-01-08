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
import {
  Search,
  Plus,
  Dumbbell,
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { PaginatedRoutineBlocks } from "@/db/queries/routineBlock";
import { createRoutineBlockAction } from "@/actions/routineBlock";

interface RoutineBlockListProps {
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

export function RoutineBlockList({
  initialData,
  pageSize,
}: RoutineBlockListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [formatFilter, setFormatFilter] = useState(
    searchParams.get("format") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  // 새 블록 생성 모달
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");
  const [newBlockFormat, setNewBlockFormat] = useState("STRENGTH");
  const [isCreating, setIsCreating] = useState(false);

  const totalPages = initialData?.totalPages || 1;
  const items = initialData?.items || [];

  // 검색 핸들러
  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    if (formatFilter && formatFilter !== "all") params.set("format", formatFilter);
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
    if (formatFilter && formatFilter !== "all") params.set("format", formatFilter);
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

    const result = await createRoutineBlockAction({
      name: newBlockName,
      workoutFormat: newBlockFormat,
    });

    setIsCreating(false);

    if (!result.success) {
      toast.error(result.message || "생성에 실패했습니다");
      return;
    }

    toast.success("루틴 블록이 생성되었습니다");
    setIsCreateModalOpen(false);
    setNewBlockName("");
    setNewBlockFormat("STRENGTH");
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
              <Plus className="h-4 w-4 mr-2" />
              새 블록 만들기
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

      {/* 검색 & 필터 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
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
          <SelectTrigger className="w-[200px]">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
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
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              onClick={() => router.push(`workout-routine/${block.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">
                        {getFormatLabel(block.workoutFormat)}
                      </Badge>
                      {block.isLeaderboardEnabled && (
                        <Badge variant="default">리더보드</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{block.name}</CardTitle>
                    <CardDescription className="text-xs">
                      운동 {block.itemCount}개
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {block.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {block.description}
                  </p>
                </CardContent>
              )}
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
                  currentPage < totalPages && handlePageChange(currentPage + 1)
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
  );
}
