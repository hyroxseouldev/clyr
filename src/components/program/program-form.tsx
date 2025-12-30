"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AsyncButton } from "@/components/common/async-button";
import { useTransition } from "react";
import { createProgramAction, updateProgramAction } from "@/actions";
import { toast } from "sonner";

/** 1. Schema 정의 - 검증 로직만 정의하고 default는 defaultValues에서 처리합니다 */
const programFormSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  slug: z.string().min(1, "슬러그를 입력하세요"),
  type: z.enum(["SINGLE", "SUBSCRIPTION"]),
  price: z.string().min(1, "가격을 입력하세요"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  durationWeeks: z.number().min(1),
  daysPerWeek: z.number().min(1).max(7),
  accessPeriodDays: z.number().nullable().optional(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  isForSale: z.boolean(),
});

/** 2. Zod 추론 타입을 FormValues로 사용 (resolver 에러 해결 핵심) */
type FormValues = z.infer<typeof programFormSchema>;

export function ProgramForm({ initialData }: { initialData?: any }) {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();
  /** 3. Form 초기화 */
  const form = useForm<FormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      type: initialData?.type ?? "SINGLE",
      price: String(initialData?.price ?? "0"),
      difficulty: initialData?.difficulty ?? "BEGINNER",
      durationWeeks: initialData?.durationWeeks ?? 1,
      daysPerWeek: initialData?.daysPerWeek ?? 3,
      accessPeriodDays: initialData?.accessPeriodDays ?? null,
      shortDescription: initialData?.shortDescription ?? null,
      description: initialData?.description ?? null,
      isPublic: !!initialData?.isPublic,
      isForSale: !!initialData?.isForSale,
    },
  });

  /** 4. Submit 핸들러 */
  const onSubmit = async (values: FormValues) => {
    // 수정 삭제 분기점 나눠야지 해야함.

    startTransition(async () => {
      if (initialData) {
        const result = await updateProgramAction(initialData.id, values);
        if (result && "error" in result) {
          toast.error(result.error as string);
          return;
        }
        if (result && "success" in result && result.success) {
          toast.success("프로그램 수정 성공");
        }
      } else {
        const result = await createProgramAction(values, []);
        if (result && "error" in result) {
          toast.error(result.error as string);
          return;
        }
        if (result && "success" in result && result.success) {
          toast.success("프로그램 생성 성공");
          router.push(`/coach/dashboard/${result.id}`);
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-10 p-4 rounded-lg border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-lg p-4">
          {/* 기본 정보 세션 */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>프로그램 제목</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>슬러그 (URL)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>판매 방식</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SINGLE">단건 판매</SelectItem>
                    <SelectItem value="SUBSCRIPTION">구독형</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>가격 (₩)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>난이도</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BEGINNER">입문</SelectItem>
                    <SelectItem value="INTERMEDIATE">중급</SelectItem>
                    <SelectItem value="ADVANCED">고급</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationWeeks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>총 주차 (Weeks)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="daysPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>주당 운동 일수</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accessPeriodDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>수강 기간 (일 / 비워두면 평생소장)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>요약 설명</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상세 설명</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={5}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-6 border p-4 rounded-lg bg-slate-50">
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormLabel>공개 여부</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isForSale"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormLabel>판매 중</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <AsyncButton
          type="submit"
          className="w-full h-12 text-lg mt-4"
          isLoading={isLoading}
        >
          {isLoading ? "프로그램 정보 저장중..." : "프로그램 정보 저장하기"}
        </AsyncButton>
      </form>
    </Form>
  );
}
