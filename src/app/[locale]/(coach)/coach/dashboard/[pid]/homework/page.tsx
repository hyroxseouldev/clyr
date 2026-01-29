import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HomeworkPageProps {
  params: Promise<{ pid: string }>;
}

const HomeworkPage = async ({ params }: HomeworkPageProps) => {
  return (
    <div className="container max-w-5xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>숙제 제출 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            이 기능은 현재 사용할 수 없습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeworkPage;
