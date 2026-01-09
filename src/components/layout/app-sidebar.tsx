"use client";

import {
  Sidebar,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import UserAvatarDropdown from "@/components/auth/user-avatar-dropdown";
import CoachSidebar from "@/components/layout/coach-sidebar";
import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("auth.signOut");
  // 수정 전: ^/coach/dashboard/([^/]+)
  // 수정 후: ^/(?:[a-z]{2}/)?coach/dashboard/([^/]+)

  const programIdMatch = pathname.match(
    /(?:\/[a-z]{2})?\/coach\/dashboard\/([^/]+)/
  );
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
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <ModeToggle />
              <LanguageSwitcher />
            </div>
          </SidebarMenuItem>
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
            <SidebarMenuButton asChild tooltip={t("title")}>
              <Link href="/signout">
                <LogOutIcon />
                <span>{t("button")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
