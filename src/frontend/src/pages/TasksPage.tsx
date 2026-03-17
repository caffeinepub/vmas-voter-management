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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle,
  ClipboardList,
  Edit,
  MapPin,
  Phone,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers } from "../store/auth";
import { deleteTask, getAllTasks, saveTask } from "../store/tasks";
import type { Task, TaskStatus, TaskType } from "../store/types";

const TASK_TYPES: TaskType[] = [
  "Follow-up Call",
  "Field Visit",
  "Campaign Event",
  "Other",
];
const TASK_STATUSES: TaskStatus[] = ["Pending", "In Progress", "Done"];

const TASK_TYPE_ICONS: Record<TaskType, React.ElementType> = {
  "Follow-up Call": Phone,
  "Field Visit": MapPin,
  "Campaign Event": Calendar,
  Other: ClipboardList,
};

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string }> = {
  Pending: { bg: "#fff3e0", text: "#e65100" },
  "In Progress": { bg: "#e3f2fd", text: "#1565c0" },
  Done: { bg: "#e8f5e9", text: "#2e7d32" },
};

interface TaskFormState {
  title: string;
  taskType: TaskType;
  assignedTo: string;
  assignedToName: string;
  linkedVoterName: string;
  dueDate: string;
  status: TaskStatus;
  notes: string;
}

const EMPTY_FORM: TaskFormState = {
  title: "",
  taskType: "Follow-up Call",
  assignedTo: "",
  assignedToName: "",
  linkedVoterName: "",
  dueDate: "",
  status: "Pending",
  notes: "",
};

