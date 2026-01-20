/**
 * Program Detail Client Component
 * Handles sticky navigation tabs and scroll-based section navigation
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { BottomBorderTabTrigger } from "@/components/common/bottom-border-tab-trigger";
import { WarningBanner } from "@/components/program/warning-banner";
import { ProgramImageCarousel } from "@/components/program/program-image-carousel";
import { InfoCards } from "@/components/program/info-cards";
import { CurriculumList } from "@/components/program/curriculum-list";
import { CoachSnsLinks } from "@/components/program/coach-sns-links";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/routing";
import type { getProgramBySlugQuery } from "@/db/queries/program";
import { cn } from "@/lib/utils";

// Section IDs for scroll navigation
export const SECTIONS = {
  program: "program-intro",
  curriculum: "curriculum-section",
  coach: "coach-section",
} as const;

type ProgramsDto = Awaited<ReturnType<typeof getProgramBySlugQuery>>;

interface ProgramDetailClientProps {
  program: NonNullable<ProgramsDto>;
}

export function ProgramDetailClient({ program }: ProgramDetailClientProps) {
  const t = useTranslations("programDetail");
  const tProgram = useTranslations("program");
  const [activeTab, setActiveTab] = useState<string>("program");
  const [showPurchaseButton, setShowPurchaseButton] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Main images for carousel
  const mainImages = program.mainImageList || [];

  // Access period text
  const accessPeriodText = program.accessPeriodDays
    ? t("daysAccess", { days: program.accessPeriodDays })
    : t("lifetimeAccess");

  const headingTextClassName = "text-xl font-bold text-primary";
  // Set up intersection observer for active tab tracking
  useEffect(() => {
    const sections = Object.values(SECTIONS)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Special case: when scrolled near bottom, activate last tab (coach)
        const scrollPosition = window.innerHeight + window.pageYOffset;
        const threshold = document.documentElement.scrollHeight - 100;
        if (scrollPosition >= threshold) {
          setActiveTab("coach");
          return;
        }

        // Find the section that's most visible
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Get the entry with the highest intersection ratio
          const mostVisible = visibleEntries.reduce((prev, current) =>
            current.intersectionRatio > prev.intersectionRatio ? current : prev
          );
          const sectionId = mostVisible.target.id;
          const tabKey = Object.keys(SECTIONS).find(
            (key) => SECTIONS[key as keyof typeof SECTIONS] === sectionId
          );
          if (tabKey) {
            setActiveTab(tabKey);
          }
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: "-10% 0px -60% 0px", // Trigger when section is near top
      }
    );

    sections.forEach((section) => {
      if (section) {
        observerRef.current?.observe(section);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Track when tabs become sticky to show/hide purchase button
  useEffect(() => {
    const handleScroll = () => {
      const tabsContainer = tabsContainerRef.current;
      if (!tabsContainer) return;

      const tabsRect = tabsContainer.getBoundingClientRect();
      const tabsTop = tabsRect.top + window.pageYOffset;

      // Show purchase button when scroll reaches tabs position (tabs become sticky)
      setShowPurchaseButton(window.pageYOffset >= tabsTop);
    };

    // Initial check after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(handleScroll, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    const sectionId = SECTIONS[tab as keyof typeof SECTIONS];
    const element = document.getElementById(sectionId);
    if (element) {
      const tabHeight = 56; // h-14 = 56px
      const viewportHeight = window.innerHeight;
      const elementRect = element.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Scroll to center section in viewport
      const targetScroll =
        scrollTop + elementRect.top - viewportHeight / 2 + elementRect.height / 2 - tabHeight;

      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  };

  // Get difficulty labels
  const difficultyLabels = {
    BEGINNER: tProgram("difficulty.BEGINNER"),
    INTERMEDIATE: tProgram("difficulty.INTERMEDIATE"),
    ADVANCED: tProgram("difficulty.ADVANCED"),
  };

  return (
    <div className="min-h-screen bg-white pb-24">
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
        <div className="text-left shrink-0 mb-4">
          <div className="text-3xl font-bold text-gray-900">
            {`${Number(program.price).toLocaleString()} ${t("won")}`}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {`${t("totalWeeksProgram", {
              weeks: program.durationWeeks,
            })} | ${accessPeriodText}`}
          </div>
        </div>
        {!showPurchaseButton && (
          <Button
            asChild
            className="w-full"
            size="xl"
            disabled={!program.isForSale}
          >
            <Link href={`/programs/payment/${program.slug}`}>
              {t("purchase")}
            </Link>
          </Button>
        )}
      </div>

      {/* Purchase Button - Fixed at bottom */}
      {showPurchaseButton && (
        <div className="fixed bottom-0 left-0 right-0 bg-white py-4 px-4 z-40">
          <div className="container max-w-[800px] mx-auto">
            <Button
              asChild
              className="w-full"
              size="xl"
              disabled={!program.isForSale}
            >
              <Link href={`/programs/payment/${program.slug}`}>
                {t("purchase")}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Navigation Tabs */}
      <div ref={tabsContainerRef} className="sticky top-0 z-50 bg-white ">
        <div className="container max-w-[800px] mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabClick}>
            <TabsList className="flex w-full bg-transparent rounded-none p-0 items-stretch justify-start">
              <BottomBorderTabTrigger
                value="program"
                className="data-[state=active]:text-gray-900 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t("tabProgramIntro")}
              </BottomBorderTabTrigger>
              <BottomBorderTabTrigger
                value="curriculum"
                className="data-[state=active]:text-gray-900 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t("tabCurriculum")}
              </BottomBorderTabTrigger>
              <BottomBorderTabTrigger
                value="coach"
                className="data-[state=active]:text-gray-900 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t("tabCoachIntro")}
              </BottomBorderTabTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
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
          <h2 className={cn(headingTextClassName, "mb-6")}>
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
        className="container max-w-[800px] mx-auto px-4 py-6"
      >
        <h2 className={cn(headingTextClassName, "mb-6")}>{t("lessons")}</h2>

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
      <section id={SECTIONS.coach} className="container max-w-[800px] mx-auto">
        {program.coach && (
          <div className="">
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
              <h2 className={cn(headingTextClassName)}>{t("tabCoachIntro")}</h2>

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
                <div className="bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {t("introduction")}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {program.coach.coachProfile.introduction}
                  </p>
                </div>
              )}

              {/* Experience */}
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
    </div>
  );
}
