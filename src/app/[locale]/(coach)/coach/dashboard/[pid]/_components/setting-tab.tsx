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
  const t = useTranslations('settings');
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
        toast.error(tToast(result.message || 'deleteFailed'));
      }

      setDeleteDialog({ open: false, confirmedTitle: "" });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangleIcon className="size-5" />
            {t('dangerZone')}
          </CardTitle>
          <CardDescription>
            {t('dangerZoneDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-destructive">
                  {t('deleteProgram')}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('deleteProgramDesc')}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <Spinner className="mr-2" />
                ) : (
                  <TrashIcon className="mr-2 size-4" />
                )}
                {t('deleteButton')}
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
              {t('deleteConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDesc', { title: program.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {t('deleteProgramConfirm')}
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
                className="bg-background mt-2"
                autoFocus
              />
            </div>
            <div className="text-sm">
              {t('deletedData')}:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{t('deletedWeeks', { weeks: program.durationWeeks })}</li>
                <li>{t('deletedDays')}</li>
                <li>{t('deletedOrders')}</li>
                <li>{t('deletedEnrollments')}</li>
              </ul>
              <strong className="text-destructive mt-3 block">
                {t('deleteConfirmWarning')}
              </strong>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteDialog.confirmedTitle !== program.title}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
