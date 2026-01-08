"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  UserCircleIcon,
  KeyIcon,
  UserIcon,
  TrashIcon,
  LogOutIcon,
} from "lucide-react";
import { AccountForm } from "@/components/auth/account-form";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { CoachProfileForm } from "@/components/auth/coach-profile-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTransition } from "react";
import { signOut } from "@/actions/auth";
import { deleteAccountAction, getMyAccountAction } from "@/actions/account";
import { toast } from "sonner";

const UserAvatarDropdown = ({
  user,
}: {
  user: {
    id: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
}) => {
  const [, startTransition] = useTransition();

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSignOut = async () => {
    startTransition(async () => {
      const result = await signOut();
      if (result && "error" in result) {
        toast.error(result.error);
      }
    });
  };

  const handleDeleteAccount = async () => {
    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result.success) {
        toast.success("계정이 삭제되었습니다.");
        setDeleteDialogOpen(false);
      } else {
        toast.error("계정 삭제 실패", { description: result.message });
      }
    });
  };

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 focus:outline-none">
            <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.fullName || "사용자"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAccountDialogOpen(true)}>
            <UserCircleIcon className="mr-2 size-4" />
            계정 정보 수정
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
            <KeyIcon className="mr-2 size-4" />
            비밀번호 변경
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <TrashIcon className="mr-2 size-4" />
            계정 삭제
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOutIcon className="mr-2 size-4" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>계정 정보 수정</DialogTitle>
            <DialogDescription>
              이름과 프로필 이미지를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <AccountForm
            initialData={{
              fullName: user.fullName || "",
              avatarUrl: user.avatarUrl || "",
            }}
            onSuccess={() => setAccountDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
            <DialogDescription>새 비밀번호를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <PasswordChangeForm onSuccess={() => setPasswordDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 삭제</DialogTitle>
            <DialogDescription>
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수
              없습니다. 정말 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              계정 삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserAvatarDropdown;
