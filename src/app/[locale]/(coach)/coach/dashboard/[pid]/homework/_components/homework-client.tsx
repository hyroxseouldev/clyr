"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HomeworkClientProps {
  programId: string;
  initialData: any;
}

export function HomeworkClient({ programId, initialData }: HomeworkClientProps) {
  return (
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
  );
}
