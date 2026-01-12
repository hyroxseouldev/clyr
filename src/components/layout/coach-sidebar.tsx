"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DumbbellIcon,
  InfoIcon,
  Settings2Icon,
  UsersIcon,
  LayoutDashboardIcon,
  CalendarIcon,
  HomeIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ClipboardListIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  TrendingUpIcon,
  UserCircleIcon,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { getProgramByIdAction } from "@/actions";
import { useEffect, useState } from "react";
import { type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface MenuItem {
  titleKey: string;
  url: string;
  iconName: string;
}

const CoachSidebar = ({ programId }: { programId: string }) => {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  const [programTitle, setProgramTitle] = useState<string | null>(null);
  const pathname = usePathname();
  const title = programTitle || t('programs');
  const backUrl = "/coach/dashboard";
  const iconMap = {
    Info: InfoIcon,
    Dumbbell: DumbbellIcon,
    Users: UsersIcon,
    Settings2: Settings2Icon,
    Calendar: CalendarIcon,
    Home: HomeIcon,
    ClipboardList: ClipboardListIcon,
    BookOpen: BookOpenIcon,
    ClipboardCheck: ClipboardCheckIcon,
    TrendingUp: TrendingUpIcon,
    UserCircle: UserCircleIcon,
  };
  useEffect(() => {
    if (programId) {
      getProgramByIdAction(programId).then((result) => {
        if (result.success && result.data) {
          setProgramTitle(result.data.title);
        }
      });
    }
  }, [programId]);
  const menuItems: MenuItem[] = [
    {
      titleKey: "home",
      url: `/coach/dashboard/${programId}`,
      iconName: "Home",
    },
    {
      titleKey: "programInfo",
      url: `/coach/dashboard/${programId}/info`,
      iconName: "Info",
    },
    {
      titleKey: "workoutPlan",
      url: `/coach/dashboard/${programId}/plan`,
      iconName: "Calendar",
    },
    {
      titleKey: "workoutRoutine",
      url: `/coach/dashboard/${programId}/workout-routine`,
      iconName: "ClipboardList",
    },
    {
      titleKey: "workoutLibrary",
      url: `/coach/dashboard/${programId}/workout-library`,
      iconName: "BookOpen",
    },
    {
      titleKey: "homework",
      url: `/coach/dashboard/${programId}/homework`,
      iconName: "ClipboardCheck",
    },
    {
      titleKey: "purchases",
      url: `/coach/dashboard/${programId}/purchases`,
      iconName: "TrendingUp",
    },
    {
      titleKey: "memberManagement",
      url: `/coach/dashboard/${programId}/members`,
      iconName: "Users",
    },
    {
      titleKey: "settings",
      url: `/coach/dashboard/${programId}/settings`,
      iconName: "Settings2",
    },
  ];
  return (
    <>
      <SidebarHeader>
        <div className="flex flex-col gap-2 px-2 py-2">
          <Link
            href={backUrl}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeftIcon className="size-4" />
          </Link>
          <div className="flex items-center gap-2">
            <DumbbellIcon className="size-6" />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-lg leading-tight">
                {title}
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{tCommon('filter')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const IconComponent =
                  iconMap[item.iconName as keyof typeof iconMap] ||
                  DumbbellIcon;
                // pathname from next-intl/navigation already excludes locale prefix
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={t(item.titleKey as any)}
                    >
                      <Link href={item.url}>
                        <IconComponent />
                        <span>{t(item.titleKey as any)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
};

export default CoachSidebar;
