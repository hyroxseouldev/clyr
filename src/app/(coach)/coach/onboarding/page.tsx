// Coach Onboarding Page

import { CoachProfileForm } from "@/components/auth/coach-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoachOnboardingPage() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">코치 프로필 생성</CardTitle>
            <p className="text-muted-foreground">
              프로그램을 생성하고 판매하기 위해 프로필 정보를 입력해주세요.
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
