import { getMembersByProgramAction } from "@/actions/member";
import { MemberCard } from "@/components/coach/member-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { MemberListClient } from "./member-list-client";

/**
 * 프로그램 회원 목록 페이지
 * 프로그램에 참여중인 회원들을 조회하고 관리할 수 있습니다.
 */
export default async function ProgramMembersPage({
  params,
}: {
  params: Promise<{ pid: string }>;
}) {
  const { pid: programId } = await params;

  // 데이터 페칭
  const result = await getMembersByProgramAction(programId);
  const members = result.success && result.data ? result.data : [];

  // 회원 통계 계산
  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "ACTIVE").length,
    expired: members.filter((m) => m.status === "EXPIRED").length,
    paused: members.filter((m) => m.status === "PAUSED").length,
  };

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">회원 목록</h1>
          <p className="text-muted-foreground">
            총 {stats.total}명의 회원 (활성: {stats.active}, 만료: {stats.expired},
            정지: {stats.paused})
          </p>
        </div>
      </div>

      {/* 클라이언트 컴포넌트로 필터 및 검색 기능 제공 */}
      <MemberListClient
        programId={programId}
        initialMembers={members}
      />
    </div>
  );
}
