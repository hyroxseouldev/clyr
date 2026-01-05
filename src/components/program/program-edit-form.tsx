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
import { updateProgramAction } from "@/actions";
import { toast } from "sonner";
import { ImageForm, TiptapForm } from "@/components/form";

/** 수정용 Schema - 전체 정보 */
const programEditSchema = z.object({
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
  thumbnailUrl: z.string().nullable(),
  isPublic: z.boolean(),
  isForSale: z.boolean(),
});

type FormValues = z.infer<typeof programEditSchema>;

export function ProgramEditForm({ initialData }: { initialData: any }) {
  const [isLoading, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(programEditSchema),
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
      thumbnailUrl: initialData?.thumbnailUrl ?? null,
      isPublic: !!initialData?.isPublic,
      isForSale: !!initialData?.isForSale,
    },
  });

  const onSubmit = async (values: FormValues) => {
    startTransition(async () => {
      const result = await updateProgramAction(initialData.id, values);
      if (result && "error" in result) {
        toast.error(result.error as string);
        return;
      }
      if (result && "success" in result && result.success) {
        toast.success("프로그램 수정 성공");
      }
    });
  };

  const typeLabel = form.watch("type") === "SINGLE" ? "단건 판매" : "구독형";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-10 p-4 rounded-lg border"
      >
        {/* 썸네일 이미지 업로드 */}
        <ImageForm
          name="thumbnailUrl"
          label="썸네일 이미지"
          form={form}
          bucketName="program-thumbnails"
          path="thumbnails"
          maxFileSize={5 * 1024 * 1024}
        />

        <div className="space-y-6 border rounded-lg p-4">
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

          {/* 판매 방식 - 읽기 전용 (disabled) */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>판매 방식</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled
                >
                  <FormControl>
                    <SelectTrigger className="bg-muted">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SINGLE">단건 판매</SelectItem>
                    <SelectItem value="SUBSCRIPTION">구독형</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  판매 방식은 생성 시에만 설정할 수 있습니다 ({typeLabel})
                </p>
                <FormMessage />
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
                <FormMessage />
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
                <FormMessage />
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
                <FormMessage />
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
                <FormMessage />
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
                <FormMessage />
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
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={3}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <TiptapForm
              name="description"
              label="상세 설명"
              form={form}
              placeholder="프로그램에 대한 상세 설명을 입력하세요..."
              minHeight="200px"
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

        <AsyncButton type="submit" className="w-full" isLoading={isLoading}>
          {isLoading ? "프로그램 정보 저장중..." : "프로그램 정보 저장하기"}
        </AsyncButton>
      </form>
    </Form>
  );
}
