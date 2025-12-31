import { getProgramByIdAction } from "@/actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
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
    <div className="container max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{program.title}</h1>
        <Button asChild variant="outline">
          <a href={`/programs/${program.slug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            공개 페이지 보기
          </a>
        </Button>
      </div>
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            {tab.label === "프로그램 정보" ? (
              <ProgramInfoTab program={program} />
            ) : tab.label === "워크 아웃" ? (
              <WorkoutTab programId={pid} />
            ) : tab.label === "구매 목록" ? (
              <OrderListTab programId={pid} />
            ) : tab.label === "설정" ? (
              <SettingTab programId={pid} program={program} />
            ) : null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CoachDashboardPidPage;
