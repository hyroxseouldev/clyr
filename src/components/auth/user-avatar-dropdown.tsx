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
import { useTranslations } from "next-intl";

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
  const t = useTranslations('account');
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
        toast.success(t('updateSuccess'));
        setDeleteDialogOpen(false);
      } else {
        toast.error(t('failed'), { description: result.message });
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
              <p className="text-sm font-medium">{user.fullName || t('user')}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAccountDialogOpen(true)}>
            <UserCircleIcon className="mr-2 size-4" />
            {t('edit')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
            <KeyIcon className="mr-2 size-4" />
            {t('passwordChange')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <TrashIcon className="mr-2 size-4" />
            {t('delete')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOutIcon className="mr-2 size-4" />
            {t('signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('edit')}</DialogTitle>
            <DialogDescription>
              {t('editDesc')}
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
            <DialogTitle>{t('passwordChange')}</DialogTitle>
            <DialogDescription>{t('passwordChangeDesc')}</DialogDescription>
          </DialogHeader>
          <PasswordChangeForm onSuccess={() => setPasswordDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete')}</DialogTitle>
            <DialogDescription>
              {t('deleteDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              {t('confirmDelete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserAvatarDropdown;
