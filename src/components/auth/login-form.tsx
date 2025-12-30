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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signInWithEmailAndPassword } from "@/actions/auth";
import { useTransition } from "react";
import { toast } from "sonner";
import { AsyncButton } from "@/components/common/async-button";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email("올바른 이메일 형식을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      // 1. 서버 액션 호출
      const result = await signInWithEmailAndPassword(
        data.email,
        data.password
      );

      // 2. 에러 처리 (로그인 실패 시)
      // redirect가 실행되면 이 아래 코드는 실행되지 않고 바로 페이지가 이동합니다.
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }

      // 성공 시 로직 (사실 redirect 때문에 실행되지 않을 확률이 높지만 기록용으로 둠)
      toast.success("로그인되었습니다.");
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>
            이메일과 비밀번호를 입력하여 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 계정이 없으면 회원가입 페이지로 이동 */}
              <FormDescription className="text-center text-muted-foreground">
                계정이 없으신가요?{" "}
                <Link
                  href="/signup"
                  className="text-primary text-underline underline-offset-4 hover:text-primary/80"
                >
                  회원가입
                </Link>
              </FormDescription>

              <AsyncButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                로그인
              </AsyncButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
