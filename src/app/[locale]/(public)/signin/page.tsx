// Sign In Page

import { LoginForm } from "@/components/auth/login-form";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center h-screen min-h-screen">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
