// Coach Layout

import { SignoutButton } from "@/components/auth/signout-button";

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div>sidebar</div>
      <SignoutButton />
      {children}
    </div>
  );
}
