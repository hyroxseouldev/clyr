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
import { DumbbellIcon } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";

import {
  InfoIcon,
  ShoppingCartIcon,
  Settings2Icon,
  UsersIcon,
  LayoutDashboardIcon,
  UserCircleIcon,
} from "lucide-react";

interface MenuItem {
  titleKey: string;
  url: string;
  iconName: string;
}

const DashboardSidebar = () => {
  const pathname = usePathname();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  const title = "Clyr Coach";
  const menuItems: MenuItem[] = [
    {
      titleKey: "title",
      url: "/coach/dashboard",
      iconName: "LayoutDashboard",
    },
    {
      titleKey: "profile",
      url: "/coach/profile",
      iconName: "UserCircle",
    },
    {
      titleKey: "settings",
      url: "/coach/settings",
      iconName: "Settings2",
    },
  ];
  const iconMap = {
    Info: InfoIcon,
    Dumbbell: DumbbellIcon,
    ShoppingCart: ShoppingCartIcon,
    Users: UsersIcon,
    Settings2: Settings2Icon,
    LayoutDashboard: LayoutDashboardIcon,
    UserCircle: UserCircleIcon,
  };
  return (
    <>
      <SidebarHeader>
        <div className="flex flex-col gap-2 px-2 py-2">
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

export default DashboardSidebar;
