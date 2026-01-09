"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { AlertTriangleIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
import { deleteProgramAction } from "@/actions";
import type { Program } from "@/db/schema";

type SettingTabProps = {
  programId: string;
  program: Program;
};

export default function SettingTab({ programId, program }: SettingTabProps) {
  const tToast = useTranslations('toast');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    confirmedTitle: "",
  });

  const handleDeleteClick = () => {
    setDeleteDialog({ open: true, confirmedTitle: "" });
  };

  const confirmDelete = () => {
    if (deleteDialog.confirmedTitle !== program.title) {
      toast.error(tToast('programTitleMismatch'));
      return;
    }

    startTransition(async () => {
      const result = await deleteProgramAction(programId);

      if (result.success) {
        toast.success(tToast('programDeleted'));
        router.push("/coach/dashboard");
      } else {
        toast.error(tToast('programDeleteFailed'), { description: result.message });
      }

      setDeleteDialog({ open: false, confirmedTitle: "" });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">설정</h3>
        <p className="text-sm text-muted-foreground">
          프로그램 관리 및 위험한 작업
        </p>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangleIcon className="size-5" />
            위험 영역
          </CardTitle>
          <CardDescription>
            이 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-destructive">
                  프로그램 삭제
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  프로그램을 삭제하면 모든 주차, 일차, 세션, 주문, 수강권 정보가
                  함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  삭제하려면 프로그램 제목을 입력하세요:
                </label>
                <Input
                  value={deleteDialog.confirmedTitle}
                  onChange={(e) =>
                    setDeleteDialog((prev) => ({
                      ...prev,
                      confirmedTitle: e.target.value,
                    }))
                  }
                  placeholder={program.title}
                  className="bg-background"
                />
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={
                  isPending || deleteDialog.confirmedTitle !== program.title
                }
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <Spinner className="mr-2" />
                ) : (
                  <TrashIcon className="mr-2 size-4" />
                )}
                프로그램 삭제
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog({ open: false, confirmedTitle: "" });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              프로그램 삭제 확인
            </AlertDialogTitle>
            <AlertDialogDescription>
              프로그램 <strong>&quot;{program.title}&quot;</strong>을(를)
              삭제합니다.
              <br />
              <br />
              삭제되는 데이터:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>모든 주차 ({program.durationWeeks}주차)</li>
                <li>모든 일차 및 세션</li>
                <li>연결된 주문 내역</li>
                <li>모든 수강권 정보</li>
              </ul>
              <br />
              <strong className="text-destructive">
                이 작업은 되돌릴 수 없습니다!
              </strong>
              <br />
              <br />
              정말 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
