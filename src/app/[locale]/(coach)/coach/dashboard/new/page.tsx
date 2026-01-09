import { ProgramCreateForm } from "@/components/program/program-create-form";
import { getTranslations } from "next-intl/server";

const CoachDashboardNewPage = async () => {
  const t = await getTranslations('newProgram');

  return (
    <div className="max-w-md mx-auto my-8">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <ProgramCreateForm />
    </div>
  );
};

export default CoachDashboardNewPage;
