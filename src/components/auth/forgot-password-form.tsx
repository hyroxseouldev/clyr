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
import {
  Card,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AsyncButton } from "@/components/common/async-button";
import { requestPasswordResetAction } from "@/actions/auth";
import { useTranslations } from "next-intl";

export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword');
  const tValidation = useTranslations('validation');
  const tToast = useTranslations('toast');

  const formSchema = z.object({
    email: z.string().email(tValidation('email')),
  });

  const [isLoading, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await requestPasswordResetAction(data.email);

      if (result.success) {
        toast.success(tToast('saved'));
        form.reset();
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('emailPlaceholder')}
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CardDescription className="text-xs">
          {t('description')}
        </CardDescription>

        <AsyncButton type="submit" className="w-full" isLoading={isLoading}>
          {t('submit')}
        </AsyncButton>
      </form>
    </Form>
  );
}
