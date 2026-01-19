import { getProgramBySlugAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <ProgramDetailClient
      tabs={{
        program: t("tabProgramIntro"),
        curriculum: t("tabCurriculum"),
        coach: t("tabCoachIntro"),
      }}
    >
      {/* Warning Banner (if not for sale) */}
      {!program.isForSale && (
        <WarningBanner message={t("notForSaleWarning")} />
      )}

      {/* Image Carousel */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <ProgramImageCarousel
          images={mainImages}
          alt={program.title}
        />
      </div>

      {/* Program Title, Coach, Price */}
      <div className="container max-w-4xl mx-auto px-4 pb-6">
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
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold text-gray-900">
              {Number(program.price).toLocaleString()}
              <span className="text-lg font-normal text-gray-600 ml-1">
                {t("won")}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {t("totalWeeksProgram", { weeks: program.durationWeeks })}
            </div>
            <div className="text-sm text-gray-600">
              {accessPeriodText}
            </div>
          </div>
        </div>

        {/* Sticky Purchase Button (mobile) */}
        <div className="md:hidden sticky bottom-0 bg-white border-t border-gray-200 py-4 -mx-4 px-4 mt-4 z-40">
          <Button
            asChild
            className="w-full"
            size="lg"
            disabled={!program.isForSale}
          >
            <Link href={`/programs/payment/${slug}`}>
              {t("purchase")}
            </Link>
          </Button>
        </div>

        {/* Desktop Purchase Button */}
        <div className="hidden md:block">
          <Button
            asChild
            className="w-full max-w-xs"
            size="lg"
            disabled={!program.isForSale}
          >
            <Link href={`/programs/payment/${slug}`}>
              {t("purchase")}
            </Link>
          </Button>
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* Program Introduction Section */}
      <section id={SECTIONS.program} className="container max-w-4xl mx-auto px-4 py-12">
        {/* Program Image (if available) */}
        {program.programImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={program.programImage}
              alt={program.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
      </section>

      <Separator className="bg-gray-200" />

      {/* Curriculum Section */}
      <section
        id={SECTIONS.curriculum}
        className="container max-w-4xl mx-auto px-4 py-12"
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
            No curriculum information available.
          </div>
        )}
      </section>

      <Separator className="bg-gray-200" />

      {/* Coach Section */}
      <section
        id={SECTIONS.coach}
        className="container max-w-4xl mx-auto px-4 py-12"
      >
        {program.coach && (
          <div>
            {/* Representative Image */}
            {program.coach.coachProfile?.representativeImage && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={program.coach.coachProfile.representativeImage}
                  alt={`${program.coach.coachProfile?.nickname || program.coach.fullName} representative image`}
                  className="w-full object-cover max-h-96"
                />
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("tabCoachIntro")}
            </h2>

            {/* Coach Name */}
            <div className="text-xl font-semibold text-gray-900 mb-4">
              {program.coach.coachProfile?.nickname || program.coach.fullName}
            </div>

            {/* Introduction */}
            {program.coach.coachProfile?.introduction && (
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {program.coach.coachProfile.introduction}
                </p>
              </div>
            )}

            {/* Experience */}
            {program.coach.coachProfile?.experience && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">경력</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {program.coach.coachProfile.experience}
                </p>
              </div>
            )}

            {/* Certifications */}
            {program.coach.coachProfile?.certifications &&
              program.coach.coachProfile.certifications.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    자격증
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {program.coach.coachProfile.certifications.map(
                      (cert, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-gray-100 text-gray-800"
                        >
                          {cert}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* SNS Links */}
            {program.coach.coachProfile?.snsLinks && (
              <CoachSnsLinks
                snsLinks={program.coach.coachProfile.snsLinks}
                labels={{
                  instagram: t("instagram"),
                  youtube: t("youtube"),
                  blog: t("blog"),
                }}
              />
            )}
          </div>
        )}
      </section>
    </ProgramDetailClient>
  );
};

export default PublicCommercePage;
