// Sign Up Page

import { SignUpForm } from "@/components/auth/signup-form";
import { Suspense } from "react";

function SignUpFormWrapper() {
  return (
    <div className="flex justify-center items-center h-screen min-h-screen">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">로딩 중...</div>}>
      <SignUpFormWrapper />
    </Suspense>
  );
}
