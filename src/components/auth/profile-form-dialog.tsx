"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { X, Plus } from "lucide-react";
import {
  createCoachProfileAction,
  updateCoachProfileAction,
} from "@/actions/auth";
import { coachProfileSchema, type CoachProfileInput } from "@/lib/validations";
import type { CoachProfile } from "@/db/schema";

interface ProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: CoachProfile | null;
  onSuccess?: () => void;
}

export function ProfileFormDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: ProfileFormDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [certifications, setCertifications] = useState<string[]>(
    profile?.certifications ?? []
  );
  const [certInput, setCertInput] = useState("");
  const isEditMode = !!profile;

  const form = useForm<CoachProfileInput>({
    resolver: zodResolver(coachProfileSchema) as any,
    defaultValues: {
      nickname: profile?.nickname ?? "",
      introduction: profile?.introduction ?? "",
      experience: profile?.experience ?? "",
      certifications: profile?.certifications ?? [],
      contactNumber: profile?.contactNumber ?? "",
      snsLinks: profile?.snsLinks ?? {},
    },
  });

  const onSubmit = async (data: CoachProfileInput) => {
    setIsPending(true);
    try {
      const result = isEditMode
        ? await updateCoachProfileAction({
            nickname: data.nickname ?? null,
            introduction: data.introduction ?? null,
            experience: data.experience ?? null,
            certifications: certifications,
            contactNumber: data.contactNumber ?? null,
            snsLinks: data.snsLinks ?? {},
          })
        : await createCoachProfileAction({
            nickname: data.nickname ?? null,
            introduction: data.introduction ?? null,
            experience: data.experience ?? null,
            certifications: certifications,
            contactNumber: data.contactNumber ?? null,
            snsLinks: data.snsLinks ?? {},
          });

      if (result.success) {
        toast.success(
          isEditMode ? "프로필이 수정되었습니다." : "프로필이 생성되었습니다."
        );
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message ?? "작업에 실패했습니다.");
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsPending(false);
    }
  };

  const addCertification = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput("");
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "프로필 수정" : "프로필 생성"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "프로필 정보를 수정합니다."
              : "코치 프로필 정보를 입력해주세요."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-6"
          >
            {/* 기본 정보 섹션 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">기본 정보</h3>

              <FormField
                control={form.control as any}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>닉네임</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 김코치" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="introduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>한줄 소개</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="예: 10년 경력의 피트니스 전문가"
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연락처</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 010-1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 경력 및 자격증 섹션 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">경력 및 자격증</h3>

              <FormField
                control={form.control as any}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>코칭 경력</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="상세한 코칭 경력을 입력해주세요"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>자격증</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="자격증명 입력"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCertification();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addCertification}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {certifications.map((cert) => (
                      <Badge key={cert} variant="secondary" className="gap-1">
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeCertification(cert)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SNS 링크 섹션 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">SNS 링크</h3>

              <FormField
                control={form.control as any}
                name="snsLinks.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="@username 또는 URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="snsLinks.youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube</FormLabel>
                    <FormControl>
                      <Input placeholder="YouTube 채널 URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="snsLinks.blog"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blog</FormLabel>
                    <FormControl>
                      <Input placeholder="블로그 URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner className="mr-2 h-4 w-4" />}
                {isEditMode ? "저장" : "생성"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteProfileAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteProfileAlertDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteProfileAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>프로필 삭제 확인</AlertDialogTitle>
          <AlertDialogDescription>
            프로필을 삭제하면 모든 정보가 영구적으로 삭제됩니다. 이 작업은
            되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive">
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
