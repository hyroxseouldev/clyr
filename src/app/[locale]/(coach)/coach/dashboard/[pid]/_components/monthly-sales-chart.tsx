"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";

type MonthlySalesData = {
  year: number;
  month: number;
  totalAmount: number;
  orderCount: number;
};

type MonthlySalesChartProps = {
  data: MonthlySalesData[];
};

export default function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  const t = useTranslations("dashboard.monthlySalesChart");
  const tStats = useTranslations("dashboard.stats");

  // 최근 12개월 데이터 생성 (데이터가 없는 달도 포함)
  const chartData = useMemo(() => {
    const result: Array<{
      month: string;
      amount: number;
      count: number;
    }> = [];

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // 최근 12개월 데이터 생성
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // 해당 월 데이터 찾기
      const monthData = data.find((d) => d.year === year && d.month === month);

      result.push({
        month: t("month", { month }),
        amount: monthData?.totalAmount || 0,
        count: monthData?.orderCount || 0,
      });
    }

    return result;
  }, [data, t]);

  // 총 매출 계산
  const totalSales = useMemo(() => {
    return data.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [data]);

  // 총 주문수 계산
  const totalOrders = useMemo(() => {
    return data.reduce((sum, item) => sum + item.orderCount, 0);
  }, [data]);

  // 포맷팅 함수
  const formatAmount = (value: number) => {
    return `${(value / 10000).toFixed(0)}${t("tenThousandWon")}`;
  };

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">{t("totalSales")}</p>
          <p className="text-2xl font-bold">
            {formatAmount(totalSales)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">{t("totalOrders")}</p>
          <p className="text-2xl font-bold">{totalOrders}{tStats("count")}</p>
        </div>
      </div>

      {/* 차트 */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">{t("monthlySalesStatus")}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="amount" orientation="left" tickFormatter={formatAmount} />
            <YAxis yAxisId="count" orientation="right" />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === t("sales")) return formatAmount(value);
                return `${value}${tStats("count")}`;
              }}
            />
            <Legend />
            <Bar
              yAxisId="amount"
              dataKey="amount"
              fill="hsl(var(--primary))"
              name={t("sales")}
            />
            <Bar
              yAxisId="count"
              dataKey="count"
              fill="hsl(var(--muted))"
              name={t("orderCount")}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
