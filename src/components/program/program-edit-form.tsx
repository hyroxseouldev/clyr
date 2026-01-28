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
import { Separator } from "@/components/ui/separator";
import { AsyncButton } from "@/components/common/async-button";
import { useTransition } from "react";
import { updateProgramAction } from "@/actions";
import { toast } from "sonner";
import { ImageForm, MultiImageForm, TiptapForm } from "@/components/form";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";

/** 수정용 Schema - 전체 정보 */
const programEditSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["SINGLE", "SUBSCRIPTION"]),
  price: z.string().min(1),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  durationWeeks: z.number().min(1),
  daysPerWeek: z.number().min(1).max(7),
  accessPeriodDays: z.number().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  isForSale: z.boolean(),
  // ==================== NEW FIELDS ====================
  mainImageList: z.array(z.string()),
  programImage: z.string().nullable(),
  curriculum: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })
  ),
});

type FormValues = z.infer<typeof programEditSchema>;

export function ProgramEditForm({ initialData }: { initialData: any }) {
  const t = useTranslations("programEdit");
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
      // Format dates to YYYY-MM-DD for input type="date"
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().split('T')[0]
        : null,
      endDate: initialData?.endDate
        ? new Date(initialData.endDate).toISOString().split('T')[0]
        : null,
      description: initialData?.description ?? null,
      isPublic: !!initialData?.isPublic,
      isForSale: !!initialData?.isForSale,
      // ==================== NEW FIELDS ====================
      mainImageList: (initialData?.mainImageList as string[] | undefined) ?? [],
      programImage: initialData?.programImage ?? null,
      curriculum:
        (initialData?.curriculum as
          | Array<{ title: string; description: string }>
          | undefined) ?? [],
    } as FormValues,
  });

  const onSubmit = async (values: FormValues) => {
    startTransition(async () => {
      // Convert date strings to Date objects for database
      const submitData = {
        ...values,
        startDate: values.startDate ? new Date(values.startDate) : null,
        endDate: values.endDate ? new Date(values.endDate) : null,
      };

      const result = await updateProgramAction(initialData.id, submitData);
      if (result && "error" in result) {
        toast.error(result.error as string);
        return;
      }
      if (result && "success" in result && result.success) {
        toast.success(t("saveSuccess"));
      }
    });
  };

  const typeLabel =
    form.watch("type") === "SINGLE" ? t("singleSale") : t("subscription");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-10 p-4 rounded-lg border"
      >
        {/* ==================== 메인 ==================== */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{t("sectionMain")}</h2>

          {/* 메인 이미지 리스트 (다중) */}
          <MultiImageForm
            name="mainImageList"
            label={t("mainImageList")}
            form={form}
            bucketName="public-assets"
            path="program/main-images"
            maxFileSize={5 * 1024 * 1024}
            maxFiles={5}
            crop={{
              enabled: true,
              aspectRatio: "portrait",
              shape: "rect",
              minWidth: 200,
              minHeight: 200,
            }}
          />

          <div className="space-y-6 rounded-lg">
            {/* 기본 정보 세션 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("programTitle")}</FormLabel>
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
                  <FormLabel>{t("slug")}</FormLabel>
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
                  <FormLabel>{t("saleType")}</FormLabel>
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
                      <SelectItem value="SINGLE">{t("singleSale")}</SelectItem>
                      <SelectItem value="SUBSCRIPTION">
                        {t("subscription")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("saleTypeReadOnly", { type: typeLabel })}
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
                  <FormLabel>{t("price")}</FormLabel>
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
                  <FormLabel>{t("difficulty")}</FormLabel>
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
                      <SelectItem value="BEGINNER">{t("beginner")}</SelectItem>
                      <SelectItem value="INTERMEDIATE">
                        {t("intermediate")}
                      </SelectItem>
                      <SelectItem value="ADVANCED">{t("advanced")}</SelectItem>
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
                  <FormLabel>{t("totalWeeks")}</FormLabel>
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
                  <FormLabel>{t("daysPerWeek")}</FormLabel>
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
                  <FormLabel>{t("accessPeriodDays")}</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("startDate")}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : e.target.value
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
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("endDate")}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6 border p-4 rounded-lg bg-slate-50">
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel>{t("isPublic")}</FormLabel>
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
                    <FormLabel>{t("isForSale")}</FormLabel>
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
        </div>

        <Separator className="my-8" />

        {/* ==================== 프로그램 ==================== */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{t("sectionProgram")}</h2>

          {/* 프로그램 이미지 (단일) */}
          <ImageForm
            name="programImage"
            label={t("programImage")}
            form={form}
            bucketName="public-assets"
            path="program/program-images"
            maxFileSize={5 * 1024 * 1024}
            crop={{
              enabled: true,
              aspectRatio: "portrait",
              shape: "rect",
              minWidth: 800,
              minHeight: 450,
            }}
          />

          {/* 상세 설명 */}
          <TiptapForm
            name="description"
            label={t("description")}
            form={form}
            placeholder={t("descriptionPlaceholder")}
            minHeight="200px"
          />
        </div>

        <Separator className="my-8" />

        {/* ==================== 레슨 ==================== */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{t("sectionLessons")}</h2>

          <FormField
            control={form.control}
            name="curriculum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("curriculum")}</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {field.value?.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder={t("curriculumTitle")}
                            value={item.title}
                            onChange={(e) => {
                              const newCurriculum = [...(field.value ?? [])];
                              newCurriculum[index].title = e.target.value;
                              field.onChange(newCurriculum);
                            }}
                          />
                          <Input
                            placeholder={t("curriculumDescription")}
                            value={item.description}
                            onChange={(e) => {
                              const newCurriculum = [...(field.value ?? [])];
                              newCurriculum[index].description = e.target.value;
                              field.onChange(newCurriculum);
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newCurriculum = [...(field.value ?? [])];
                            newCurriculum.splice(index, 1);
                            field.onChange(newCurriculum);
                          }}
                          className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                          title={t("delete")}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange([
                          ...(field.value ?? []),
                          { title: "", description: "" },
                        ]);
                      }}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t("addCurriculum")}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <AsyncButton type="submit" className="w-full" isLoading={isLoading}>
          {isLoading ? t("saving") : t("save")}
        </AsyncButton>
      </form>
    </Form>
  );
}
