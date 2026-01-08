import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const CoachWorkoutPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              워크아웃 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-lg text-muted-foreground">
                현재는 시스템에서 제공하는 워크아웃만 사용이 가능합니다!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                추후 커스텀 워크아웃 생성 기능이 추가될 예정입니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachWorkoutPage;
