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
} from "@/components/ui/sidebar";
import {
  DumbbellIcon,
  InfoIcon,
  ShoppingCartIcon,
  Settings2Icon,
  UsersIcon,
  LayoutDashboardIcon,
  CalendarIcon,
  HomeIcon,
} from "lucide-react";
import Link from "next/link";
import { getProgramByIdAction } from "@/actions";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

interface MenuItem {
  title: string;
  url: string;
  iconName: string;
}

const CoachSidebar = ({ programId }: { programId: string }) => {
  const [programTitle, setProgramTitle] = useState<string | null>(null);
  const pathname = usePathname();
  const title = programTitle || "프로그램";
  const backUrl = "/coach/dashboard";
  const iconMap = {
    Info: InfoIcon,
    Dumbbell: DumbbellIcon,
    ShoppingCart: ShoppingCartIcon,
    Users: UsersIcon,
    Settings2: Settings2Icon,
    Calendar: CalendarIcon,
    Home: HomeIcon,
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
      title: "홈",
      url: `/coach/dashboard/${programId}`,
      iconName: "Home",
    },
    {
      title: "프로그램 설명",
      url: `/coach/dashboard/${programId}/info`,
      iconName: "Info",
    },
    {
      title: "프로필 편집",
      url: `/coach/dashboard/${programId}/profile`,
      iconName: "Users",
    },
    {
      title: "플랜",
      url: `/coach/dashboard/${programId}/plan`,
      iconName: "Calendar",
    },
    {
      title: "운동",
      url: `/coach/dashboard/${programId}/workout`,
      iconName: "Dumbbell",
    },
    {
      title: "워크아웃",
      url: `/coach/dashboard/${programId}/workouts`,
      iconName: "Dumbbell",
    },
    {
      title: "구매 목록",
      url: `/coach/dashboard/${programId}/purchases`,
      iconName: "ShoppingCart",
    },
    {
      title: "회원 목록",
      url: `/coach/dashboard/${programId}/members`,
      iconName: "Users",
    },
    {
      title: "설정",
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
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ←{" "}
            <span className="group-data-[collapsible=icon]:hidden">
              뒤로가기
            </span>
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
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const IconComponent =
                  iconMap[item.iconName as keyof typeof iconMap] ||
                  DumbbellIcon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <IconComponent />
                        <span>{item.title}</span>
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
