"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signUpAction } from "@/actions/auth";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { AsyncButton } from "@/components/common/async-button";
import { useTranslations } from "next-intl";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations('auth.signUp');
  const tValidation = useTranslations('validation');
  const tToast = useTranslations('toast');

  const formSchema = z.object({
    fullName: z.string().min(2, tValidation('nameMin')).max(50, tValidation('nameMax')),
    email: z.string().email(tValidation('email')),
    password: z.string().min(8, tValidation('passwordMin')),
    confirmPassword: z.string().min(8, tValidation('passwordMin')),
    role: z.enum(["USER", "COACH"]),
  }).refine((data) => data.password === data.confirmPassword, {
    message: tValidation('passwordMismatch'),
    path: ["confirmPassword"],
  });

  type SignUpFormValues = z.infer<typeof formSchema>;

  const [isLoading, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const defaultRole: "USER" | "COACH" =
    roleParam === "COACH" ? "COACH" : "USER";

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: defaultRole,
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    startTransition(async () => {
      const result = await signUpAction({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
        avatarUrl: "",
      });

      if (result && "error" in result) {
        toast.error(`${tToast('error')}: ${result.error}`);
        return;
      }

      if (result && "success" in result && result.success) {
        toast.success(tToast('created'));

        return;
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fullName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fullNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>
                      서비스에서 사용하실 실명입니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="password"
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
                    <FormDescription>
                      최소 8자 이상 입력해주세요.
                    </FormDescription>
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

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('role')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="회원 유형을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">{t('roleUser')}</SelectItem>
                        <SelectItem value="COACH">{t('roleCoach')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      코치는 프로그램을 생성하고 판매할 수 있습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 이미 계정이 있으면 로그인 페이지로 이동 */}
              <FormDescription className="text-center text-muted-foreground">
                {t('hasAccount')}{" "}
                <Link
                  href="/signin"
                  className="text-primary text-underline underline-offset-4 hover:text-primary/80"
                >
                  {t('signIn')}
                </Link>
              </FormDescription>

              <AsyncButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                {t('submit')}
              </AsyncButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
