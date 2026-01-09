"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/common/async-button";
import { changePasswordAction } from "@/actions/auth";
import { useTranslations } from "next-intl";

export function PasswordChangeForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const t = useTranslations('auth.resetPassword');
  const tValidation = useTranslations('validation');
  const tToast = useTranslations('toast');

  const formSchema = z
    .object({
      currentPassword: z.string().min(1, tValidation('required')),
      newPassword: z.string().min(8, tValidation('passwordMin')),
      confirmPassword: z.string().min(8, tValidation('passwordMin')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: tValidation('passwordMismatch'),
      path: ["confirmPassword"],
    });

  const [isLoading, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (result.success) {
        toast.success(tToast('passwordChanged'));
        form.reset();
        onSuccess?.();
      } else {
        toast.error(tToast('error'), {
          description: result.message,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>현재 비밀번호</FormLabel>
              <FormControl>
                <Input
                  placeholder="현재 비밀번호"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('passwordPlaceholder')}
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('confirmPassword')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('confirmPasswordPlaceholder')}
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AsyncButton
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          {t('submit')}
        </AsyncButton>
      </form>
    </Form>
  );
}
