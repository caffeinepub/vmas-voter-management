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
  Edit,
  ExternalLink,
  MessageSquare,
  MessagesSquare,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteTemplate,
  getAllTemplates,
  saveTemplate,
} from "../store/messaging";
import type { MessageTemplate } from "../store/types";

type GenderTag = "Male" | "Female" | "All";

const GENDER_TAG_STYLES: Record<
  GenderTag,
  { bg: string; text: string; label: string }
> = {
  Male: { bg: "#0b0854", text: "#ffffff", label: "Male" },
  Female: { bg: "#ec4899", text: "#ffffff", label: "Female" },
  All: { bg: "#16c784", text: "#ffffff", label: "All" },
};

interface TemplateFormState {
  name: string;
  genderTag: GenderTag;
  body: string;
}

const EMPTY_FORM: TemplateFormState = {
  name: "",
  genderTag: "All",
  body: "",
};

function GenderBadge({ tag }: { tag: GenderTag }) {
  const style = GENDER_TAG_STYLES[tag];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

export default function MessagingPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "superAdmin";

  const [templates, setTemplates] = useState<MessageTemplate[]>(() =>
    getAllTemplates(),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MessageTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MessageTemplate | null>(
    null,
  );
  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<TemplateFormState>>({});

  const refresh = useCallback(() => setTemplates(getAllTemplates()), []);

  const openAddModal = useCallback(() => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((template: MessageTemplate) => {
    setEditTarget(template);
    setForm({
      name: template.name,
      genderTag: template.genderTag,
      body: template.body,
    });
    setFormErrors({});
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    const errors: Partial<TemplateFormState> = {};
    if (!form.name.trim()) errors.name = "Template name is required";
    if (!form.body.trim()) errors.body = "Message body is required";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const now = Date.now();
    const template: MessageTemplate = editTarget
      ? {
          ...editTarget,
          name: form.name.trim(),
          genderTag: form.genderTag,
          body: form.body.trim(),
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          name: form.name.trim(),
          genderTag: form.genderTag,
          body: form.body.trim(),
          createdAt: now,
          updatedAt: now,
        };
    saveTemplate(template);
    refresh();
    setModalOpen(false);
    toast.success(
      editTarget
        ? "Template updated successfully."
        : "Template created successfully.",
    );
  }, [form, editTarget, refresh]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteTemplate(deleteTarget.id);
    refresh();
    setDeleteTarget(null);
    toast.success(`Template "${deleteTarget.name}" deleted.`);
  }, [deleteTarget, refresh]);

  const handleWhatsApp = useCallback((template: MessageTemplate) => {
    const url = `https://wa.me/?text=${encodeURIComponent(template.body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "#0b0854" }}
          >
            Messaging
          </h1>
          <p className="text-sm text-muted-foreground">
            {templates.length} template{templates.length !== 1 ? "s" : ""} ·
            Click WhatsApp to send
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
            Add Template
          </Button>
        )}
      </div>

      {/* Template Grid */}
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "#0b0854" + "18" }}
          >
            <MessagesSquare className="w-7 h-7" style={{ color: "#0b0854" }} />
          </div>
          <h3 className="font-semibold text-lg mb-1">
            No message templates yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {isSuperAdmin
              ? "Create your first template to quickly send messages via WhatsApp."
              : "No templates have been created by the administrator yet."}
          </p>
          {isSuperAdmin && (
            <Button
              className="mt-4 gap-2"
              size="sm"
              style={{ background: "#0b0854", color: "#ffffff" }}
              onClick={openAddModal}
            >
              <Plus className="w-4 h-4" />
              Add Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-border p-4 space-y-3 flex flex-col"
              style={{ background: "#e3dec5" }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare
                    className="w-4 h-4 shrink-0"
                    style={{ color: "#0b0854" }}
                  />
                  <span
                    className="font-semibold text-sm truncate"
                    style={{ color: "#0b0854" }}
                  >
                    {template.name}
                  </span>
                </div>
                <GenderBadge tag={template.genderTag} />
              </div>

              {/* Body Preview */}
              <p className="text-sm text-foreground/80 line-clamp-3 flex-1 leading-relaxed">
                {template.body}
              </p>

              {/* Placeholder hint */}
              <p className="text-xs text-muted-foreground">
                Variables:{" "}
                {["{name}", "{voterId}", "{mobile}"]
                  .filter((v) => template.body.includes(v))
                  .join(", ") || "none used"}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-black/10">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  style={{
                    background: "#25D366",
                    color: "#ffffff",
                    border: "none",
                  }}
                  onClick={() => handleWhatsApp(template)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  WhatsApp
                </Button>
                {isSuperAdmin && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-black/10"
                      onClick={() => openEditModal(template)}
                      title="Edit template"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(template)}
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => !open && setModalOpen(false)}
      >
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "#0b0854" }}>
              {editTarget ? "Edit Template" : "New Message Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="tpl-name">
                Template Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tpl-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Greeting Message"
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-xs text-destructive">{formErrors.name}</p>
              )}
            </div>

            {/* Gender Tag */}
            <div className="space-y-1.5">
              <Label htmlFor="tpl-gender">Gender Tag</Label>
              <Select
                value={form.genderTag}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, genderTag: v as GenderTag }))
                }
              >
                <SelectTrigger id="tpl-gender" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="All">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <Label htmlFor="tpl-body">
                Message Body <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="tpl-body"
                value={form.body}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Dear {name}, your Voter ID is {voterId}. Please contact us on {mobile} for assistance."
                rows={5}
                className={formErrors.body ? "border-destructive" : ""}
              />
              {formErrors.body && (
                <p className="text-xs text-destructive">{formErrors.body}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use placeholders:{" "}
                <code className="bg-muted px-1 rounded">{"{name}"}</code>{" "}
                <code className="bg-muted px-1 rounded">{"{voterId}"}</code>{" "}
                <code className="bg-muted px-1 rounded">{"{mobile}"}</code>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              style={{ background: "#0b0854", color: "#ffffff" }}
            >
              {editTarget ? "Save Changes" : "Create Template"}
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
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{deleteTarget?.name}"</strong>? This action cannot be
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
