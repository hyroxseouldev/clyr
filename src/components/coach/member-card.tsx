"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export interface MemberCardProps {
  memberId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  programName: string;
  enrollmentStatus: "ACTIVE" | "EXPIRED" | "PAUSED";
  enrollmentEnd: Date | null;
  lastWorkoutDate: Date | null;
  workoutCount: number;
  programId: string;
}

/**
 * 회원 카드 컴포넌트
 * 회원 목록에서 회원 정보를 표시
 */
export function MemberCard({
  memberId,
  fullName,
  email,
  avatarUrl,
  programName,
  enrollmentStatus,
  enrollmentEnd,
  lastWorkoutDate,
  workoutCount,
  programId,
}: MemberCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/coach/dashboard/${programId}/members/${memberId}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "PAUSED":
        return "secondary";
      case "EXPIRED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "수강 중";
      case "PAUSED":
        return "일시정지";
      case "EXPIRED":
        return "만료";
      default:
        return status;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="size-12">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{fullName}</h3>
              <Button variant="ghost" size="icon-sm" className="shrink-0">
                <ArrowUpRightIcon className="size-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getStatusBadgeVariant(enrollmentStatus)}>
              {getStatusLabel(enrollmentStatus)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {programName}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="size-4" />
              <span>
                {enrollmentEnd
                  ? format(new Date(enrollmentEnd), "yyyy.MM.dd", { locale: ko })
                  : "무기한"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{workoutCount}</span>
              <span>회 운동</span>
            </div>
          </div>

          {lastWorkoutDate && (
            <p className="text-xs text-muted-foreground">
              최근 운동: {format(new Date(lastWorkoutDate), "yyyy.MM.dd", { locale: ko })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
