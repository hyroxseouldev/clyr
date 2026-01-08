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
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  InfoIcon,
  ShoppingCartIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react";

interface MenuItem {
  title: string;
  url: string;
  iconName: string;
}

const DashboardSidebar = () => {
  const pathname = usePathname();
  const title = "Clyr Coach";
  const menuItems: MenuItem[] = [
    {
      title: "대시보드",
      url: "/coach/dashboard",
      iconName: "LayoutDashboard",
    },
    {
      title: "설정",
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

export default DashboardSidebar;
