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
import Link from "next/link";
import { signUpSchema } from "@/lib/validations";
import { AsyncButton } from "@/components/common/async-button";

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const defaultRole: "USER" | "COACH" =
    roleParam === "COACH" ? "COACH" : "USER";

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
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
        toast.error(`회원가입에 실패했습니다. ${result.error}`);
        return;
      }

      if (result && "success" in result && result.success) {
        toast.success(
          `회원가입이 완료되었습니다. 이메일 인증 후 로그인 해주세요.`
        );

        return;
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>정보를 입력하여 새 계정을 만드세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" {...field} />
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
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@email.com"
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
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
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
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
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
                    <FormLabel>회원 유형</FormLabel>
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
                        <SelectItem value="USER">일반 회원</SelectItem>
                        <SelectItem value="COACH">코치</SelectItem>
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
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/signin"
                  className="text-primary text-underline underline-offset-4 hover:text-primary/80"
                >
                  로그인
                </Link>
              </FormDescription>

              <AsyncButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                가입하기
              </AsyncButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
