"use client";

import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { useState } from "react";

const LOCALES = [
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const [isChanging, setIsChanging] = useState(false);

  const currentLocale = params.locale as string;

  const switchLocale = async (newLocale: string) => {
    if (isChanging || newLocale === currentLocale) return;

    setIsChanging(true);

    // 새 URL로 이동 (새로운 locale)
    const newPath = `/${newLocale}${pathname}`;

    // 전체 페이지 새로고침으로 Server Component 재렌더링
    window.location.href = newPath;
  };

  const currentLocaleInfo = LOCALES.find((l) => l.code === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isChanging}>
          <Languages className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {currentLocaleInfo?.flag} {currentLocaleInfo?.name}
          </span>
          <span className="sm:hidden">{currentLocaleInfo?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => switchLocale(locale.code)}
            disabled={locale.code === currentLocale || isChanging}
          >
            <span className="mr-2">{locale.flag}</span>
            {locale.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
