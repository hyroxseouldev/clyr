import { getProgramBySlugAction } from "@/actions";
import { getTranslations } from "next-intl/server";
import {
  ProgramDetailClient,
} from "./components/program-detail-client";

/**
 * 프로그램 상세 및 구매 페이지
 */
const PublicCommercePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const { data: program } = await getProgramBySlugAction(slug);
  const t = await getTranslations("programDetail");

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("notFound")}</h1>
          <p className="text-muted-foreground mt-2">{t("notFoundDesc")}</p>
        </div>
      </div>
    );
  }

  return <ProgramDetailClient program={program} />;
};

export default PublicCommercePage;
