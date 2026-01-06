import { getMyAccountAction } from "@/actions/account";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import AppSidebar from "./_components/app-sidebar";
import { getProgramByIdAction } from "@/actions";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getMyAccountAction();

  if (!result.success || !result.data) {
    return null;
  }

  const user = result.data;

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
        }}
      />
      <SidebarInset>
        {/* Header */}
        <header className="h-16 shrink-0 border-b bg-white px-4 md:px-6">
          <div className="flex h-full items-center gap-4">
            <SidebarTrigger />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6 md:p-10">
            <div className="pb-24">{children}</div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
