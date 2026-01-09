"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";
import {
  createCoachProfileAction,
  updateCoachProfileAction,
  getMyCoachProfileAction,
} from "@/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TiptapForm } from "@/components/form";
import { AvatarForm } from "@/components/form/avatar-form";
import type { CoachProfile } from "@/db/schema";

const coachProfileFormSchema = z.object({
  profileImageUrl: z.string().nullable().optional(),
  nickname: z.string().optional(),
  introduction: z.string().optional(),
  experience: z.string().optional(),
  certifications: z.string().optional(),
  contactNumber: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  blog: z.string().optional(),
});

type FormValues = z.infer<typeof coachProfileFormSchema>;

export function CoachProfileForm({
  initialData,
}: {
  initialData?: CoachProfile | null;
}) {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(!!initialData);

  const form = useForm<FormValues>({
    resolver: zodResolver(coachProfileFormSchema),
    defaultValues: {
      profileImageUrl: initialData?.profileImageUrl ?? null,
      nickname: initialData?.nickname ?? "",
      introduction: initialData?.introduction ?? "",
      experience: initialData?.experience ?? "",
      certifications: initialData?.certifications?.join(", ") ?? "",
      contactNumber: initialData?.contactNumber ?? "",
      instagram: initialData?.snsLinks?.instagram ?? "",
      youtube: initialData?.snsLinks?.youtube ?? "",
      blog: initialData?.snsLinks?.blog ?? "",
    },
  });

  // 기존 프로필 로드 (initialData가 없을 때만)
  useEffect(() => {
    if (initialData) return; // initialData가 있으면 패치

    startTransition(async () => {
      const result = await getMyCoachProfileAction();
      if (result.success && result.data) {
        setIsEditMode(true);
        form.reset({
          profileImageUrl: result.data.profileImageUrl ?? null,
          nickname: result.data.nickname ?? "",
          introduction: result.data.introduction ?? "",
          experience: result.data.experience ?? "",
          certifications: result.data.certifications?.join(", ") ?? "",
          contactNumber: result.data.contactNumber ?? "",
          instagram: result.data.snsLinks?.instagram ?? "",
          youtube: result.data.snsLinks?.youtube ?? "",
          blog: result.data.snsLinks?.blog ?? "",
        });
      }
    });
  }, [initialData, form]);

  const onSubmit = async (values: FormValues) => {
    startTransition(async () => {
      const data = {
        profileImageUrl: values.profileImageUrl || null,
        nickname: values.nickname || null,
        introduction: values.introduction || null,
        experience: values.experience || null,
        certifications: values.certifications
          ? values.certifications
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        contactNumber: values.contactNumber || null,
        snsLinks: {
          instagram: values.instagram || undefined,
          youtube: values.youtube || undefined,
          blog: values.blog || undefined,
        },
      };

      const result = isEditMode
        ? await updateCoachProfileAction(data)
        : await createCoachProfileAction(data);

      if (result.success) {
        toast.success(
          isEditMode ? "프로필이 수정되었습니다." : "프로필이 생성되었습니다."
        );
        router.refresh();
      } else {
        toast.error("실패", { description: result.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 프로필 이미지 */}
        <AvatarForm
          name="profileImageUrl"
          label="프로필 이미지"
          form={form}
          bucketName="public-assets"
          path="coach/profile"
          maxFileSize={2 * 1024 * 1024}
        />

        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>닉네임</FormLabel>
              <FormControl>
                <Input placeholder="홍길동 코치" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="introduction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>한줄 소개</FormLabel>
              <FormControl>
                <Input
                  placeholder="건강한 몸 만들기를 도와드립니다"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TiptapForm
          name="experience"
          label="코칭 경력"
          form={form}
          placeholder="경력 사항을 상세히 입력하세요..."
          minHeight="150px"
        />

        <FormField
          control={form.control}
          name="certifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>자격증 (쉼표로 구분)</FormLabel>
              <FormControl>
                <Input
                  placeholder="NASM-CPT, 생활스포츠지도사, ..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>연락처</FormLabel>
              <FormControl>
                <Input placeholder="010-1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-medium">SNS 링크</h3>

          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input placeholder="@username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="youtube"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="blog"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blog</FormLabel>
                <FormControl>
                  <Input placeholder="https://blog.naver.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          {isEditMode ? "프로필 수정" : "프로필 생성"}
        </Button>
      </form>
    </Form>
  );
}
