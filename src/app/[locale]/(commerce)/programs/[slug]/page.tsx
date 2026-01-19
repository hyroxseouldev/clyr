import { getProgramBySlugAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle2,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

/**
 * 프로그램 상세 및 구매 페이지
 */
const PublicCommercePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const { data: program } = await getProgramBySlugAction(slug);
  const t = await getTranslations("programDetail");
  const tProgram = await getTranslations("program");
  const tCommon = await getTranslations("common");

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("notFound")}</h1>
          <p className="text-gray-600 mt-2">{t("notFoundDesc")}</p>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    BEGINNER: "bg-green-100 text-green-800",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800",
    ADVANCED: "bg-red-100 text-red-800",
  };

  const difficultyLabels = {
    BEGINNER: tProgram("difficulty.BEGINNER"),
    INTERMEDIATE: tProgram("difficulty.INTERMEDIATE"),
    ADVANCED: tProgram("difficulty.ADVANCED"),
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge>
              {program.type === "SINGLE" ? t("singleSale") : t("subscription")}
            </Badge>
            <Badge
              variant={program.isPublic ? "default" : "secondary"}
              className={cn(
                "gap-1",
                program.isPublic
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              )}
            >
              {program.isPublic ? (
                <>
                  <Eye className="h-3 w-3" />
                  {t("public")}
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  {t("private")}
                </>
              )}
            </Badge>
            {!program.isForSale && (
              <Badge variant="outline" className="text-gray-500">
                {t("notForSale")}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">{program.title}</h1>
          <p className="text-xl text-gray-600">
            {program.description?.substring(0, 200) || ""}
          </p>
        </div>

        {/* 메타 정보 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 border rounded">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm text-gray-600">{t("difficulty")}</div>
            <Badge
              className={cn(
                difficultyColors[program.difficulty],
                "mt-1 text-sm"
              )}
            >
              {difficultyLabels[program.difficulty]}
            </Badge>
          </div>
          <div className="text-center p-4 border rounded">
            <Calendar className="h-5 w-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm text-gray-600">{t("totalDuration")}</div>
            <div className="font-bold mt-1">
              {program.durationWeeks}
              {t("weeks")}
            </div>
          </div>
          <div className="text-center p-4 border rounded">
            <Clock className="h-5 w-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm text-gray-600">{t("perWeek")}</div>
            <div className="font-bold mt-1">{program.daysPerWeek}</div>
          </div>
          <div className="text-center p-4 border rounded">
            <User className="h-5 w-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm text-gray-600">{t("accessPeriod")}</div>
            <div className="font-bold mt-1">
              {program.accessPeriodDays
                ? `${program.accessPeriodDays}${t("days")}`
                : t("lifetime")}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 상세 설명 */}
            {program.description && (
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  {t("programDetails")}
                </h2>
                <div
                  className="prose max-w-none p-6 border rounded"
                  dangerouslySetInnerHTML={{ __html: program.description }}
                />
              </section>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 코치 정보 */}
            {program.coach && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("coachIntro")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    {program.coach.avatarUrl ? (
                      <img
                        src={program.coach.avatarUrl}
                        alt={program.coach.fullName || "Coach"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : program.coach.coachProfile?.profileImageUrl ? (
                      <img
                        src={program.coach.coachProfile.profileImageUrl}
                        alt={program.coach.fullName || "Coach"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                        {program.coach.fullName?.charAt(0) || "C"}
                      </div>
                    )}
                    <div>
                      <div className="font-bold">
                        {program.coach.coachProfile?.nickname ||
                          program.coach.fullName}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {t("coach")}
                      </Badge>
                    </div>
                  </div>
                  {program.coach.coachProfile?.introduction && (
                    <p className="text-sm text-gray-600">
                      {program.coach.coachProfile.introduction}
                    </p>
                  )}
                  {program.coach.coachProfile?.certifications &&
                    program.coach.coachProfile.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {program.coach.coachProfile.certifications.map(
                          (cert, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {cert}
                            </Badge>
                          )
                        )}
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* 구매 카드 */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-sm text-gray-600">
                    {t("paymentAmount")}
                  </div>
                  <div className="text-3xl font-bold mt-1">
                    {Number(program.price).toLocaleString()}
                    {t("won")}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-600" />
                    <span>{t("features.feedback")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-600" />
                    <span>{t("features.curriculum")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-600" />
                    <span>{t("features.anytime")}</span>
                  </div>
                </div>

                {program.isForSale ? (
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/programs/payment/${slug}`}>
                      {t("purchase")}
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full" size="lg">
                    {t("notAvailable")}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCommercePage;
