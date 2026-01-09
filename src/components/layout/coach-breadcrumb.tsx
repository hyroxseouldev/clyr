"use client";

import { usePathname } from "@/i18n/routing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// 특수 처리: 주문 상세 페이지
export function CoachBreadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("breadcrumb");

  // 경로 분리 및 필터링 (로케일, coach, app 제외)
  const pathSegments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) =>
      segment !== "coach" &&
      segment !== "app" &&
      segment !== "ko" &&
      segment !== "en"
    );

  // 코치 대시보드인 경우 브레드크럼 표시 안 함
  if (pathSegments.length === 1 && pathSegments[0] === "dashboard") {
    return null;
  }

  // 브레드크럼 아이템 생성
  const breadcrumbItems = pathSegments.map((segment, index) => {
    // UUID인 경우 (프로그램 ID, 주문 ID, 회원 ID 등)
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      );

    // UUID인 경우 표시하지 않음 (예: programId)
    if (isUUID) {
      return null;
    }

    // 라벨 번역 (UUID 체크 후에 호출)
    const label = t(segment as any) || segment;
    // coach를 포함한 전체 경로 생성
    const href = "/coach/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;

    return { label, href, isLast };
  }).filter(Boolean);

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          if (!item) return null;

          return (
            <Fragment key={item.href}>
              {index > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
