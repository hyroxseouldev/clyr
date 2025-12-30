import { SignoutButton } from "@/components/auth/signout-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

const DashboardHeader = () => {
  return (
    <div className="flex flex-row justify-between items-center px-4 py-2 border-b w-full">
      <Link href="/coach/dashboard">
        <h1 className="text-2xl font-bold">CLYR LOGO</h1>
      </Link>

      <div className="flex flex-row justify-between items-center gap-2">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <SignoutButton />
      </div>
    </div>
  );
};

export default DashboardHeader;
