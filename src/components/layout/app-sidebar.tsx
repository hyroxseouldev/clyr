"use client";

import {
  Sidebar,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatarDropdown from "@/components/auth/user-avatar-dropdown";
import CoachSidebar from "@/components/layout/coach-sidebar";
import DashboardSidebar from "@/components/layout/dashboard-sidebar";

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
  // 경로에서 프로그램 ID 추출
  const programIdMatch = pathname.match(/^\/coach\/dashboard\/([^/]+)/);
  const programId = programIdMatch ? programIdMatch[1] : null;

  return (
    <Sidebar collapsible="icon">
      {programId ? (
        <CoachSidebar programId={programId} />
      ) : (
        <DashboardSidebar />
      )}
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
