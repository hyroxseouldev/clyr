import { CoachProfileForm } from "@/components/auth/coach-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyCoachProfileAction } from "@/actions/auth";
import { getTranslations } from "next-intl/server";

const CoachProfilePage = async () => {
  const result = await getMyCoachProfileAction();
  const initialData = result.success ? result.data : null;
  const t = await getTranslations("onboarding");

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {initialData ? t("editTitle") : t("title")}
            </CardTitle>
            <p className="text-muted-foreground">
              {initialData ? t("editDescription") : t("description")}
            </p>
          </CardHeader>
          <CardContent>
            <CoachProfileForm initialData={initialData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachProfilePage;
