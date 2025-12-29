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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signInWithEmailAndPassword } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true); // 로딩 시작

    try {
      // 1. 서버 액션 호출
      const result = await signInWithEmailAndPassword(
        data.email,
        data.password
      );

      // 2. 에러 처리 (로그인 실패 시)
      // redirect가 실행되면 이 아래 코드는 실행되지 않고 바로 페이지가 이동합니다.
      if (result && "error" in result) {
        toast.error(result.error);
        setIsLoading(false); // 실패했으므로 로딩 해제
        return;
      }

      // 성공 시 로직 (사실 redirect 때문에 실행되지 않을 확률이 높지만 기록용으로 둠)
      toast.success("Login successful");
    } catch (error: any) {
      // 3. 리다이렉트 에러 무시 로직
      // Next.js의 redirect는 내부적으로 에러를 던지므로 catch에 걸릴 수 있습니다.
      // 하지만 "NEXT_REDIRECT"라는 메시지가 포함되어 있다면 에러가 아니라 정상 이동 중인 것입니다.
      if (error.message?.includes("NEXT_REDIRECT")) {
        return;
      }

      toast.error(`An unexpected error occurred: ${error.message || error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@example.com"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 아이디가 없으면 회원가입 페이지로 이동 */}
              <FormDescription className="text-center text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary text-underline underline-offset-4 hover:text-primary/80"
                >
                  Sign up
                </Link>
              </FormDescription>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Spinner className="size-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
