"use client";

import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRightIcon,
  LogOutIcon,
  CalendarIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Program } from "@/db/schema";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

/**
 * 프로그램 카드 컴포넌트
 * 클릭 시 프로그램 상세 페이지로 이동합니다.
 */
export function ProgramCard({ program }: { program: Program }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/coach/dashboard/${program.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow "
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <CardTitle>{program.title}</CardTitle>
          </div>
          <CardAction>
            <Button variant="ghost" size="icon-sm">
              <ArrowUpRightIcon className="size-4" />
            </Button>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={program.isPublic ? "default" : "secondary"}>
            {program.isPublic ? "공개" : "비공개"}
          </Badge>
          <Badge variant={program.isForSale ? "default" : "outline"}>
            {program.isForSale ? "판매중" : "판매중지"}
          </Badge>
          <Badge variant="secondary">
            {program.type === "SINGLE" ? "단건" : "구독"}
          </Badge>
          <Badge variant="outline">
            {program.difficulty === "BEGINNER"
              ? "초급"
              : program.difficulty === "INTERMEDIATE"
              ? "중급"
              : "고급"}
          </Badge>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="size-4" />
            <span>{program.durationWeeks}주</span>
          </div>
          <div className="flex items-center gap-1">
            <UsersIcon className="size-4" />
            <span>주 {program.daysPerWeek}일</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
