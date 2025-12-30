"use client";

import { useEffect, useState, useCallback } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  GripVerticalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  reorderSessionsAction,
  getFullProgramContentAction,
} from "@/actions/workout";
import { weekSchema, workoutSchema, sessionSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Select } from "@/components/ui/select";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
};

export default function WorkoutTab({ programId }: WorkoutTabProps) {
  const [, startTransition] = useTransition();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [openWeeks, setOpenWeeks] = useState<Set<string>>(new Set());
  const [openWorkouts, setOpenWorkouts] = useState<Set<string>>(new Set());

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

  // Fetch data
  const fetchContent = useCallback(() => {
    startTransition(async () => {
      const result = await getFullProgramContentAction(programId);
      if (result.success && "data" in result && result.data) {
        setWeeks(result.data as Week[]);
      } else {
        toast.error("로딩 실패", {
          description:
            "message" in result
              ? result.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      }
      setLoading(false);
    });
  }, [programId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

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

  const toggleWorkout = (workoutId: string) => {
    setOpenWorkouts((prev) => {
      const next = new Set(prev);
      if (next.has(workoutId)) {
        next.delete(workoutId);
      } else {
        next.add(workoutId);
      }
      return next;
    });
  };

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
        fetchContent();
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
        fetchContent();
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
        fetchContent();
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

  // Session reorder
  const moveSession = async (
    sessionId: string,
    direction: "up" | "down",
    sessions: Session[]
  ) => {
    const currentIndex = sessions.findIndex((s) => s.id === sessionId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === sessions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const updates = sessions.map((s, i) => {
      if (i === currentIndex) return { id: s.id, orderIndex: s.orderIndex - 1 };
      if (i === newIndex) return { id: s.id, orderIndex: s.orderIndex + 1 };
      return { id: s.id, orderIndex: s.orderIndex };
    });

    startTransition(async () => {
      const result = await reorderSessionsAction(programId, updates);
      if (result.success) {
        toast.success("순서가 변경되었습니다.");
        fetchContent();
      } else {
        toast.error("순서 변경 실패", {
          description:
            "message" in result
              ? result.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-8" />
      </div>
    );
  }

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
            openWorkouts={openWorkouts}
            onToggleWorkout={toggleWorkout}
            onCreateSession={handleCreateSession}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            onMoveSession={moveSession}
          />
        ))}
      </div>

      {/* Week Dialog */}
      <WeekFormDialog
        open={weekDialog.open}
        onOpenChange={(open) => setWeekDialog((prev) => ({ ...prev, open }))}
        week={weekDialog.week}
        mode={weekDialog.mode}
        programId={programId}
        onSuccess={fetchContent}
      />

      {/* Workout Dialog */}
      <WorkoutFormDialog
        open={workoutDialog.open}
        onOpenChange={(open) => setWorkoutDialog((prev) => ({ ...prev, open }))}
        workout={workoutDialog.workout}
        weekId={workoutDialog.weekId || ""}
        mode={workoutDialog.mode}
        programId={programId}
        weeks={weeks}
        onSuccess={fetchContent}
      />

      {/* Session Dialog */}
      <SessionFormDialog
        open={sessionDialog.open}
        onOpenChange={(open) => setSessionDialog((prev) => ({ ...prev, open }))}
        session={sessionDialog.session}
        workoutId={sessionDialog.workoutId || ""}
        mode={sessionDialog.mode}
        programId={programId}
        weeks={weeks}
        onSuccess={fetchContent}
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

// Week Card Component
function WeekCard({
  week,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
  onCreateWorkout,
  onEditWorkout,
  onDeleteWorkout,
  openWorkouts,
  onToggleWorkout,
  onCreateSession,
  onEditSession,
  onDeleteSession,
  onMoveSession,
}: {
  week: Week;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workout: Workout) => void;
  openWorkouts: Set<string>;
  onToggleWorkout: (id: string) => void;
  onCreateSession: (workoutId: string) => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
  onMoveSession: (
    sessionId: string,
    direction: "up" | "down",
    sessions: Session[]
  ) => void;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
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
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-6 space-y-3">
            {/* Workouts */}
            {week.workouts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                일차가 없습니다
              </div>
            ) : (
              week.workouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  isOpen={openWorkouts.has(workout.id)}
                  onToggle={() => onToggleWorkout(workout.id)}
                  onEdit={() => onEditWorkout(workout)}
                  onDelete={() => onDeleteWorkout(workout)}
                  onCreateSession={() => onCreateSession(workout.id)}
                  onEditSession={onEditSession}
                  onDeleteSession={onDeleteSession}
                  onMoveSession={(direction, sessions) =>
                    onMoveSession(workout.id, direction, sessions)
                  }
                />
              ))
            )}

            {/* Add Workout Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={onCreateWorkout}
            >
              <PlusIcon className="mr-2 size-4" />
              일차 추가
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Workout Card Component
function WorkoutCard({
  workout,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
  onCreateSession,
  onEditSession,
  onDeleteSession,
  onMoveSession,
}: {
  workout: Workout;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateSession: () => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
  onMoveSession: (direction: "up" | "down", sessions: Session[]) => void;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className="border-l-4 border-l-primary/50">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronUpIcon className="size-4" />
                ) : (
                  <ChevronDownIcon className="size-4" />
                )}
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {workout.dayNumber}일차
                    </Badge>
                    <span className="font-medium text-sm">{workout.title}</span>
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {workout.sessions.length}세션
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <PencilIcon className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <TrashIcon className="size-3 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-4 space-y-2">
            {/* Sessions */}
            {workout.sessions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-xs">
                세션이 없습니다
              </div>
            ) : (
              <div className="space-y-2">
                {workout.sessions.map((session, index) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    index={index}
                    total={workout.sessions.length}
                    onEdit={() => onEditSession(session)}
                    onDelete={() => onDeleteSession(session)}
                    onMoveUp={() => onMoveSession("up", workout.sessions)}
                    onMoveDown={() => onMoveSession("down", workout.sessions)}
                  />
                ))}
              </div>
            )}

            {/* Add Session Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onCreateSession}
            >
              <PlusIcon className="mr-2 size-3" />
              세션 추가
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Session Item Component
function SessionItem({
  session,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  session: Session;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg border bg-card">
      <GripVerticalIcon className="size-4 text-muted-foreground mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {index + 1}
          </Badge>
          <span className="font-medium text-sm truncate">{session.title}</span>
        </div>
        {session.content && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {session.content}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMoveUp}
          disabled={index === 0}
        >
          <ChevronUpIcon className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMoveDown}
          disabled={index === total - 1}
        >
          <ChevronDownIcon className="size-3" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onEdit}>
          <PencilIcon className="size-3" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onDelete}>
          <TrashIcon className="size-3 text-destructive" />
        </Button>
      </div>
    </div>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명 (선택)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="주차별 가이드 설명" {...field} />
                  </FormControl>
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
    },
  });

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
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용 (선택)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="상세 운동 가이드"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    추후 위지윅 에디터로 확장될 예정입니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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
