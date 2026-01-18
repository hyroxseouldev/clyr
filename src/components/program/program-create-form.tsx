"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
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
import { useTranslations } from "next-intl";

/** 생성용 Schema - 번역 에러 메시지는 컴포넌트에서 처리 */
const programCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["SINGLE", "SUBSCRIPTION"]),
  price: z.string().min(1),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  durationWeeks: z.number().min(1),
  daysPerWeek: z.number().min(1).max(7),
  accessPeriodDays: z.number().nullable().optional(),
  shortDescription: z.string().nullable(),
});

type FormValues = z.infer<typeof programCreateSchema>;

export function ProgramCreateForm() {
  const t = useTranslations("newProgram.form");
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
      const result = await createProgramAction(values);
      if (!result?.success && result?.message) {
        toast.error(t(result.message as any));
        return;
      }
      if (result?.success) {
        toast.success(t("success"));
        router.push(`/coach/dashboard/${result.id}`);
      }
    });
  };

  const typeLabel =
    form.watch("type") === "SINGLE" ? t("singleSale") : t("subscription");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-2xl"
      >
        {/* 기본 정보 */}
        <div className="space-y-6 border rounded-lg p-4">
          <h3 className="text-lg font-semibold">{t("basicInfo")}</h3>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("title")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("titlePlaceholder")} {...field} />
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
                  <Input placeholder={t("slugPlaceholder")} {...field} />
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
                <FormLabel>{t("shortDescription")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={3}
                    placeholder={t("shortDescriptionPlaceholder")}
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
          <h3 className="text-lg font-semibold">{t("salesInfo")}</h3>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("type")}</FormLabel>
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
                    <SelectItem value="SINGLE">{t("singleSale")}</SelectItem>
                    <SelectItem value="SUBSCRIPTION">
                      {t("subscription")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("typeLockWarning")} ({typeLabel})
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
                  <Input
                    type="number"
                    placeholder={t("pricePlaceholder")}
                    {...field}
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
                <FormLabel>{t("accessPeriod")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("accessPeriodPlaceholder")}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("lifetimeAccess")}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 프로그램 구성 */}
        <div className="space-y-6 border rounded-lg p-4">
          <h3 className="text-lg font-semibold">{t("programConfig")}</h3>

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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="durationWeeks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("durationWeeks")}</FormLabel>
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
                  <FormLabel>{t("daysPerWeek")}</FormLabel>
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
          {isLoading ? t("creating") : t("submit")}
        </AsyncButton>
      </form>
    </Form>
  );
}
