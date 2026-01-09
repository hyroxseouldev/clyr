"use client";

import { useState, useMemo } from "react";
import { MemberCard } from "@/components/coach/member-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchIcon } from "lucide-react";
import type { Enrollment } from "@/db/schema";

const ITEMS_PER_PAGE = 12;

interface MemberListClientProps {
  programId: string;
  initialMembers: Array<Enrollment & {
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
    workoutCount: number;
    lastWorkoutDate: Date | null;
  }>;
}

export function MemberListClient({
  programId,
  initialMembers,
}: MemberListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "EXPIRED" | "PAUSED">("ALL");
  const [sortBy, setSortBy] = useState<"name" | "enrollmentDate" | "status" | "lastWorkout">("enrollmentDate");
  const [currentPage, setCurrentPage] = useState(1);

  // 필터링 및 정렬된 회원 목록
  const filteredMembers = useMemo(() => {
    let filtered = [...initialMembers];

    // 상태 필터
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((member) => member.status === statusFilter);
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((member) => {
        const fullName = member.user.fullName || "";
        const email = member.user.email || "";
        return (
          fullName.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query)
        );
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.user.fullName || "").localeCompare(b.user.fullName || "");
        case "enrollmentDate":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "status":
          const statusOrder = { ACTIVE: 0, PAUSED: 1, EXPIRED: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        case "lastWorkout":
          const aDate = a.lastWorkoutDate?.getTime() || 0;
          const bDate = b.lastWorkoutDate?.getTime() || 0;
          return bDate - aDate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [initialMembers, searchQuery, statusFilter, sortBy]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // 필터 변경 시 첫 페이지로 이동
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: typeof statusFilter) => {
    setStatusFilter(value);
    handleFilterChange();
  };

  const handleSortChange = (value: typeof sortBy) => {
    setSortBy(value);
    handleFilterChange();
  };

  return (
    <div className="space-y-6">
      {/* 필터 섹션 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="이름 또는 이메일 검색..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ACTIVE">수강 중</SelectItem>
              <SelectItem value="PAUSED">일시정지</SelectItem>
              <SelectItem value="EXPIRED">만료</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enrollmentDate">수강일순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="status">상태순</SelectItem>
              <SelectItem value="lastWorkout">최근 운동순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 결과 count */}
      <div className="text-sm text-muted-foreground">
        총 {filteredMembers.length}명 중 {startIndex + 1}-{Math.min(endIndex, filteredMembers.length)}명 표시
      </div>

      {/* 회원 목록 그리드 */}
      {currentMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">회원을 찾을 수 없습니다</p>
          <p className="text-sm text-muted-foreground">
            검색 조건을 변경하거나 다른 필터를 사용해 보세요.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentMembers.map((member) => (
              <MemberCard
                key={member.id}
                memberId={member.user.id}
                fullName={member.user.fullName || "이름 없음"}
                email={member.user.email || ""}
                avatarUrl={member.user.avatarUrl}
                programName={member.program.title}
                enrollmentStatus={member.status}
                enrollmentEnd={member.endDate}
                lastWorkoutDate={member.lastWorkoutDate}
                workoutCount={member.workoutCount}
                programId={programId}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {/* 페이지 번호 */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
