"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { updateEnrollmentStatusAction, extendEnrollmentAction, updateEnrollmentStartDateAction, updateEnrollmentEndDateAction } from "@/actions/member";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileTextIcon,
  CalendarIcon,
  MessageSquareIcon,
  UserIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import type { Enrollment } from "@/db/schema";

interface MemberDetailClientProps {
  programId: string;
  memberId: string;
  member: Enrollment & {
    user: {
      id: string;
      email: string;
      fullName: string | null;
      avatarUrl: string | null;
    };
    program: {
      id: string;
      title: string;
    };
    order: {
      id: string;
      amount: string;
      status: string;
      createdAt: Date;
    } | null;
    userProfile: {
      nickname: string | null;
      bio: string | null;
      phoneNumber: string | null;
      fitnessGoals: string[] | null;
      fitnessLevel: string | null;
    } | null;
  };
}

export function MemberDetailClient({
  programId,
  memberId,
  member,
}: MemberDetailClientProps) {
  const t = useTranslations('memberDetail');
  const tToast = useTranslations('toast');
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  // 날짜 편집 상태
  const [editingField, setEditingField] = useState<'startDate' | 'endDate' | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  // 상태 변경 핸들러
  const handleStatusChange = async (newStatus: "ACTIVE" | "EXPIRED" | "PAUSED") => {
    setIsUpdating(true);
    try {
      const result = await updateEnrollmentStatusAction(member.id, newStatus);

      if (!result.success) {
        throw new Error(result.message || "Failed to change status");
      }

      toast.success(tToast('statusChanged'));
      router.refresh();
    } catch (error) {
      toast.error(tToast('statusChangeFailed'));
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 기간 연장 핸들러
  const handleExtendEnrollment = async (days: number) => {
    setIsUpdating(true);
    try {
      const newEndDate = member.endDate
        ? addDays(new Date(member.endDate), days)
        : addDays(new Date(), days);

      const result = await extendEnrollmentAction(
        member.id,
        newEndDate.toISOString()
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to extend period");
      }

      toast.success(tToast('periodExtended', { days }));
      router.refresh();
    } catch (error) {
      toast.error(tToast('periodExtendFailed'));
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 날짜 편집 시작 핸들러
  const handleStartEdit = (field: 'startDate' | 'endDate') => {
    const currentDate = field === 'startDate' ? member.startDate : member.endDate;
    setEditingField(field);
    setTempDate(currentDate ? new Date(currentDate) : null);
  };

  // 날짜 저장 핸들러
  const handleSaveDate = async () => {
    if (!editingField) return;

    // 유효성 검사: startDate < endDate
    if (editingField === 'startDate' && tempDate && member.endDate) {
      if (tempDate > new Date(member.endDate)) {
        toast.error('시작일은 종료일보다 앞서야 합니다.');
        return;
      }
    }
    if (editingField === 'endDate' && tempDate && member.startDate) {
      if (tempDate < new Date(member.startDate)) {
        toast.error('종료일은 시작일보다 뒤여야 합니다.');
        return;
      }
    }

    setIsUpdating(true);
    try {
      const result = editingField === 'startDate'
        ? await updateEnrollmentStartDateAction(member.id, tempDate)
        : await updateEnrollmentEndDateAction(member.id, tempDate);

      if (!result.success) {
        throw new Error(result.message || "Failed to update date");
      }

      toast.success(tToast('dateUpdated'));
      setEditingField(null);
      setTempDate(null);
      router.refresh();
    } catch (error) {
      toast.error(tToast('dateUpdateFailed'));
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 날짜 편집 취소 핸들러
  const handleCancelEdit = () => {
    setEditingField(null);
    setTempDate(null);
  };

  return (
    <div className="space-y-6">
      {/* 수강 상태 카드 */}
      <Card>
          <CardHeader>
            <CardTitle>{t('enrollmentStatus')}</CardTitle>
            <CardDescription>
              {t('enrollmentStatusDesc', { program: member.program.title })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('status')}</p>
                <Select
                  value={member.status}
                  onValueChange={(value) => handleStatusChange(value as "ACTIVE" | "EXPIRED" | "PAUSED")}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {member.status === "ACTIVE" && t('active')}
                      {member.status === "PAUSED" && t('paused')}
                      {member.status === "EXPIRED" && t('expired')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t('active')}</SelectItem>
                    <SelectItem value="PAUSED">{t('paused')}</SelectItem>
                    <SelectItem value="EXPIRED">{t('expired')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('startDate')}</p>
                {editingField === 'startDate' ? (
                  <div className="flex items-center gap-1">
                    <Popover open={editingField === 'startDate'} onOpenChange={(open) => !open && handleCancelEdit()}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal" disabled={isUpdating}>
                          {tempDate ? format(tempDate, "yyyy.MM.dd", { locale: ko }) : t('undecided')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={tempDate ?? undefined}
                          onSelect={(date) => setTempDate(date ?? null)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleSaveDate} disabled={isUpdating || !tempDate}>
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleCancelEdit} disabled={isUpdating}>
                      <XIcon className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-medium px-0 h-auto"
                    onClick={() => handleStartEdit('startDate')}
                    disabled={isUpdating}
                  >
                    {member.startDate
                      ? format(new Date(member.startDate), "yyyy.MM.dd", { locale: ko })
                      : t('undecided')}
                  </Button>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('endDate')}</p>
                {editingField === 'endDate' ? (
                  <div className="flex items-center gap-1">
                    <Popover open={editingField === 'endDate'} onOpenChange={(open) => !open && handleCancelEdit()}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal" disabled={isUpdating}>
                          {tempDate ? format(tempDate, "yyyy.MM.dd", { locale: ko }) : t('unlimited')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={tempDate ?? undefined}
                          onSelect={(date) => setTempDate(date ?? null)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleSaveDate} disabled={isUpdating || !tempDate}>
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleCancelEdit} disabled={isUpdating}>
                      <XIcon className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-medium px-0 h-auto"
                    onClick={() => handleStartEdit('endDate')}
                    disabled={isUpdating}
                  >
                    {member.endDate
                      ? format(new Date(member.endDate), "yyyy.MM.dd", { locale: ko })
                      : t('unlimited')}
                  </Button>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('purchaseDate')}</p>
                <p className="font-medium">
                  {format(new Date(member.createdAt), "yyyy.MM.dd", { locale: ko })}
                </p>
              </div>
            </div>

            {/* 수강 기간 연장 버튼 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('extendPeriod')}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtendEnrollment(7)}
                  disabled={isUpdating}
                >
                  +7{t('days')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtendEnrollment(30)}
                  disabled={isUpdating}
                >
                  +30{t('days')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtendEnrollment(90)}
                  disabled={isUpdating}
                >
                  +90{t('days')}
                </Button>
              </div>
            </div>

            {member.order && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">{t('paymentAmount')}</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("ko-KR").format(Number(member.order.amount))}{t('won')}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 회원 프로필 정보 */}
        {member.userProfile && (
          <Card>
            <CardHeader>
              <CardTitle>{t('memberProfile')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.userProfile.nickname && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('nickname')}</p>
                  <p className="font-medium">{member.userProfile.nickname}</p>
                </div>
              )}
              {member.userProfile.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('bio')}</p>
                  <p className="font-medium">{member.userProfile.bio}</p>
                </div>
              )}
              {member.userProfile.phoneNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('phoneNumber')}</p>
                  <p className="font-medium">{member.userProfile.phoneNumber}</p>
                </div>
              )}
              {member.userProfile.fitnessLevel && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('fitnessLevel')}</p>
                  <p className="font-medium">
                    {member.userProfile.fitnessLevel === "BEGINNER" && t('beginner')}
                    {member.userProfile.fitnessLevel === "INTERMEDIATE" && t('intermediate')}
                    {member.userProfile.fitnessLevel === "ADVANCED" && t('advanced')}
                  </p>
                </div>
              )}
              {member.userProfile.fitnessGoals && member.userProfile.fitnessGoals.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('fitnessGoals')}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {member.userProfile.fitnessGoals.map((goal, i) => (
                      <Badge key={i} variant="secondary">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

