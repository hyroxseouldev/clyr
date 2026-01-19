/**
 * Program Detail Client Component
 * Handles sticky navigation tabs and scroll-based section navigation
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Section IDs for scroll navigation
export const SECTIONS = {
  program: "program-intro",
  curriculum: "curriculum-section",
  coach: "coach-section",
} as const;

interface ProgramDetailClientProps {
  children: React.ReactNode;
  tabs: {
    program: string;
    curriculum: string;
    coach: string;
  };
}

export function ProgramDetailClient({
  children,
  tabs,
}: ProgramDetailClientProps) {
  const [activeTab, setActiveTab] = useState<string>("program");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer for active tab tracking
  useEffect(() => {
    const sections = Object.values(SECTIONS)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
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

  const handleTabClick = (tab: string) => {
    const sectionId = SECTIONS[tab as keyof typeof SECTIONS];
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div>
      {/* Sticky Navigation Tabs */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container max-w-[800px] mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabClick}>
            <TabsList className="grid grid-cols-3 w-full bg-transparent h-14 rounded-none p-0">
              <TabsTrigger
                value="program"
                className={cn(
                  "rounded-none border-b-2 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-900 transition-colors",
                  activeTab === "program" ? "border-gray-900" : "border-transparent"
                )}
              >
                {tabs.program}
              </TabsTrigger>
              <TabsTrigger
                value="curriculum"
                className={cn(
                  "rounded-none border-b-2 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-900 transition-colors",
                  activeTab === "curriculum" ? "border-gray-900" : "border-transparent"
                )}
              >
                {tabs.curriculum}
              </TabsTrigger>
              <TabsTrigger
                value="coach"
                className={cn(
                  "rounded-none border-b-2 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-900 transition-colors",
                  activeTab === "coach" ? "border-gray-900" : "border-transparent"
                )}
              >
                {tabs.coach}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
