"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProfileViewCard } from "@/components/coach/ProfileViewCard";
import {
  ProfileFormDialog,
  DeleteProfileAlertDialog,
} from "@/components/coach/ProfileFormDialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus } from "lucide-react";
import {
  deleteCoachProfileAction,
  getMyCoachProfileAction,
} from "@/lib/auth/actions";
import type { CoachProfile } from "@/db/schema";

interface CoachProfileContentProps {
  initialProfile: CoachProfile | null;
}

export function CoachProfileContent({
  initialProfile,
}: CoachProfileContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [profile, setProfile] = useState<CoachProfile | null>(initialProfile);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const handleProfileSuccess = () => {
    startTransition(async () => {
      const result = await getMyCoachProfileAction();
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setProfile(null);
      }
      setIsDialogOpen(false);
    });
  };

  const handleDeleteProfile = () => {
    startTransition(async () => {
      const result = await deleteCoachProfileAction();
      if (result.success) {
        toast.success("프로필이 삭제되었습니다.");
        setProfile(null);
        setIsDeleteAlertOpen(false);
      } else {
        toast.error("삭제 실패", {
          description:
            "message" in result
              ? result.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      }
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  // 프로필 없음 상태
  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">코치 프로필</h1>
          <p className="text-muted-foreground">프로필 정보를 관리하세요</p>
        </div>

        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserPlus className="size-6" />
            </EmptyMedia>
            <EmptyTitle>프로필이 없습니다</EmptyTitle>
            <EmptyDescription>프로필을 생성해주세요</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setIsDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              프로필 생성
            </Button>
          </EmptyContent>
        </Empty>

        <ProfileFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          profile={profile}
          onSuccess={handleProfileSuccess}
        />
      </div>
    );
  }

  // 프로필 있음 상태
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">코치 프로필</h1>
        <p className="text-muted-foreground">프로필 정보를 관리하세요</p>
      </div>

      <ProfileViewCard
        profile={profile}
        onEdit={() => setIsDialogOpen(true)}
        onDelete={() => setIsDeleteAlertOpen(true)}
      />

      <ProfileFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        profile={profile}
        onSuccess={handleProfileSuccess}
      />

      <DeleteProfileAlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleDeleteProfile}
      />
    </div>
  );
}
