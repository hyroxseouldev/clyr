import {
  getDashboardStatsAction,
  getRecentPurchasesAction,
} from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

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
  const t = await getTranslations("dashboard");

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
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalSales")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">{t("stats.count")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalRevenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue.toLocaleString()}
              {t("currency")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.activeUsers")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">{t("stats.users")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.completionRate")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.avgCompletion")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentPurchases.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPurchases.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("recentPurchases.noPurchases")}
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
                        {purchase.userName}
                        {t("recentPurchases.userPurchased")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(purchase.date), "yyyy.MM.dd")}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +{purchase.amount.toLocaleString()}
                    {t("currency")}
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
          <Link href={`/coach/dashboard/${pid}/members`}>
            <div className="text-left">
              <Users className="h-5 w-5 mb-2" />
              <p className="font-medium">{t("memberManagement")}</p>
              <p className="text-xs text-muted-foreground">
                {t("quickLinks.membersView")}
              </p>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-24">
          <Link href={`/coach/dashboard/${pid}/purchases`}>
            <div className="text-left">
              <DollarSign className="h-5 w-5 mb-2" />
              <p className="font-medium">{t("purchases")}</p>
              <p className="text-xs text-muted-foreground">
                {t("quickLinks.salesStatus")}
              </p>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-24">
          <Link href={`/coach/dashboard/${pid}/settings`}>
            <div className="text-left">
              <Calendar className="h-5 w-5 mb-2" />
              <p className="font-medium">{t("settings")}</p>
              <p className="text-xs text-muted-foreground">
                {t("quickLinks.programInfo")}
              </p>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CoachDashboardPidPage;
