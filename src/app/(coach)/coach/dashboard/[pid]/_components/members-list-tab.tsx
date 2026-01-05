"use client";

import { useState, useEffect } from "react";
import {
  UserIcon,
  MailIcon,
  CalendarIcon,
  FileTextIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Enrollment = {
  id: string;
  userId: string;
  programId: string;
  status: "ACTIVE" | "EXPIRED" | "PAUSED";
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
};

type Member = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  enrollments: Array<{
    id: string;
    status: "ACTIVE" | "EXPIRED" | "PAUSED";
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
  }>;
};

type MembersListTabProps = {
  programId: string;
  initialData?: Enrollment[];
};

const STATUS_LABELS = {
  ACTIVE: "활성",
  EXPIRED: "만료",
  PAUSED: "정지",
};

const STATUS_VARIANTS = {
  ACTIVE: "default" as const,
  EXPIRED: "secondary" as const,
  PAUSED: "outline" as const,
};

// enrollments를 사용자별로 그룹핑
function groupEnrollmentsByUser(enrollments: Enrollment[]): Member[] {
  const userMap = new Map<string, Member>();

  enrollments.forEach((enrollment) => {
    const userId = enrollment.user.id;
    const existingMember = userMap.get(userId);

    if (existingMember) {
      existingMember.enrollments.push({
        id: enrollment.id,
        status: enrollment.status,
        startDate: enrollment.startDate,
        endDate: enrollment.endDate,
        createdAt: enrollment.createdAt,
      });
    } else {
      userMap.set(userId, {
        id: userId,
        email: enrollment.user.email,
        fullName: enrollment.user.fullName,
        avatarUrl: enrollment.user.avatarUrl,
        enrollments: [
          {
            id: enrollment.id,
            status: enrollment.status,
            startDate: enrollment.startDate,
            endDate: enrollment.endDate,
            createdAt: enrollment.createdAt,
          },
        ],
      });
    }
  });

  return Array.from(userMap.values());
}

export default function MembersListTab({ programId, initialData }: MembersListTabProps) {
  const [members, setMembers] = useState<Member[]>(
    initialData ? groupEnrollmentsByUser(initialData) : []
  );
  const [loading, setLoading] = useState(!initialData);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "EXPIRED" | "PAUSED">("ALL");

  // initialData가 변경되면 상태 업데이트
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMembers(initialData ? groupEnrollmentsByUser(initialData) : []);
    setLoading(false);
  }, [JSON.stringify(initialData)]);

  // 회원별로 그룹핑하고 필터링
  const filteredMembers = members.filter((member) => {
    if (filter === "ALL") return true;
    // 선택한 상태의 수강권이 하나라도 있으면 표시
    return member.enrollments.some((e) => e.status === filter);
  });

  // 전체 회원 수 계산 (중복 제거)
  const totalMembers = members.length;

  // 활성 회원 수 계산
  const activeMembers = members.filter((m) =>
    m.enrollments.some((e) => e.status === "ACTIVE")
  ).length;

  const formatDate = (date: Date | null) => {
    if (!date) return "미지정";
    return new Date(date).toLocaleDateString("ko-KR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">회원 목록</h3>
          <p className="text-sm text-muted-foreground">
            총 {totalMembers}명의 회원 (활성 {activeMembers}명)
          </p>
        </div>
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as typeof filter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            <SelectItem value="ACTIVE">활성</SelectItem>
            <SelectItem value="EXPIRED">만료</SelectItem>
            <SelectItem value="PAUSED">정지</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserIcon className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {filter === "ALL"
                ? "회원이 없습니다"
                : `${STATUS_LABELS[filter]} 상태의 회원이 없습니다`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <div className="space-y-4">
        {filteredMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            programId={programId}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  );
}

// Member Card Component
function MemberCard({
  member,
  programId,
  formatDate,
}: {
  member: Member;
  programId: string;
  formatDate: (date: Date | null) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.fullName || member.email}
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                <UserIcon className="size-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">
                {member.fullName || "이름 없음"}
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MailIcon className="size-3" />
                {member.email}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              수강권 {member.enrollments.length}개
            </span>
            <Button asChild variant="outline" size="sm">
              <a href={`/coach/dashboard/${programId}/members/${member.id}`}>
                <FileTextIcon className="size-4 mr-1" />
                로그 보기
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {member.enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-4 text-sm">
                <Badge variant={STATUS_VARIANTS[enrollment.status]}>
                  {STATUS_LABELS[enrollment.status]}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CalendarIcon className="size-3" />
                  <span>
                    {formatDate(enrollment.startDate)} ~ {formatDate(enrollment.endDate)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                가입일: {formatDate(enrollment.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
