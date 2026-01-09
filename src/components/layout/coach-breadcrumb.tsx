"use client";

import { usePathname } from "@/i18n/routing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { Link } from "@/i18n/routing";

// 경로 표시용 라벨 맵
const PATH_LABELS: Record<string, string> = {
  dashboard: "대시보드",
  info: "프로그램 설명",
  profile: "프로필 편집",
  plan: "운동 플랜 관리",
  "workout-routine": "운동 루틴 관리",
  "workout-library": "운동 라이브러리",
  homework: "숙제 관리",
  purchases: "판매 현황",
  members: "회원 관리",
  settings: "설정",
};

// 특수 처리: 주문 상세 페이지
export function CoachBreadcrumb() {
  const pathname = usePathname();

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
    const label = PATH_LABELS[segment] || segment;
    // coach를 포함한 전체 경로 생성
    const href = "/coach/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;

    // UUID인 경우 (프로그램 ID, 주문 ID, 회원 ID 등)
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      );

    // UUID인 경우 표시하지 않음 (예: programId)
    if (isUUID) {
      return null;
    }

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
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <Link href={item.href}>
                    <BreadcrumbLink>{item.label}</BreadcrumbLink>
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
