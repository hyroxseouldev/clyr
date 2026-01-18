import { getProgramByIdAction } from "@/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ProgramEditForm } from "@/components/program/program-edit-form";
import { Link } from "@/i18n/routing";

const CoachInfoPage = async ({
  params,
}: {
  params: Promise<{ pid: string }>;
}) => {
  const { pid } = await params;
  const { data: program } = await getProgramByIdAction(pid);

  if (!program) {
    redirect("/coach/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">프로그램 정보</h1>
          <p className="text-muted-foreground">{program.title}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link
            href={`/programs/${program.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            공개 페이지 보기
          </Link>
        </Button>
      </div>

      <ProgramEditForm initialData={program} />
    </div>
  );
};

export default CoachInfoPage;
