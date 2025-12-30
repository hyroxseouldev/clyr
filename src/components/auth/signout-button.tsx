"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { LogOutIcon } from "lucide-react";

export function SignoutButton() {
  const [isLoading, startTransition] = useTransition();
  const handleSignOut = async () => {
    startTransition(async () => {
      const result = await signOut();

      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
    });
  };
  return (
    <Button variant="outline" onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? (
        <Spinner className="mr-2" />
      ) : (
        <LogOutIcon className="mr-2 size-4" />
      )}
      로그아웃
    </Button>
  );
}
