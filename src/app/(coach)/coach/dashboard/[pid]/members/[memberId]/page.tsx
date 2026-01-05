import { notFound, redirect } from "next/navigation";
import { getMemberWorkoutLogsPageDataAction } from "@/actions/workoutLog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  FileTextIcon,
  UserIcon,
  MailIcon,
  ArrowLeftIcon,
} from "lucide-react";

const INTENSITY_LABELS = {
  LOW: "낮음",
  MEDIUM: "중간",
  HIGH: "높음",
};

const INTENSITY_VARIANTS: Record<
  "LOW" | "MEDIUM" | "HIGH",
  "default" | "secondary" | "outline"
> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "outline",
};

interface PageProps {
  params: Promise<{
    pid: string;
    memberId: string;
  }>;
}

export default async function MemberWorkoutLogsPage({ params }: PageProps) {
  const { pid, memberId } = await params;

  // Server Action으로 모든 데이터 한번에 조회
  const result = await getMemberWorkoutLogsPageDataAction(pid, memberId);

  if (!result.success || !result.data) {
    if (result.message?.includes("권한") || result.message?.includes("인증")) {
      redirect("/signin");
    }
    notFound();
  }

  const { member, logs } = result.data;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR");
  };

  return (
    <div className="container max-w-4xl py-6">
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <a href={`/coach/dashboard/${pid}`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            돌아가기
          </a>
        </Button>

        <div className="flex items-center gap-4">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.fullName || member.email}
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="size-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {member.fullName || "이름 없음"}님의 운동 일지
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MailIcon className="size-4" />
              {member.email}
            </div>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            총 {logs.length}개의 운동 일지
          </h2>
        </div>

        {logs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileTextIcon className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">운동 일지가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">{log.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="size-4" />
                        {formatDate(log.logDate)}
                      </div>
                      <Badge
                        variant={
                          INTENSITY_VARIANTS[
                            log.intensity as "LOW" | "MEDIUM" | "HIGH"
                          ]
                        }
                      >
                        {
                          INTENSITY_LABELS[
                            log.intensity as "LOW" | "MEDIUM" | "HIGH"
                          ]
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 내용 표시 */}
                  <div>
                    <h4 className="font-semibold mb-2">상세 내용</h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <pre className="text-sm whitespace-pre-wrap wrap-break-word">
                        {JSON.stringify(log.content, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* 메타데이터 */}
                  <div className="text-xs text-muted-foreground">
                    작성일: {formatDate(log.createdAt)}
                    {new Date(log.updatedAt).getTime() !==
                      new Date(log.createdAt).getTime() && (
                      <span> | 수정일: {formatDate(log.updatedAt)}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
