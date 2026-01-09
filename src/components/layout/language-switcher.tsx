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
import { useTransition } from "react";

const LOCALES = [
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const currentLocale = params.locale as string;

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      // next-intl의 router.replace를 사용하여 로케일 변경
      router.replace(pathname, { locale: newLocale });
    });
  };

  const currentLocaleInfo = LOCALES.find((l) => l.code === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
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
            disabled={locale.code === currentLocale || isPending}
          >
            <span className="mr-2">{locale.flag}</span>
            {locale.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
