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
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TiptapForm } from "@/components/form";
import { AvatarForm } from "@/components/form/avatar-form";
import { ImageForm } from "@/components/form";
import type { CoachProfile } from "@/db/schema";
import { useTranslations } from "next-intl";

export function CoachProfileForm({
  initialData,
}: {
  initialData?: CoachProfile | null;
}) {
  const t = useTranslations("profile");
  const tAccount = useTranslations("account");
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(!!initialData);

  const coachProfileFormSchema = z.object({
    profileImageUrl: z.string().nullable().optional(),
    representativeImage: z.string().nullable().optional(),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(coachProfileFormSchema),
    defaultValues: {
      profileImageUrl: initialData?.profileImageUrl ?? null,
      representativeImage: (initialData as any)?.representativeImage ?? null,
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
          representativeImage: (result.data as any).representativeImage ?? null,
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
        representativeImage: values.representativeImage || null,
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
        toast.success(isEditMode ? t("profileUpdated") : t("profileCreated"));
        router.refresh();
      } else {
        toast.error(tAccount("failed"), { description: result.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 프로필 이미지 */}
        <AvatarForm
          name="profileImageUrl"
          label={t("profileImage")}
          form={form}
          bucketName="public-assets"
          path="coach/profile"
          maxFileSize={2 * 1024 * 1024}
        />

        {/* 대표 이미지 */}
        <ImageForm
          name="representativeImage"
          label={t("representativeImage")}
          form={form}
          bucketName="public-assets"
          path="coach/representative"
          maxFileSize={5 * 1024 * 1024}
        />

        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("nickname")}</FormLabel>
              <FormControl>
                <Input placeholder={t("nicknamePlaceholder")} {...field} />
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
              <FormLabel>{t("introduction")}</FormLabel>
              <FormControl>
                <Input placeholder={t("introductionPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TiptapForm
          name="experience"
          label={t("experience")}
          form={form}
          placeholder={t("experiencePlaceholder")}
          minHeight="150px"
        />

        <FormField
          control={form.control}
          name="certifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("certifications")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("certificationsPlaceholder")}
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
              <FormLabel>{t("contactNumber")}</FormLabel>
              <FormControl>
                <Input placeholder="010-1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-medium">{t("snsLinks")}</h3>

          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("instagram")}</FormLabel>
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
                <FormLabel>{t("youtube")}</FormLabel>
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
                <FormLabel>{t("blog")}</FormLabel>
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
          {isEditMode ? t("updateProfile") : t("createProfile")}
        </Button>
      </form>
    </Form>
  );
}
