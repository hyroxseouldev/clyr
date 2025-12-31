import DashboardHeader from "./_components/dashboard-header";
import { getMyAccountAction } from "@/actions/account";

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
    // 1. 전체 화면을 flex-col로 설정하고 스크롤을 막음
    <div className="flex h-screen flex-col overflow-hidden">
      {/* 2. 상단: 높이 고정 (shrink-0을 줘야 본문에 안 밀림) */}
      <header className="h-16 shrink-0 border-b bg-white px-6">
        <div className="mx-auto flex h-full max-w-7xl items-center">
          <DashboardHeader
            user={{
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              avatarUrl: user.avatarUrl,
            }}
          />
        </div>
      </header>

      {/* 3. 하단: flex-1로 남은 공간 다 먹고, 여기만 스크롤 허용 */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6 md:p-10">
          {/* 하단 버튼 안 가려지게 안쪽 여백(pb-24)만 확실히 */}
          <div className="pb-24">{children}</div>
        </div>
      </main>
    </div>
  );
}
