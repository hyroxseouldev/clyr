// Coach Onboarding Page

import { CoachProfileForm } from "@/components/auth/coach-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function CoachOnboardingPage() {
  const t = await getTranslations("onboarding");

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </CardHeader>
          <CardContent>
            <CoachProfileForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
