"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { TiptapForm } from "@/components/form";
import {
  createWeekAction,
  updateWeekAction,
  deleteWeekAction,
  createWorkoutAction,
  updateWorkoutAction,
  deleteWorkoutAction,
  createSessionAction,
  updateSessionAction,
  deleteSessionAction,
} from "@/actions/workout";
import { weekSchema, workoutSchema, sessionSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Select } from "@/components/ui/select";

type Week = {
  id: string;
  weekNumber: number;
  title: string;
  description: string | null;
  workouts: Workout[];
};

type Workout = {
  id: string;
  dayNumber: number;
  title: string;
  weekId: string;
  content?: string | null;
  sessions: Session[];
};

type Session = {
  id: string;
  title: string;
  content: string | null;
  orderIndex: number;
  workoutId: string;
};

type WorkoutTabProps = {
  programId: string;
  initialData?: Week[];
};

export default function WorkoutTab({
  programId,
  initialData = [],
}: WorkoutTabProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [weeks, setWeeks] = useState<Week[]>(initialData);
  const [openWeeks, setOpenWeeks] = useState<Set<string>>(new Set());

  // initialData가 변경되면 상태 업데이트 (깊은 비교)
  useEffect(() => {
    setWeeks(initialData);
  }, [JSON.stringify(initialData)]);

  // Dialog states
  const [weekDialog, setWeekDialog] = useState<{
    open: boolean;
    week?: Week;
    mode: "create" | "edit";
  }>({
    open: false,
    mode: "create",
  });
  const [workoutDialog, setWorkoutDialog] = useState<{
    open: boolean;
    workout?: Workout;
    weekId?: string;
    mode: "create" | "edit";
  }>({ open: false, mode: "create" });
  const [sessionDialog, setSessionDialog] = useState<{
    open: boolean;
    session?: Session;
    workoutId?: string;
    mode: "create" | "edit";
  }>({ open: false, mode: "create" });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "week" | "workout" | "session";
    id: string;
    title: string;
  }>({ open: false, type: "week", id: "", title: "" });

  // Week CRUD handlers
  const handleCreateWeek = () => {
    setWeekDialog({ open: true, mode: "create" });
  };

  const handleEditWeek = (week: Week) => {
    setWeekDialog({ open: true, week, mode: "edit" });
  };

  const handleDeleteWeek = (week: Week) => {
    setDeleteDialog({
      open: true,
      type: "week",
      id: week.id,
      title: week.title,
    });
  };

  const confirmDeleteWeek = async () => {
    startTransition(async () => {
      const result = await deleteWeekAction(deleteDialog.id, programId);
      if (result.success) {
        toast.success("주차가 삭제되었습니다.");
        router.refresh();
      } else {
        toast.error("삭제 실패", {
          description:
            "message" in result
              ? result.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      }
      setDeleteDialog({ open: false, type: "week", id: "", title: "" });
    });
  };

  // Workout CRUD handlers
  const handleCreateWorkout = (weekId: string) => {
    setWorkoutDialog({ open: true, weekId, mode: "create" });
  };

  const handleEditWorkout = (workout: Workout) => {
    setWorkoutDialog({ open: true, workout, mode: "edit" });
  };

  const handleDeleteWorkout = (workout: Workout) => {
    setDeleteDialog({
      open: true,
      type: "workout",
      id: workout.id,
      title: workout.title,
    });
  };

  const confirmDeleteWorkout = async () => {
    startTransition(async () => {
      const result = await deleteWorkoutAction(deleteDialog.id, programId);
      if (result.success) {
        toast.success("일차가 삭제되었습니다.");
        router.refresh();
      } else {
        toast.error("삭제 실패", {
          description:
            "message" in result
              ? result.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      }
      setDeleteDialog({ open: false, type: "workout", id: "", title: "" });
    });
  };

  // Session CRUD handlers
  const handleCreateSession = (workoutId: string) => {
    setSessionDialog({ open: true, workoutId, mode: "create" });
  };

  const handleEditSession = (session: Session) => {
    setSessionDialog({ open: true, session, mode: "edit" });
  };

  const handleDeleteSession = (session: Session) => {
    setDeleteDialog({
      open: true,
      type: "session",
      id: session.id,
      title: session.title,
    });
  };

  const confirmDeleteSession = async () => {
    startTransition(async () => {
      const result = await deleteSessionAction(deleteDialog.id, programId);
      if (result.success) {
        toast.success("세션이 삭제되었습니다.");
        router.refresh();
      } else {
        toast.error("삭제 실패", {
          description:
            "message" in result
              ? result.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      }
      setDeleteDialog({ open: false, type: "session", id: "", title: "" });
    });
  };

  const toggleWeek = (weekId: string) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekId)) {
        next.delete(weekId);
      } else {
        next.add(weekId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Week Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">커리큘럼</h3>
          <p className="text-sm text-muted-foreground">
            주차, 일차, 세션을 관리하세요
          </p>
        </div>
        <Button onClick={handleCreateWeek}>
          <PlusIcon className="mr-2 size-4" />
          주차 추가
        </Button>
      </div>

      {/* Empty State */}
      {weeks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              등록된 커리큘럼이 없습니다
            </p>
            <Button onClick={handleCreateWeek}>
              <PlusIcon className="mr-2 size-4" />첫 번째 주차 만들기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weeks List */}
      <div className="space-y-4">
        {weeks.map((week) => (
          <WeekCard
            key={week.id}
            week={week}
            isOpen={openWeeks.has(week.id)}
            onToggle={() => toggleWeek(week.id)}
            onEdit={() => handleEditWeek(week)}
            onDelete={() => handleDeleteWeek(week)}
            onCreateWorkout={() => handleCreateWorkout(week.id)}
            onEditWorkout={handleEditWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onCreateSession={handleCreateSession}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
          />
        ))}
      </div>

      {/* Week Dialog */}
      <WeekFormDialog
        open={weekDialog.open}
        onOpenChange={(open) => {
          setWeekDialog((prev) => ({ ...prev, open, week: undefined }));
        }}
        week={weekDialog.week}
        mode={weekDialog.mode}
        programId={programId}
        onSuccess={() => router.refresh()}
      />

      {/* Workout Dialog */}
      <WorkoutFormDialog
        open={workoutDialog.open}
        onOpenChange={(open) => {
          setWorkoutDialog((prev) => ({ ...prev, open, workout: undefined }));
        }}
        workout={workoutDialog.workout}
        weekId={workoutDialog.weekId || ""}
        mode={workoutDialog.mode}
        programId={programId}
        weeks={weeks}
        onSuccess={() => router.refresh()}
      />

      {/* Session Dialog */}
      <SessionFormDialog
        open={sessionDialog.open}
        onOpenChange={(open) => {
          setSessionDialog((prev) => ({ ...prev, open, session: undefined }));
        }}
        session={sessionDialog.session}
        workoutId={sessionDialog.workoutId || ""}
        mode={sessionDialog.mode}
        programId={programId}
        weeks={weeks}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.type === "week" && "주차 삭제"}
              {deleteDialog.type === "workout" && "일차 삭제"}
              {deleteDialog.type === "session" && "세션 삭제"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === "week" &&
                "주차를 삭제하면 하위의 모든 일차와 세션이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다."}
              {deleteDialog.type === "workout" &&
                "일차를 삭제하면 하위의 모든 세션이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다."}
              {deleteDialog.type === "session" &&
                "세션을 삭제합니다. 이 작업은 되돌릴 수 없습니다."}
              <br />
              <br />
              정말 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                deleteDialog.type === "week"
                  ? confirmDeleteWeek
                  : deleteDialog.type === "workout"
                  ? confirmDeleteWorkout
                  : confirmDeleteSession
              }
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Week Card Component - 항상 펼쳐진 상태
function WeekCard({
  week,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
  onCreateWorkout,
  onEditWorkout,
  onDeleteWorkout,
  onCreateSession,
  onEditSession,
  onDeleteSession,
}: {
  week: Week;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workout: Workout) => void;
  onCreateSession: (workoutId: string) => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
}) {
  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOpen ? (
              <ChevronUpIcon className="size-5" />
            ) : (
              <ChevronDownIcon className="size-5" />
            )}
            <div className="text-left">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">{week.weekNumber}주차</Badge>
                {week.title}
              </CardTitle>
              {week.description && (
                <CardDescription className="mt-1">
                  {week.description}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{week.workouts.length}일차</Badge>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <PencilIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <TrashIcon className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-3">
        {/* Workouts - 항상 펼쳐진 상태 */}
        {week.workouts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            일차가 없습니다
          </div>
        ) : (
          week.workouts.map((workout) => (
            <WorkoutListItem
              key={workout.id}
              workout={workout}
              onEdit={() => onEditWorkout(workout)}
              onDelete={() => onDeleteWorkout(workout)}
              onCreateSession={() => onCreateSession(workout.id)}
              onEditSession={onEditSession}
              onDeleteSession={onDeleteSession}
            />
          ))
        )}

        {/* Add Workout Button */}
        <Button variant="outline" className="w-full" onClick={onCreateWorkout}>
          <PlusIcon className="mr-2 size-4" />
          일차 추가
        </Button>
      </CardContent>
    </Card>
  );
}

// Workout List Item - 항상 펼쳐진 상태
function WorkoutListItem({
  workout,
  onEdit,
  onDelete,
  onCreateSession,
  onEditSession,
  onDeleteSession,
}: {
  workout: Workout;
  onEdit: () => void;
  onDelete: () => void;
  onCreateSession: () => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
      <GripVerticalIcon className="size-4 text-muted-foreground mt-2" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {workout.dayNumber}일차
            </Badge>
            <span className="font-medium text-sm">{workout.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={onEdit}>
              <PencilIcon className="size-3" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onDelete}>
              <TrashIcon className="size-3 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Sessions - 칩 형태로 표시 */}
        <div className="flex flex-wrap gap-2">
          {workout.sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground">세션이 없습니다</p>
          ) : (
            workout.sessions.map((session, index) => (
              <SessionBadge
                key={session.id}
                session={session}
                index={index}
                onEdit={() => onEditSession(session)}
                onDelete={() => onDeleteSession(session)}
              />
            ))
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={onCreateSession}
          >
            <PlusIcon className="mr-1 h-3 w-3" />
            세션 추가
          </Button>
        </div>
      </div>
    </div>
  );
}

// Session Badge Component
function SessionBadge({
  session,
  index,
  onEdit,
  onDelete,
}: {
  session: Session;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Badge
      variant="outline"
      className="group cursor-pointer hover:bg-accent border-dashed"
    >
      <span className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground">{index + 1}.</span>
        <span>{session.title}</span>

        {/* Hover 시 나타나는 액션 버튼 */}
        <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-4 w-4 p-0"
            onClick={onEdit}
          >
            <PencilIcon className="h-2.5 w-2.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-4 w-4 p-0"
            onClick={onDelete}
          >
            <TrashIcon className="h-2.5 w-2.5 text-destructive" />
          </Button>
        </div>
      </span>
    </Badge>
  );
}

// Week Form Dialog Component
function WeekFormDialog({
  open,
  onOpenChange,
  week,
  mode,
  programId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  week?: Week;
  mode: "create" | "edit";
  programId: string;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof weekSchema>>({
    resolver: zodResolver(weekSchema),
    defaultValues: {
      weekNumber: week?.weekNumber || 1,
      title: week?.title || "",
      description: week?.description || "",
    },
  });

  // 수정 모드일 때 폼에 데이터 표시, 생성 모드일 때 폼 초기화
  useEffect(() => {
    if (week) {
      form.reset({
        weekNumber: week.weekNumber,
        title: week.title,
        description: week.description || "",
      });
    } else {
      // 생성 모드: 폼 초기화
      form.reset({
        weekNumber: 1,
        title: "",
        description: "",
      });
    }
  }, [week, form.reset]);

  const onSubmit = (values: z.infer<typeof weekSchema>) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createWeekAction(programId, values)
          : await updateWeekAction(week!.id, programId, values);

      if (result.success) {
        toast.success(
          mode === "create"
            ? "주차가 생성되었습니다."
            : "주차가 수정되었습니다."
        );
        onOpenChange(false);
        form.reset();
        onSuccess();
      } else {
        toast.error(mode === "create" ? "생성 실패" : "수정 실패", {
          description:
            "message" in result
              ? result.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "주차 추가" : "주차 수정"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "새로운 주차를 추가합니다."
              : "주차 정보를 수정합니다."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="weekNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주차 번호</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 1주차: 적응 및 기초 체력"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TiptapForm
              name="description"
              label="설명 (선택)"
              form={form}
              placeholder="주차별 가이드 설명"
              minHeight="150px"
              required={false}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner className="mr-2" /> : null}
                {mode === "create" ? "생성" : "수정"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Workout Form Dialog Component
function WorkoutFormDialog({
  open,
  onOpenChange,
  workout,
  weekId,
  mode,
  programId,
  weeks,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout?: Workout;
  weekId: string;
  mode: "create" | "edit";
  programId: string;
  weeks: Week[];
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof workoutSchema>>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      weekId: workout?.weekId || weekId,
      dayNumber: workout?.dayNumber || 1,
      title: workout?.title || "",
      content: workout?.content || undefined,
    },
  });

  // 수정 모드일 때 폼에 데이터 표시, 생성 모드일 때 폼 초기화
  useEffect(() => {
    if (workout) {
      form.reset({
        weekId: workout.weekId,
        dayNumber: workout.dayNumber,
        title: workout.title,
        content: workout.content || undefined,
      });
    } else {
      // 생성 모드: 폼 초기화
      form.reset({
        weekId: weekId,
        dayNumber: 1,
        title: "",
        content: undefined,
      });
    }
  }, [workout, weekId, form.reset]);

  const onSubmit = (values: z.infer<typeof workoutSchema>) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createWorkoutAction(programId, values)
          : await updateWorkoutAction(workout!.id, programId, values);

      if (result.success) {
        toast.success(
          mode === "create"
            ? "일차가 생성되었습니다."
            : "일차가 수정되었습니다."
        );
        onOpenChange(false);
        form.reset();
        onSuccess();
      } else {
        toast.error(mode === "create" ? "생성 실패" : "수정 실패", {
          description:
            "message" in result
              ? result.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "일차 추가" : "일차 수정"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "새로운 일차를 추가합니다."
              : "일차 정보를 수정합니다."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="weekId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주차</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="주차를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map((week) => (
                        <SelectItem key={week.id} value={week.id}>
                          {week.weekNumber}주차: {week.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dayNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>일차 번호</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 하체/코어 집중" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TiptapForm
              name="content"
              label="상세 정보 (선택)"
              form={form}
              placeholder="일차별 상세 운동 가이드"
              description="위지윅 에디터로 서식 있는 텍스트를 입력할 수 있습니다."
              minHeight="200px"
              required={false}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner className="mr-2" /> : null}
                {mode === "create" ? "생성" : "수정"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Session Form Dialog Component
function SessionFormDialog({
  open,
  onOpenChange,
  session,
  workoutId,
  mode,
  programId,
  weeks,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: Session;
  workoutId: string;
  mode: "create" | "edit";
  programId: string;
  weeks: Week[];
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  // Get all workouts from weeks
  const allWorkouts = weeks.flatMap((week) => week.workouts);

  type SessionFormValues = z.infer<typeof sessionSchema>;

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema) as any,
    defaultValues: {
      workoutId: session?.workoutId || workoutId,
      title: session?.title || "",
      content: session?.content || "",
      orderIndex: session?.orderIndex || 0,
    },
  });

  // 수정 모드일 때 폼에 데이터 표시, 생성 모드일 때 폼 초기화
  useEffect(() => {
    if (session) {
      form.reset({
        workoutId: session.workoutId,
        title: session.title,
        content: session.content || "",
        orderIndex: session.orderIndex,
      });
    } else {
      // 생성 모드: 폼 초기화
      form.reset({
        workoutId: workoutId,
        title: "",
        content: "",
        orderIndex: 0,
      });
    }
  }, [session, workoutId, form.reset]);

  const onSubmit = (values: SessionFormValues) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createSessionAction(programId, values)
          : await updateSessionAction(session!.id, programId, values);

      if (result.success) {
        toast.success(
          mode === "create"
            ? "세션이 생성되었습니다."
            : "세션이 수정되었습니다."
        );
        onOpenChange(false);
        form.reset();
        onSuccess();
      } else {
        toast.error(mode === "create" ? "생성 실패" : "수정 실패", {
          description:
            "message" in result
              ? result.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "세션 추가" : "세션 수정"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "새로운 세션을 추가합니다."
              : "세션 정보를 수정합니다."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
            <FormField
              control={form.control as any}
              name="workoutId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>일차</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="일차를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {allWorkouts.map((workout) => (
                        <SelectItem key={workout.id} value={workout.id}>
                          {workout.dayNumber}일차: {workout.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 본운동: 백 스쿼트" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TiptapForm
              name="content"
              label="내용 (선택)"
              form={form}
              placeholder="상세 운동 가이드"
              description="위지윅 에디터로 서식 있는 텍스트를 입력할 수 있습니다."
              minHeight="150px"
              required={false}
            />
            <FormField
              control={form.control}
              name="orderIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>순서</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    표시 순서를 지정합니다. 숫자가 작을수록 먼저 표시됩니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner className="mr-2" /> : null}
                {mode === "create" ? "생성" : "수정"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
