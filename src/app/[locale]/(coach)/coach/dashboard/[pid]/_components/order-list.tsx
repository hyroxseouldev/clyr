"use client";

import { useRouter } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRightIcon, UserIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type Order = {
  id: string;
  amount: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  buyer: {
    id: string;
    email: string;
    fullName: string | null;
  };
  program: {
    id: string;
    title: string;
  };
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type OrderListProps = {
  initialOrders: Order[];
  initialPagination: Pagination;
  programId: string;
};

const STATUS_LABELS = {
  PENDING: "대기",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

const STATUS_VARIANTS = {
  PENDING: "secondary" as const,
  COMPLETED: "default" as const,
  CANCELLED: "destructive" as const,
};

export default function OrderList({
  initialOrders,
  initialPagination,
  programId,
}: OrderListProps) {
  const router = useRouter();

  // 주문 상태 포맷팅
  const formatAmount = (amount: string) => {
    const num = Number(amount);
    return `${(num / 10000).toFixed(1)}만원`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 주문 클릭 핸들러
  const handleOrderClick = (orderId: string) => {
    router.push(`/coach/dashboard/${programId}/purchases/${orderId}`);
  };

  return (
    <div className="space-y-4">
      {/* 주문 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>주문 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {initialOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UserIcon className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">주문 내역이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>구매자</TableHead>
                    <TableHead>프로그램</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>주문일</TableHead>
                    <TableHead className="text-right">상세</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOrderClick(order.id)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.buyer.fullName || order.buyer.email}
                          </p>
                          {order.buyer.fullName && (
                            <p className="text-sm text-muted-foreground">
                              {order.buyer.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{order.program.title}</TableCell>
                      <TableCell>{formatAmount(order.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[order.status]}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ChevronRightIcon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              {initialPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: initialPagination.totalPages }).map(
                    (_, i) => i + 1
                  ).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === initialPagination.page ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => router.push(`?page=${pageNum}`)}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
