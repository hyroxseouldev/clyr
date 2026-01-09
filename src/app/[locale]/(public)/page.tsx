// Landing Page

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export default async function LandingPage() {
  const t = await getTranslations('landing');

  return (
    <div className="flex flex-col items-center justify-center h-screen min-h-screen">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="text-lg text-gray-500">
        {t('description')}
      </p>

      <Button asChild className="mt-4">
        <Link href="/signin">{t('cta')}</Link>
      </Button>
    </div>
  );
}
