import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCartIcon } from "lucide-react";

/**
 * 프로그램 구매 목록 페이지
 * 프로그램 구매 내역을 조회하고 관리할 수 있습니다.
 */
export default async function ProgramPurchasesPage({
  params,
}: {
  params: Promise<{ pid: string }>;
}) {
  const { pid } = await params;

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">구매 목록</h1>
        <p className="text-muted-foreground">
          프로그램 구매 내역을 조회하고 관리하세요.
        </p>
      </div>

      {/* 구매 목록 카드 */}
      <Card>
        <CardHeader>
          <ShoppingCartIcon className="size-8 mb-2 text-muted-foreground" />
          <CardTitle>구매 내역</CardTitle>
          <CardDescription>
            이 프로그램의 모든 구매 내역을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCartIcon className="size-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">구매 목록 준비 중</h3>
            <p className="text-muted-foreground max-w-md">
              구매 내역 관리 기능을 준비 중입니다. 곧 다양한 구매 관리 기능을 제공할 예정입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
