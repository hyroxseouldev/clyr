import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MemberStatusBadgeProps {
  status: "ACTIVE" | "EXPIRED" | "PAUSED";
  className?: string;
}

/**
 * 회원 수강 상태 배지 컴포넌트
 * 색상 구분: Active(녹색), Paused(노란색), Expired(빨간색)
 */
export function MemberStatusBadge({
  status,
  className,
}: MemberStatusBadgeProps) {
  const getConfig = () => {
    switch (status) {
      case "ACTIVE":
        return {
          variant: "default" as const,
          label: "수강 중",
          className: "bg-green-500 hover:bg-green-600 text-white",
        };
      case "PAUSED":
        return {
          variant: "secondary" as const,
          label: "일시정지",
          className: "bg-yellow-500 hover:bg-yellow-600 text-white",
        };
      case "EXPIRED":
        return {
          variant: "destructive" as const,
          label: "만료",
          className: "bg-red-500 hover:bg-red-600 text-white",
        };
      default:
        return {
          variant: "outline" as const,
          label: status,
          className: "",
        };
    }
  };

  const config = getConfig();

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

/**
 * 간단 상태 텍스트 반환 (텍스트만 필요할 때)
 */
export function getStatusLabel(status: "ACTIVE" | "EXPIRED" | "PAUSED"): string {
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
}

/**
 * 상태별 색상 클래스 반환 (커스텀 스타일링 필요시)
 */
export function getStatusColorClass(
  status: "ACTIVE" | "EXPIRED" | "PAUSED"
): string {
  switch (status) {
    case "ACTIVE":
      return "text-green-600 bg-green-50";
    case "PAUSED":
      return "text-yellow-600 bg-yellow-50";
    case "EXPIRED":
      return "text-red-600 bg-red-50";
    default:
      return "";
  }
}
