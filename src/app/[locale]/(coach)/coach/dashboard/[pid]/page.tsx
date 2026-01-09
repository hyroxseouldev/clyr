import { getDashboardStatsAction, getRecentPurchasesAction } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  activeUsers: number;
  completionRate: number;
}

interface RecentPurchase {
  id: string;
  userName: string;
  date: Date;
  amount: number;
}

const CoachDashboardPidPage = async ({
  params,
}: {
  params: { pid: string };
}) => {
  const { pid } = await params;

  // Fetch real data
  const [statsResult, purchasesResult] = await Promise.all([
    getDashboardStatsAction(pid),
    getRecentPurchasesAction(pid, 10),
  ]);

  const stats: DashboardStats = statsResult.success
    ? (statsResult.data as DashboardStats)
    : {
        totalSales: 0,
        totalRevenue: 0,
        activeUsers: 0,
        completionRate: 0,
      };

  const recentPurchases: RecentPurchase[] = purchasesResult.success
    ? (purchasesResult.data as RecentPurchase[])
    : [];

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
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수익</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue.toLocaleString()}원
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료율</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">평균 완료율</p>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 구매 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPurchases.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              구매 내역이 없습니다.
            </p>
          ) : (
            <div className="space-y-4">
              {recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {purchase.userName}님이 구매함
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(purchase.date), "yyyy.MM.dd", {
                          locale: ko,
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +{purchase.amount.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          )}
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
