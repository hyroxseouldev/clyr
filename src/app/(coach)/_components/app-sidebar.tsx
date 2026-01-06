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
  LayoutDashboardIcon,
  UsersIcon,
  Settings2Icon,
  LogOutIcon,
  DumbbellIcon,
  InfoIcon,
  ShoppingCartIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UserAvatarDropdown from "@/components/auth/user-avatar-dropdown";
import { getProgramByIdAction } from "@/actions";

// Icon mapping for serializable string names
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboardIcon,
  Users: UsersIcon,
  Settings2: Settings2Icon,
  Dumbbell: DumbbellIcon,
  Info: InfoIcon,
  ShoppingCart: ShoppingCartIcon,
};

interface MenuItem {
  title: string;
  url: string;
  iconName: string;
}

interface AppSidebarProps {
  user?: {
    id: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
}

export default function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  const [programTitle, setProgramTitle] = useState<string | null>(null);

  // 경로에서 프로그램 ID 추출
  const programIdMatch = pathname.match(/^\/coach\/dashboard\/([^/]+)/);
  const programId = programIdMatch ? programIdMatch[1] : null;

  // 메뉴 아이템 결정
  let menuItems: MenuItem[] = [];
  let title = "Clyr Coach";
  let subtitle: string | undefined;
  let backUrl: string | undefined;

  useEffect(() => {
    if (programId) {
      getProgramByIdAction(programId).then((result) => {
        if (result.success && result.data) {
          setProgramTitle(result.data.title);
        }
      });
    }
  }, [programId]);

  if (programId) {
    // 프로그램 상세 페이지
    title = programTitle || "프로그램";
    subtitle = "관리";
    backUrl = "/coach/dashboard";
    menuItems = [
      {
        title: "프로그램 정보",
        url: `/coach/dashboard/${programId}`,
        iconName: "Info",
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
  } else {
    // 메인 대시보드
    menuItems = [
      {
        title: "대시보드",
        url: "/coach/dashboard",
        iconName: "LayoutDashboard",
      },
      {
        title: "회원 관리",
        url: "/coach/members",
        iconName: "Users",
      },
      {
        title: "설정",
        url: "/coach/settings",
        iconName: "Settings2",
      },
    ];
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-col gap-2 px-2 py-2">
          {backUrl && (
            <Link
              href={backUrl}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ←{" "}
              <span className="group-data-[collapsible=icon]:hidden">
                뒤로가기
              </span>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <DumbbellIcon className="size-6" />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-lg leading-tight">
                {title}
              </span>
              {subtitle && (
                <span className="text-xs text-muted-foreground">
                  {subtitle}
                </span>
              )}
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
                const IconComponent = iconMap[item.iconName] || DumbbellIcon;
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
      <SidebarFooter>
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-2">
                <UserAvatarDropdown user={user} />
                {user.fullName && (
                  <span className="text-sm group-data-[collapsible=icon]:hidden">
                    {user.fullName}
                  </span>
                )}
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="로그아웃">
              <Link href="/signout">
                <LogOutIcon />
                <span>로그아웃</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
