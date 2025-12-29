"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export function SignoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const handleSignOut = async () => {
    setIsLoading(true);

    const result = await signOut();

    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Signed out successfully");
    setIsLoading(false);
  };
  return (
    <Button onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? <Spinner /> : "Sign out"}
    </Button>
  );
}
