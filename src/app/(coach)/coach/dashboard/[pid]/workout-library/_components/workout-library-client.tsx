"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Search, Dumbbell, Video, Calendar, User, X } from "lucide-react";
import type { PaginatedWorkoutLibrary } from "@/db/queries/workout-library";

interface WorkoutLibraryClientProps {
  initialData: PaginatedWorkoutLibrary | null;
  filtersData: {
    categories: string[];
    workoutTypes: string[];
  };
  pageSize: number;
}

export function WorkoutLibraryClient({
  initialData,
  filtersData,
  pageSize,
}: WorkoutLibraryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  // 필터 상태
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );
  const [selectedWorkoutTypes, setSelectedWorkoutTypes] = useState<string[]>(
    searchParams.get("workoutTypes")?.split(",").filter(Boolean) || []
  );

  const totalPages = initialData?.totalPages || 1;
  const items = initialData?.items || [];

  // 워크아웃 타입 라벨 매핑
  const getWorkoutTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      WEIGHT_REPS: "무게/횟수",
      DURATION: "시간",
      DISTANCE: "거리",
    };
    return labels[type] || type;
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    updateFilters({ search: value });
  };

  // URL 업데이트 함수
  const updateFilters = (options: {
    search?: string;
    categories?: string[];
    workoutTypes?: string[];
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (options.search !== undefined) {
      if (options.search) {
        params.set("search", options.search);
      } else {
        params.delete("search");
      }
    }

    if (options.categories !== undefined) {
      if (options.categories.length > 0) {
        params.set("categories", options.categories.join(","));
      } else {
        params.delete("categories");
      }
    }

    if (options.workoutTypes !== undefined) {
      if (options.workoutTypes.length > 0) {
        params.set("workoutTypes", options.workoutTypes.join(","));
      } else {
        params.delete("workoutTypes");
      }
    }

    if (options.page !== undefined) {
      params.set("page", options.page.toString());
    }

    router.push(`?${params.toString()}`);
  };

  // 카테고리 토글
  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newCategories);
    updateFilters({ categories: newCategories, page: 1 });
    setCurrentPage(1);
  };

  // 워크아웃 타입 토글
  const handleWorkoutTypeToggle = (type: string) => {
    const newTypes = selectedWorkoutTypes.includes(type)
      ? selectedWorkoutTypes.filter((t) => t !== type)
      : [...selectedWorkoutTypes, type];

    setSelectedWorkoutTypes(newTypes);
    updateFilters({ workoutTypes: newTypes, page: 1 });
    setCurrentPage(1);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedWorkoutTypes([]);
    updateFilters({ categories: [], workoutTypes: [], page: 1 });
    setCurrentPage(1);
  };

  // 활성 필터 개수
  const activeFilterCount =
    selectedCategories.length + selectedWorkoutTypes.length;

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">워크아웃 라이브러리</h1>
        <p className="text-muted-foreground">
          {`${initialData?.totalCount}개의 워크아웃 운동이 등록되어 있습니다.`}
        </p>
      </div>

      {/* 검색 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="제목, 카테고리, 설명으로 검색..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      {/* 카테고리 필터 */}
      {filtersData.categories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">카테고리</h3>
          <div className="flex flex-wrap gap-2">
            {filtersData.categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 워크아웃 타입 필터 */}
      {filtersData.workoutTypes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">운동 타입</h3>
          <div className="flex flex-wrap gap-2">
            {filtersData.workoutTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedWorkoutTypes.includes(type)}
                  onCheckedChange={() => handleWorkoutTypeToggle(type)}
                />
                <label
                  htmlFor={`type-${type}`}
                  className="text-sm cursor-pointer"
                >
                  {getWorkoutTypeLabel(type)}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 필터 초기화 버튼 */}
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={handleResetFilters}>
          <X className="h-4 w-4 mr-2" />
          필터 초기화
        </Button>
      )}

      {/* 워크아웃 목록 */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">워크아웃이 없습니다</p>
            <p className="text-sm text-muted-foreground mt-2">
              {search || activeFilterCount > 0
                ? "검색 조건과 일치하는 워크아웃이 없습니다."
                : "등록된 워크아웃이 없습니다."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.category && (
                        <Badge variant="secondary">{item.category}</Badge>
                      )}
                      <Badge variant="outline">
                        {getWorkoutTypeLabel(item.workoutType)}
                      </Badge>
                      {item.isSystem && <Badge variant="default">시스템</Badge>}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {item.title}
                    </CardTitle>
                    {item.description && (
                      <CardDescription className="line-clamp-2">
                        {item.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {item.coachName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{item.coachName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  {item.videoUrl && (
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="text-blue-600">영상 포함</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
