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

const formSchema = z.object({
  email: z.string().email("올바른 이메일 형식을 입력해주세요"),
});

export function ForgotPasswordForm() {
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
        toast.success("비밀번호 재설정 링크가 발송되었습니다.");
        form.reset();
      } else {
        toast.error("요청 실패", {
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

        <CardDescription className="text-xs">
          입력하신 이메일로 비밀번호 재설정 링크가 발송됩니다.
        </CardDescription>

        <AsyncButton type="submit" className="w-full" isLoading={isLoading}>
          비밀번호 재설정 링크 받기
        </AsyncButton>
      </form>
    </Form>
  );
}