function StatusBadge({ status }: { status: TaskStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

function TaskTypeIcon({ type }: { type: TaskType }) {
  const Icon = TASK_TYPE_ICONS[type];
  return <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />;
}

export default function TasksPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "superAdmin";

  const [tasks, setTasks] = useState<Task[]>(() => getAllTasks());
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<TaskType | "All">("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const users = useMemo(() => getAllUsers(), []);

  const refresh = useCallback(() => setTasks(getAllTasks()), []);

  const visibleTasks = useMemo(() => {
    let list = isSuperAdmin
      ? tasks
      : tasks.filter((t) => t.assignedTo === user?.userId);

    if (statusFilter !== "All")
      list = list.filter((t) => t.status === statusFilter);
    if (typeFilter !== "All")
      list = list.filter((t) => t.taskType === typeFilter);
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks, statusFilter, typeFilter, isSuperAdmin, user?.userId]);

  const openAddModal = useCallback(() => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((task: Task) => {
    setEditTarget(task);
    setForm({
      title: task.title,
      taskType: task.taskType,
      assignedTo: task.assignedTo,
      assignedToName: task.assignedToName,
      linkedVoterName: task.linkedVoterName || "",
      dueDate: task.dueDate || "",
      status: task.status,
      notes: task.notes || "",
    });
    setFormError("");
    setModalOpen(true);
  }, []);

  const handleAssignToChange = useCallback(
    (userId: string) => {
      const found = users.find((u) => u.userId === userId);
      setForm((prev) => ({
        ...prev,
        assignedTo: userId,
        assignedToName: found?.username || "",
      }));
    },
    [users],
  );

  const handleSave = useCallback(() => {
    if (!form.title.trim()) {
      setFormError("Task title is required.");
      return;
    }
    if (!form.assignedTo) {
      setFormError("Please assign this task to a user.");
      return;
    }
    setFormError("");

    const now = Date.now();
    const task: Task = editTarget
      ? {
          ...editTarget,
          title: form.title.trim(),
          taskType: form.taskType,
          assignedTo: form.assignedTo,
          assignedToName: form.assignedToName,
          linkedVoterName: form.linkedVoterName.trim() || undefined,
          dueDate: form.dueDate || undefined,
          status: form.status,
          notes: form.notes.trim() || undefined,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          title: form.title.trim(),
          taskType: form.taskType,
          assignedTo: form.assignedTo,
          assignedToName: form.assignedToName,
          linkedVoterName: form.linkedVoterName.trim() || undefined,
          dueDate: form.dueDate || undefined,
          status: form.status,
          notes: form.notes.trim() || undefined,
          createdAt: now,
          updatedAt: now,
          createdBy: user?.userId || "",
        };

    saveTask(task);
    refresh();
    setModalOpen(false);
    toast.success(editTarget ? "Task updated." : "Task created.");
  }, [form, editTarget, user?.userId, refresh]);

  const handleMarkDone = useCallback(
    (task: Task) => {
      const updated: Task = { ...task, status: "Done", updatedAt: Date.now() };
      saveTask(updated);
      refresh();
      toast.success(`"${task.title}" marked as Done.`);
    },
    [refresh],
  );

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteTask(deleteTarget.id);
    refresh();
    setDeleteTarget(null);
    toast.success(`Task "${deleteTarget.title}" deleted.`);
  }, [deleteTarget, refresh]);

  const canMarkDone = (task: Task) =>
    isSuperAdmin || task.assignedTo === user?.userId;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "#0b0854" }}
          >
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground">
            {visibleTasks.length} task{visibleTasks.length !== 1 ? "s" : ""}
            {!isSuperAdmin ? " assigned to you" : ""}
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            size="sm"
            className="gap-2"
            style={{ background: "#0b0854", color: "#ffffff" }}
            onClick={openAddModal}
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="rounded-lg p-3" style={{ background: "#0b0854" }}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-white shrink-0">
            Filter:
          </span>
          <div className="flex flex-wrap gap-2">
            <div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as TaskStatus | "All")}
              >
                <SelectTrigger className="h-8 text-xs w-36 bg-white text-[#0b0854] border-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="All">All Statuses</SelectItem>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as TaskType | "All")}
              >
                <SelectTrigger className="h-8 text-xs w-44 bg-white text-[#0b0854] border-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="All">All Types</SelectItem>
                  {TASK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(statusFilter !== "All" || typeFilter !== "All") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-white hover:text-white hover:bg-white/20"
                onClick={() => {
                  setStatusFilter("All");
                  setTypeFilter("All");
                }}
              >
                <X className="w-3 h-3" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {visibleTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "#0b0854" + "18" }}
          >
            <ClipboardList className="w-7 h-7" style={{ color: "#0b0854" }} />
          </div>
          <h3 className="font-semibold text-lg mb-1">No tasks found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {isSuperAdmin
              ? "Create a task to assign work to your team members."
              : "No tasks have been assigned to you yet."}
          </p>
          {isSuperAdmin && (
            <Button
              className="mt-4 gap-2"
              size="sm"
              style={{ background: "#0b0854", color: "#ffffff" }}
              onClick={openAddModal}
            >
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b border-border"
                  style={{ background: "oklch(0.96 0.008 240)" }}
                >
                  <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Title
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Type
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Assigned To
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Linked Voter
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Due Date
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task, idx) => (
                  <tr
                    key={task.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                    style={
                      idx % 2 === 1
                        ? { background: "oklch(0.98 0.004 240)" }
                        : undefined
                    }
                  >
                    {/* Title */}
                    <td className="px-3 py-2.5">
                      <div
                        className="font-medium max-w-[180px] truncate"
                        title={task.title}
                      >
                        {task.title}
                      </div>
                      {task.notes && (
                        <div
                          className="text-xs text-muted-foreground truncate max-w-[180px]"
                          title={task.notes}
                        >
                          {task.notes}
                        </div>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <TaskTypeIcon type={task.taskType} />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {task.taskType}
                        </span>
                      </div>
                    </td>

                    {/* Assigned To */}
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-medium">
                        {task.assignedToName}
                      </span>
                    </td>

                    {/* Linked Voter */}
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {task.linkedVoterName || "—"}
                    </td>

                    {/* Due Date */}
                    <td className="px-3 py-2.5 text-xs text-muted-foreground font-mono-data">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5">
                      <StatusBadge status={task.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        {canMarkDone(task) && task.status !== "Done" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Mark as Done"
                            onClick={() => handleMarkDone(task)}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Edit task"
                            onClick={() => openEditModal(task)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            title="Delete task"
                            onClick={() => setDeleteTarget(task)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Task Dialog */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => !open && setModalOpen(false)}
      >
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ color: "#0b0854" }}>
              {editTarget ? "Edit Task" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="task-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. Follow up with booth captain"
              />
            </div>

            {/* Task Type */}
            <div className="space-y-1.5">
              <Label>Task Type</Label>
              <Select
                value={form.taskType}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, taskType: v as TaskType }))
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {TASK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assign To */}
            <div className="space-y-1.5">
              <Label>
                Assign To <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.assignedTo}
                onValueChange={handleAssignToChange}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select a user…" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {users.map((u) => (
                    <SelectItem key={u.userId} value={u.userId}>
                      {u.username} (
                      {u.role === "superAdmin"
                        ? "Super Admin"
                        : u.role === "dataEntry"
                          ? "Data Entry"
                          : "Viewer"}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Linked Voter */}
            <div className="space-y-1.5">
              <Label htmlFor="task-voter">Linked Voter (optional)</Label>
              <Input
                id="task-voter"
                value={form.linkedVoterName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    linkedVoterName: e.target.value,
                  }))
                }
                placeholder="Voter name or ID…"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due Date (optional)</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, status: v as TaskStatus }))
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="task-notes">Notes (optional)</Label>
              <Textarea
                id="task-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Additional details…"
                rows={3}
              />
            </div>

            {formError && (
              <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">
                {formError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              style={{ background: "#0b0854", color: "#ffffff" }}
            >
              {editTarget ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{deleteTarget?.title}"</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
