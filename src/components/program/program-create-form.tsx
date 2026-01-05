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
import { Textarea } from "@/components/ui/textarea";
import { AsyncButton } from "@/components/common/async-button";
import { useTransition } from "react";
import { createProgramAction } from "@/actions";
import { toast } from "sonner";

/** 생성용 Schema */
const programCreateSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  slug: z.string().min(1, "슬러그를 입력하세요"),
  type: z.enum(["SINGLE", "SUBSCRIPTION"]),
  price: z.string().min(1, "가격을 입력하세요"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  durationWeeks: z.number().min(1),
  daysPerWeek: z.number().min(1).max(7),
  accessPeriodDays: z.number().nullable().optional(),
  shortDescription: z.string().nullable(),
});

type FormValues = z.infer<typeof programCreateSchema>;

export function ProgramCreateForm() {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(programCreateSchema),
    defaultValues: {
      title: "",
      slug: "",
      type: "SINGLE",
      price: "0",
      difficulty: "BEGINNER",
      durationWeeks: 1,
      daysPerWeek: 3,
      accessPeriodDays: null,
      shortDescription: null,
    },
  });

  const onSubmit = async (values: FormValues) => {
    startTransition(async () => {
      const result = await createProgramAction(values, []);
      if (result && "error" in result) {
        toast.error(result.error as string);
        return;
      }
      if (result && "success" in result && result.success) {
        toast.success("프로그램 생성 성공");
        router.push(`/coach/dashboard/${result.id}`);
      }
    });
  };

  const typeLabel = form.watch("type") === "SINGLE" ? "단건 판매" : "구독형";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-2xl"
      >
        {/* 기본 정보 */}
        <div className="space-y-6 border rounded-lg p-4">
          <h3 className="text-lg font-semibold">기본 정보</h3>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>프로그램 제목</FormLabel>
                <FormControl>
                  <Input placeholder="예: 12주 런닝 완성" {...field} />
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
                  <Input placeholder="예: 12weeks-running" {...field} />
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
                    placeholder="프로그램을 간단히 설명해주세요"
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 판매 정보 */}
        <div className="space-y-6 border rounded-lg p-4">
          <h3 className="text-lg font-semibold">판매 정보</h3>

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
                <p className="text-xs text-muted-foreground mt-1">
                  판매 방식은 생성 후 수정할 수 없습니다 ({typeLabel})
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
                <FormLabel>가격 (원)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
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
                <FormLabel>수강 기간 (일)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="비워두면 평생소장"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  비워두면 평생 소장
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 프로그램 구성 */}
        <div className="space-y-6 border rounded-lg p-4">
          <h3 className="text-lg font-semibold">프로그램 구성</h3>

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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="durationWeeks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>총 주차</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
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
                      min={1}
                      max={7}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <AsyncButton type="submit" className="w-full" isLoading={isLoading}>
          {isLoading ? "생성 중..." : "프로그램 생성하기"}
        </AsyncButton>
      </form>
    </Form>
  );
}
