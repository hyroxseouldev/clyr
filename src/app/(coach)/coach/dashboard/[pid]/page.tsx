import { getProgramByIdAction } from "@/actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import ProgramInfoTab from "./_components/program-info-tab";
import WorkoutTab from "./_components/workout-tab";
import OrderListTab from "./_components/order-list-tab";
import SettingTab from "./_components/setting-tab";

const CoachDashboardPidPage = async ({
  params,
}: {
  params: { pid: string };
}) => {
  const { pid } = await params;
  const { data: program } = await getProgramByIdAction(pid);

  // Tab 을 추가합나디
  // 프로그램 정보 / 워크 아웃 / 구매 목록 / 설정 메뉴

  const tabs = [
    { label: "프로그램 정보", value: "info" },
    { label: "워크 아웃", value: "workouts" },
    { label: "구매 목록", value: "purchases" },
    { label: "설정", value: "settings" },
  ];

  if (!program) {
    redirect("/coach/dashboard");
  }

  return (
    <Tabs defaultValue="info" className="w-[400px]">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.label === "프로그램 정보" ? (
            <ProgramInfoTab program={program} />
          ) : tab.label === "워크 아웃" ? (
            <WorkoutTab />
          ) : tab.label === "구매 목록" ? (
            <OrderListTab />
          ) : tab.label === "설정" ? (
            <SettingTab />
          ) : null}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CoachDashboardPidPage;
