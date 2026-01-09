// Landing Page

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen min-h-screen">
      <h1 className="text-4xl font-bold">Clyr</h1>
      <p className="text-lg text-gray-500">
        Clyr is a platform for creating and managing programs for your clients.
      </p>

      <Button asChild className="mt-4">
        <Link href="/signin">프로그램 만들기</Link>
      </Button>
    </div>
  );
}
