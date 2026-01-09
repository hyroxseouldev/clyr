"use client";

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
import { updateAccountAction } from "@/actions/account";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ImageForm } from "@/components/form";
import { useTranslations } from "next-intl";

export function AccountForm({
  initialData,
  onSuccess,
}: {
  initialData: { fullName: string; avatarUrl: string };
  onSuccess: () => void;
}) {
  const t = useTranslations('account');
  const tValidation = useTranslations('validation');
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  const accountFormSchema = z.object({
    fullName: z.string().min(1, tValidation('required')),
    avatarUrl: z.string().nullable().optional(),
  });

  type FormValues = z.infer<typeof accountFormSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      fullName: initialData.fullName ?? "",
      avatarUrl: initialData.avatarUrl ?? null,
    },
  });

  const onSubmit = async (values: FormValues) => {
    startTransition(async () => {
      const result = await updateAccountAction(values);

      if (result.success) {
        toast.success(t('updateSuccess'));
        router.refresh();
        onSuccess();
      } else {
        toast.error(t('failed'), { description: result.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 프로필 이미지 */}
        <ImageForm
          name="avatarUrl"
          label={t('profileImage')}
          form={form}
          bucketName="avatars"
          path="avatars"
          maxFileSize={2 * 1024 * 1024}
        />

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          {t('save')}
        </Button>
      </form>
    </Form>
  );
}
