import { LoginForm } from "@/components/auth/login-form";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-start h-screen min-h-screen px-4 py-6">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
