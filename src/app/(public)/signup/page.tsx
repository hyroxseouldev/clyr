// Sign Up Page

import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center h-screen min-h-screen">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}
