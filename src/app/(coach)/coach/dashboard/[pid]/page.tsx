import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react";

const CoachDashboardPidPage = async ({
  params,
}: {
  params: { pid: string };
}) => {
  const { pid } = await params;

  // 임시 데이터
  const mockStats = {
    totalSales: 156,
    totalRevenue: 15600000,
    activeUsers: 89,
    completionRate: 68,
  };

  const mockRecentActivity = [
    { id: 1, type: "purchase", user: "홍길동", date: "2026-01-08", amount: 99000 },
    { id: 2, type: "purchase", user: "김철수", date: "2026-01-07", amount: 99000 },
    { id: 3, type: "completion", user: "이영희", date: "2026-01-07", week: 4 },
    { id: 4, type: "purchase", user: "박민수", date: "2026-01-06", amount: 99000 },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">프로그램 통계 및 활동 현황</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 판매량</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> 지난달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수익</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.totalRevenue.toLocaleString()}원
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> 지난달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> 지난달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료율</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              평균 완료율
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    {activity.type === "purchase" ? (
                      <Users className="h-4 w-4 text-green-600" />
                    ) : (
                      <Calendar className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {activity.type === "purchase"
                        ? `${activity.user}님이 구매함`
                        : `${activity.user}님이 ${activity.week}주차 완료`}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                {activity.type === "purchase" && activity.amount && (
                  <span className="text-sm font-semibold text-green-600">
                    +{activity.amount.toLocaleString()}원
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 빠른 링크 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button asChild variant="outline" className="h-24">
          <a href={`/coach/dashboard/${pid}/members`}>
            <div className="text-left">
              <Users className="h-5 w-5 mb-2" />
              <p className="font-medium">회원 관리</p>
              <p className="text-xs text-muted-foreground">프로그램 회원 조회</p>
            </div>
          </a>
        </Button>

        <Button asChild variant="outline" className="h-24">
          <a href={`/coach/dashboard/${pid}/purchases`}>
            <div className="text-left">
              <DollarSign className="h-5 w-5 mb-2" />
              <p className="font-medium">구매 내역</p>
              <p className="text-xs text-muted-foreground">판매 현황 확인</p>
            </div>
          </a>
        </Button>

        <Button asChild variant="outline" className="h-24">
          <a href={`/coach/dashboard/${pid}/settings`}>
            <div className="text-left">
              <Calendar className="h-5 w-5 mb-2" />
              <p className="font-medium">프로그램 설정</p>
              <p className="text-xs text-muted-foreground">프로그램 정보 수정</p>
            </div>
          </a>
        </Button>
      </div>
    </div>
  );
};

export default CoachDashboardPidPage;
