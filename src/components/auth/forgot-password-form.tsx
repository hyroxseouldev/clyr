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
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AsyncButton } from "@/components/common/async-button";
import { requestPasswordResetAction } from "@/actions/auth";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
    <div className={cn("flex flex-col gap-10", className)} {...props}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-primary">Clyr</h1>
        <h2 className="text-3xl font-bold">{t('title')}</h2>
        <p className="text-md text-muted-foreground">{t('description')}</p>
      </div>

      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md font-bold">
                    {t('email')}
                  </FormLabel>
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

            {/* 로그인으로 돌아가기 링크 */}
            <FormDescription className="text-center text-muted-foreground">
              <Link
                href="/signin"
                className="text-underline underline-offset-4 hover:text-primary/80 font-bold"
              >
                ← {t('backToSignIn')}
              </Link>
            </FormDescription>

            <AsyncButton
              type="submit"
              className="w-full mt-4"
              isLoading={isLoading}
              size="xl"
            >
              {t('submit')}
            </AsyncButton>
          </form>
        </Form>
      </div>
    </div>
  );
}
