"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon,
  UserIcon,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  updateEnrollmentStatusByCoachAction,
} from "@/actions/order";

type Enrollment = {
  id: string;
  userId: string;
  programId: string;
  status: "ACTIVE" | "EXPIRED" | "PAUSED";
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
};

type OrderListTabProps = {
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

export default function OrderListTab({ programId, initialData }: OrderListTabProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "EXPIRED" | "PAUSED">(
    "ALL"
  );

  // initialData가 변경되면 상태 업데이트 (깊은 비교)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setEnrollments(initialData || []);
    setLoading(false);
  }, [JSON.stringify(initialData)]);

  // Status update dialog
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    enrollmentId: string;
    currentStatus: "ACTIVE" | "EXPIRED" | "PAUSED";
    newStatus: "ACTIVE" | "EXPIRED" | "PAUSED";
  }>({
    open: false,
    enrollmentId: "",
    currentStatus: "ACTIVE",
    newStatus: "ACTIVE",
  });

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filter === "ALL") return true;
    return enrollment.status === filter;
  });

  // Status update handlers
  const handleStatusChange = (
    enrollmentId: string,
    newStatus: "ACTIVE" | "EXPIRED" | "PAUSED"
  ) => {
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return;

    setStatusDialog({
      open: true,
      enrollmentId,
      currentStatus: enrollment.status,
      newStatus,
    });
  };

  const confirmStatusChange = () => {
    startTransition(async () => {
      const result = await updateEnrollmentStatusByCoachAction(
        statusDialog.enrollmentId,
        programId,
        statusDialog.newStatus
      );

      if (result.success) {
        toast.success("상태가 변경되었습니다.");
        router.refresh();
      } else {
        toast.error("상태 변경 실패", { description: result.message });
      }

      setStatusDialog({
        open: false,
        enrollmentId: "",
        currentStatus: "ACTIVE",
        newStatus: "ACTIVE",
      });
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "무기한";
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
          <h3 className="text-lg font-semibold">구매 목록</h3>
          <p className="text-sm text-muted-foreground">
            총 {enrollments.length}명의 수강생이 있습니다
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
      {filteredEnrollments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserIcon className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {filter === "ALL"
                ? "수강생이 없습니다"
                : `${STATUS_LABELS[filter]} 상태의 수강생이 없습니다`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enrollment List */}
      <div className="space-y-4">
        {filteredEnrollments.map((enrollment) => (
          <EnrollmentCard
            key={enrollment.id}
            enrollment={enrollment}
            onStatusChange={handleStatusChange}
            formatDate={formatDate}
          />
        ))}
      </div>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog
        open={statusDialog.open}
        onOpenChange={(open) => setStatusDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>수강권 상태 변경</AlertDialogTitle>
            <AlertDialogDescription>
              수강권 상태를{" "}
              <strong>{STATUS_LABELS[statusDialog.currentStatus]}</strong>에서{" "}
              <strong>{STATUS_LABELS[statusDialog.newStatus]}</strong>으로
              변경합니다.
              <br />
              <br />
              계속 진행하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              변경
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Enrollment Card Component
function EnrollmentCard({
  enrollment,
  onStatusChange,
  formatDate,
}: {
  enrollment: Enrollment;
  onStatusChange: (id: string, status: "ACTIVE" | "EXPIRED" | "PAUSED") => void;
  formatDate: (date: Date | null) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">
              {enrollment.user.fullName || enrollment.user.email}
            </CardTitle>
            <CardDescription className="text-xs">
              {enrollment.user.email}
            </CardDescription>
          </div>
          <Badge variant={STATUS_VARIANTS[enrollment.status]}>
            {STATUS_LABELS[enrollment.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <CalendarIcon className="size-4" />
            <span>수강 시작: {formatDate(new Date(enrollment.startDate))}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="size-4" />
            <span>만료일: {formatDate(enrollment.endDate)}</span>
          </div>
        </div>

        {/* Status Change Actions */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">상태 변경:</span>
          {enrollment.status !== "ACTIVE" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(enrollment.id, "ACTIVE")}
            >
              <CheckCircleIcon className="mr-1 size-3" />
              활성
            </Button>
          )}
          {enrollment.status !== "EXPIRED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(enrollment.id, "EXPIRED")}
            >
              <XCircleIcon className="mr-1 size-3" />
              만료
            </Button>
          )}
          {enrollment.status !== "PAUSED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(enrollment.id, "PAUSED")}
            >
              <PauseCircleIcon className="mr-1 size-3" />
              정지
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
