import { getProgramBySlugAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { WarningBanner } from "@/components/program/warning-banner";
import { ProgramImageCarousel } from "@/components/program/program-image-carousel";
import { InfoCards } from "@/components/program/info-cards";
import { CurriculumList } from "@/components/program/curriculum-list";
import { CoachSnsLinks } from "@/components/program/coach-sns-links";
import {
  ProgramDetailClient,
  SECTIONS,
} from "./components/program-detail-client";

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

  const difficultyLabels = {
    BEGINNER: tProgram("difficulty.BEGINNER"),
    INTERMEDIATE: tProgram("difficulty.INTERMEDIATE"),
    ADVANCED: tProgram("difficulty.ADVANCED"),
  };

  // Access period text
  const accessPeriodText = program.accessPeriodDays
    ? t("daysAccess", { days: program.accessPeriodDays })
    : t("lifetimeAccess");

  // Main images for carousel
  const mainImages = program.mainImageList || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Warning Banner (if not for sale) */}
      {!program.isForSale && <WarningBanner message={t("notForSaleWarning")} />}

      {/* Image Carousel */}
      <div className="container max-w-[800px] mx-auto">
        <ProgramImageCarousel images={mainImages} alt={program.title} />
      </div>

      {/* Program Title, Coach, Price */}
      <div className="container max-w-[800px] mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-6 mb-6">
          {/* Left: Title and Coach */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {program.title}
            </h1>

            {/* Coach Info */}
            {program.coach && (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {(program.coach.avatarUrl ||
                    program.coach.coachProfile?.profileImageUrl) && (
                    <AvatarImage
                      src={
                        program.coach.avatarUrl ||
                        program.coach.coachProfile?.profileImageUrl ||
                        undefined
                      }
                    />
                  )}
                  <AvatarFallback>
                    {program.coach.coachProfile?.nickname?.charAt(0) ||
                      program.coach.fullName?.charAt(0) ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">
                    {program.coach.coachProfile?.nickname ||
                      program.coach.fullName}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {t("coach")}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Right: Price and Access Info */}
        </div>
        <div className="text-left shrink-0">
          <div className="text-3xl font-bold text-gray-900">
            {`${Number(program.price).toLocaleString()} ${t("won")}`}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {`${t("totalWeeksProgram", {
              weeks: program.durationWeeks,
            })} | ${accessPeriodText}`}
          </div>
        </div>
        {/* Purchase Button */}
        <div className="sticky bottom-0 bg-white py-4 -mx-4 px-4 mt-4 z-40">
          <Button
            asChild
            className="w-full"
            size="lg"
            disabled={!program.isForSale}
          >
            <Link href={`/programs/payment/${slug}`}>{t("purchase")}</Link>
          </Button>
        </div>
      </div>

      {/* Tabs and Content */}
      <ProgramDetailClient
        tabs={{
          program: t("tabProgramIntro"),
          curriculum: t("tabCurriculum"),
          coach: t("tabCoachIntro"),
        }}
      >
        {/* Program Introduction Section */}
        <section
          id={SECTIONS.program}
          className="container max-w-[800px] mx-auto"
        >
          {/* Program Image (if available) */}
          {program.programImage && (
            <div className="overflow-hidden">
              <img
                src={program.programImage}
                alt={program.title}
                className="w-full object-cover"
              />
            </div>
          )}
          <div className="px-4 py-6">
            <h2 className="text-2xl font-bold text-primary mb-6">
              {t("tabProgramIntro")}
            </h2>

            {/* Description */}
            {program.description && (
              <div
                className="prose max-w-none mb-12 text-gray-700"
                dangerouslySetInnerHTML={{ __html: program.description }}
              />
            )}

            {/* Info Cards */}
            <InfoCards
              difficulty={program.difficulty}
              difficultyLabel={difficultyLabels[program.difficulty]}
              durationWeeks={program.durationWeeks}
              daysPerWeek={program.daysPerWeek}
              durationLabel={t("durationPeriod")}
              weeklyTrainingLabel={t("weeklyTraining")}
            />
          </div>
        </section>

        {/* Curriculum Section */}
        <section
          id={SECTIONS.curriculum}
          className="container max-w-[800px] mx-auto px-4 py-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("lessons")}
          </h2>

          {program.curriculum && program.curriculum.length > 0 ? (
            <CurriculumList
              curriculum={program.curriculum}
              weekLabel={(n) => t("week", { n })}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              {t("noCurriculum")}
            </div>
          )}
        </section>

        {/* Coach Section */}
        <section
          id={SECTIONS.coach}
          className="container max-w-[800px] mx-auto"
        >
          {program.coach && (
            <div className="space-y-8">
              {/* Representative Image */}
              {program.coach.coachProfile?.representativeImage && (
                <div className="overflow-hidden">
                  <img
                    src={program.coach.coachProfile.representativeImage}
                    alt={`${
                      program.coach.coachProfile?.nickname ||
                      program.coach.fullName
                    } representative image`}
                    className="w-full object-cover aspect-4/3"
                  />
                </div>
              )}

              {/* Coach Info Card */}
              <div className="px-4 py-6 space-y-6">
                <h2 className="text-2xl font-bold text-primary">
                  {t("tabCoachIntro")}
                </h2>

                {/* Coach Name */}
                <div>
                  <div className="text-xl font-semibold text-gray-900">
                    {program.coach.coachProfile?.nickname ||
                      program.coach.fullName}{" "}
                    {t("coach")}
                  </div>
                </div>

                {/* Introduction */}
                {program.coach.coachProfile?.introduction && (
                  <div className="bg-white  p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {t("introduction")}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {program.coach.coachProfile.introduction}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {/* Description like this 
            {program.description && (
              <div
                className="prose max-w-none mb-12 text-gray-700"
                dangerouslySetInnerHTML={{ __html: program.description }}
              />
            )} */}
                {program.coach.coachProfile?.experience && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: program.coach.coachProfile.experience,
                    }}
                  />
                )}

                {/* SNS Links */}
                {program.coach.coachProfile?.snsLinks && (
                  <div className="">
                    <CoachSnsLinks
                      snsLinks={program.coach.coachProfile.snsLinks}
                      labels={{
                        instagram: t("instagram"),
                        youtube: t("youtube"),
                        blog: t("blog"),
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </ProgramDetailClient>
    </div>
  );
};

export default PublicCommercePage;
