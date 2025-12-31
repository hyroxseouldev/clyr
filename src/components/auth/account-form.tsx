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
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ImageForm } from "@/components/form";

const accountFormSchema = z.object({
  fullName: z.string().min(1, "이름을 입력하세요"),
  avatarUrl: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof accountFormSchema>;

export function AccountForm({
  initialData,
  onSuccess,
}: {
  initialData: { fullName: string; avatarUrl: string };
  onSuccess: () => void;
}) {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

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
        toast.success("계정 정보가 수정되었습니다.");
        router.refresh();
        onSuccess();
      } else {
        toast.error("실패", { description: result.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 프로필 이미지 */}
        <ImageForm
          name="avatarUrl"
          label="프로필 이미지"
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
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          저장
        </Button>
      </form>
    </Form>
  );
}
