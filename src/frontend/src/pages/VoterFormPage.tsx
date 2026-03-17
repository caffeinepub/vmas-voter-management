import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Camera,
  FileText,
  Loader2,
  Save,
  Star,
  Upload,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PageRoute } from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { getAllCustomFields } from "../store/customFields";
import { getOptionsByCategory } from "../store/dropdowns";
import type { CustomField, VoterRecord } from "../store/types";
import {
  addVoter,
  getVoterById,
  getVoterByVoterId,
  updateVoter,
} from "../store/voters";
import { compressImage, readFileAsDataURL } from "../utils/imageCompression";

interface VoterFormPageProps {
  onNavigate: (page: PageRoute, id?: string) => void;
  editId?: string;
}

type FormData = Omit<
  VoterRecord,
  "id" | "createdAt" | "updatedAt" | "createdBy"
>;

const INITIAL_FORM: FormData = {
  voterId: "",
  fullName: "",
  fatherHusbandName: "",
  gender: "",
  dateOfBirth: "",
  mobile: "",
  alternateMobile: "",
  address: "",
  landmark: "",
  taluka: "",
  district: "",
  boothNumber: "",
  ward: "",
  constituency: "",
  education: "",
  profession: "",
  professionalCategory: "",
  organizationName: "",
  maritalStatus: "",
  caste: "",
  religion: "",
  categoryLabel: "",
  influenceLevel: 0,
  isVolunteer: false,
  notes: "",
  photoUrl: "",
  signatureUrl: "",
  idProofUrl: "",
  educationDocUrl: "",
  customValues: [],
};

function SectionCard({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="section-card">
      <div className="section-title">{title}</div>
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}

interface FileUploadProps {
  label: string;
  accept: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  maxSizeMB: number;
  isImage?: boolean;
}

function FileUpload({
  label,
  accept,
  value,
  onChange,
  maxSizeMB,
  isImage = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File too large. Max size is ${maxSizeMB}MB.`);
      return;
    }
    setUploading(true);
    try {
      if (isImage) {
        const compressed = await compressImage(file);
        onChange(compressed);
      } else {
        const dataUrl = await readFileAsDataURL(file);
        onChange(dataUrl);
      }
    } catch {
      toast.error("Failed to process file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium mb-1.5 block">{label}</Label>
      <div className="flex items-center gap-3">
        {isImage && value && (
          <img
            src={value}
            alt={label}
            className="w-12 h-12 rounded-lg object-cover border"
          />
        )}
        {!isImage && value && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="w-4 h-4" />
            File uploaded
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 h-8"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => onChange("")}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

function StarSelector({
  value,
  onChange,
}: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <button
          type="button"
          key={`influence-star-${i + 1}`}
          onClick={() => onChange(i + 1 === value ? 0 : i + 1)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 transition-colors ${i < value ? "star-filled fill-current" : "star-empty"}`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          Level {value}
        </span>
      )}
    </div>
  );
}

function CustomFieldInput({
  field,
  value,
  onChange,
}: {
  field: CustomField;
  value: string;
  onChange: (v: string) => void;
}) {
  switch (field.fieldType) {
    case "text":
      return (
        <div>
          <Label
            htmlFor={`cf-${field.fieldId}`}
            className="text-sm font-medium mb-1.5 block"
          >
            {field.label}
          </Label>
          <Input
            id={`cf-${field.fieldId}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9"
          />
        </div>
      );
    case "number":
      return (
        <div>
          <Label
            htmlFor={`cf-${field.fieldId}`}
            className="text-sm font-medium mb-1.5 block"
          >
            {field.label}
          </Label>
          <Input
            id={`cf-${field.fieldId}`}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9"
          />
        </div>
      );
    case "date":
      return (
        <div>
          <Label
            htmlFor={`cf-${field.fieldId}`}
            className="text-sm font-medium mb-1.5 block"
          >
            {field.label}
          </Label>
          <Input
            id={`cf-${field.fieldId}`}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9"
          />
        </div>
      );
    case "yesno":
      return (
        <div className="flex items-center gap-3">
          <Switch
            id={`cf-${field.fieldId}`}
            checked={value === "yes"}
            onCheckedChange={(checked) => onChange(checked ? "yes" : "no")}
          />
          <Label
            htmlFor={`cf-${field.fieldId}`}
            className="text-sm font-medium"
          >
            {field.label}
          </Label>
        </div>
      );
    case "dropdown":
      return (
        <div>
          <Label
            htmlFor={`cf-${field.fieldId}`}
            className="text-sm font-medium mb-1.5 block"
          >
            {field.label}
          </Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id={`cf-${field.fieldId}`} className="h-9">
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "multiselect": {
      const selected = value ? value.split(",").filter(Boolean) : [];
      return (
        <div>
          <Label className="text-sm font-medium mb-2 block">
            {field.label}
          </Label>
          <div className="flex flex-wrap gap-2">
            {field.options.map((opt) => (
              <div key={opt} className="flex items-center gap-1.5">
                <Checkbox
                  id={`cf-${field.fieldId}-${opt}`}
                  checked={selected.includes(opt)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...selected, opt]
                      : selected.filter((s) => s !== opt);
                    onChange(next.join(","));
                  }}
                />
                <label
                  htmlFor={`cf-${field.fieldId}-${opt}`}
                  className="text-sm cursor-pointer"
                >
                  {opt}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

export default function VoterFormPage({
  onNavigate,
  editId,
}: VoterFormPageProps) {
  const { user } = useAuth();
  const isEdit = !!editId;
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [customFields] = useState(() => getAllCustomFields());

  // Dropdown options
  const genderOpts = getOptionsByCategory("gender");
  const talukaOpts = getOptionsByCategory("taluka");
  const districtOpts = getOptionsByCategory("district");
  const boothOpts = getOptionsByCategory("booth");
  const wardOpts = getOptionsByCategory("ward");
  const constituencyOpts = getOptionsByCategory("constituency");
  const educationOpts = getOptionsByCategory("education");
  const professionOpts = getOptionsByCategory("profession");
  const profCatOpts = getOptionsByCategory("professionalCategory");
  const maritalOpts = getOptionsByCategory("maritalStatus");
  const casteOpts = getOptionsByCategory("caste");
  const religionOpts = getOptionsByCategory("religion");
  const categoryLabelOpts = getOptionsByCategory("categoryLabel");

  useEffect(() => {
    if (editId) {
      const voter = getVoterById(editId);
      if (voter) {
        const {
          id: _id,
          createdAt: _c,
          updatedAt: _u,
          createdBy: _cb,
          ...rest
        } = voter;
        setForm(rest);
      }
    }
  }, [editId]);

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
  };

  const setCustomValue = (fieldId: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      customValues: [
        ...prev.customValues.filter((cv) => cv.fieldId !== fieldId),
        { fieldId, value },
      ],
    }));
  };

  const getCustomValue = (fieldId: string) => {
    return form.customValues.find((cv) => cv.fieldId === fieldId)?.value ?? "";
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.voterId.trim()) errs.voterId = "Voter ID is required.";
    if (!form.fullName.trim()) errs.fullName = "Full Name is required.";

    // Check voter ID uniqueness
    if (form.voterId.trim()) {
      const existing = getVoterByVoterId(form.voterId.trim());
      if (existing && existing.id !== editId) {
        errs.voterId = "This Voter ID is already in use.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 200));

    try {
      if (isEdit && editId) {
        updateVoter(editId, { ...form, updatedAt: Date.now() });
        toast.success("Voter updated successfully.");
        onNavigate("voter-detail", editId);
      } else {
        const newVoter = addVoter({
          ...form,
          createdBy: user?.userId ?? "unknown",
        });
        toast.success("Voter added successfully.");
        onNavigate("voter-detail", newVoter.id);
      }
    } finally {
      setSaving(false);
    }
  };

  const isViewer = user?.role === "viewer";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => onNavigate("voters")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "#0b0854" }}
          >
            {isEdit ? "Edit Voter" : "Add New Voter"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Update voter information"
              : "Register a new voter in the system"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Section */}
        <div className="section-card flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-border">
              {form.photoUrl && (
                <AvatarImage
                  src={form.photoUrl}
                  alt="Voter photo"
                  className="object-cover"
                />
              )}
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {form.fullName ? (
                  form.fullName.slice(0, 2).toUpperCase()
                ) : (
                  <Camera className="w-8 h-8 opacity-50" />
                )}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="font-semibold mb-1">Voter Photo</div>
            <div className="text-xs text-muted-foreground mb-3">
              JPEG or PNG, max 2MB. Will be compressed to 800×800px.
            </div>
            <FileUpload
              label=""
              accept="image/jpeg,image/png,image/webp"
              value={form.photoUrl}
              onChange={(v) => setField("photoUrl", v)}
              maxSizeMB={2}
              isImage
            />
          </div>
        </div>

        {/* Personal Info */}
        <SectionCard title="Personal Information">
          <FieldRow>
            <div>
              <Label
                htmlFor="voterId"
                className="text-sm font-medium mb-1.5 block"
              >
                Voter ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="voterId"
                value={form.voterId}
                onChange={(e) => setField("voterId", e.target.value)}
                placeholder="Enter Voter ID"
                className={`h-9 ${errors.voterId ? "border-destructive" : ""}`}
              />
              {errors.voterId && (
                <p className="text-xs text-destructive mt-1">
                  {errors.voterId}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="fullName"
                className="text-sm font-medium mb-1.5 block"
              >
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="Enter full name"
                className={`h-9 ${errors.fullName ? "border-destructive" : ""}`}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>
          </FieldRow>
          <FieldRow>
            <div>
              <Label
                htmlFor="fatherHusbandName"
                className="text-sm font-medium mb-1.5 block"
              >
                Father / Husband Name
              </Label>
              <Input
                id="fatherHusbandName"
                value={form.fatherHusbandName ?? ""}
                onChange={(e) => setField("fatherHusbandName", e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label
                htmlFor="gender"
                className="text-sm font-medium mb-1.5 block"
              >
                Gender
              </Label>
              <Select
                value={form.gender ?? ""}
                onValueChange={(v) => setField("gender", v)}
              >
                <SelectTrigger id="gender" className="h-9">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <FieldRow>
            <div>
              <Label
                htmlFor="dateOfBirth"
                className="text-sm font-medium mb-1.5 block"
              >
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={form.dateOfBirth ?? ""}
                onChange={(e) => setField("dateOfBirth", e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label
                htmlFor="mobile"
                className="text-sm font-medium mb-1.5 block"
              >
                Mobile
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={form.mobile ?? ""}
                onChange={(e) => setField("mobile", e.target.value)}
                placeholder="10-digit mobile"
                className="h-9"
              />
            </div>
          </FieldRow>
          <FieldRow>
            <div>
              <Label
                htmlFor="alternateMobile"
                className="text-sm font-medium mb-1.5 block"
              >
                Alternate Mobile
              </Label>
              <Input
                id="alternateMobile"
                type="tel"
                value={form.alternateMobile ?? ""}
                onChange={(e) => setField("alternateMobile", e.target.value)}
                className="h-9"
              />
            </div>
          </FieldRow>
        </SectionCard>

        {/* Location */}
        <SectionCard title="Location">
          <div className="mb-4">
            <Label
              htmlFor="address"
              className="text-sm font-medium mb-1.5 block"
            >
              Address
            </Label>
            <Textarea
              id="address"
              value={form.address ?? ""}
              onChange={(e) => setField("address", e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
          <FieldRow>
            <div>
              <Label
                htmlFor="landmark"
                className="text-sm font-medium mb-1.5 block"
              >
                Landmark
              </Label>
              <Input
                id="landmark"
                value={form.landmark ?? ""}
                onChange={(e) => setField("landmark", e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label
                htmlFor="taluka"
                className="text-sm font-medium mb-1.5 block"
              >
                Taluka
              </Label>
              <Select
                value={form.taluka ?? ""}
                onValueChange={(v) => setField("taluka", v)}
              >
                <SelectTrigger id="taluka" className="h-9">
                  <SelectValue placeholder="Select taluka" />
                </SelectTrigger>
                <SelectContent>
                  {talukaOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <FieldRow>
            <div>
              <Label
                htmlFor="district"
                className="text-sm font-medium mb-1.5 block"
              >
                District
              </Label>
              <Select
                value={form.district ?? ""}
                onValueChange={(v) => setField("district", v)}
              >
                <SelectTrigger id="district" className="h-9">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districtOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="boothNumber"
                className="text-sm font-medium mb-1.5 block"
              >
                Booth Number
              </Label>
              <Select
                value={form.boothNumber ?? ""}
                onValueChange={(v) => setField("boothNumber", v)}
              >
                <SelectTrigger id="boothNumber" className="h-9">
                  <SelectValue placeholder="Select booth" />
                </SelectTrigger>
                <SelectContent>
                  {boothOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <FieldRow>
            <div>
              <Label
                htmlFor="ward"
                className="text-sm font-medium mb-1.5 block"
              >
                Ward
              </Label>
              <Select
                value={form.ward ?? ""}
                onValueChange={(v) => setField("ward", v)}
              >
                <SelectTrigger id="ward" className="h-9">
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {wardOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="constituency"
                className="text-sm font-medium mb-1.5 block"
              >
                Constituency
              </Label>
              <Select
                value={form.constituency ?? ""}
                onValueChange={(v) => setField("constituency", v)}
              >
                <SelectTrigger id="constituency" className="h-9">
                  <SelectValue placeholder="Select constituency" />
                </SelectTrigger>
                <SelectContent>
                  {constituencyOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
        </SectionCard>

        {/* Political */}
        <SectionCard title="Political Information">
          <FieldRow>
            <div>
              <Label
                htmlFor="categoryLabel"
                className="text-sm font-medium mb-1.5 block"
              >
                Category Label
              </Label>
              <Select
                value={form.categoryLabel ?? ""}
                onValueChange={(v) => setField("categoryLabel", v)}
              >
                <SelectTrigger id="categoryLabel" className="h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryLabelOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              o.label === "Supporter"
                                ? "#16a34a"
                                : o.label === "Opponent"
                                  ? "#dc2626"
                                  : "#d97706",
                          }}
                        />
                        {o.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Influence Level
              </Label>
              <StarSelector
                value={form.influenceLevel ?? 0}
                onChange={(v) => setField("influenceLevel", v)}
              />
            </div>
          </FieldRow>
          <div className="flex items-center gap-3 mt-2">
            <Switch
              id="isVolunteer"
              checked={form.isVolunteer ?? false}
              onCheckedChange={(v) => setField("isVolunteer", v)}
            />
            <Label
              htmlFor="isVolunteer"
              className="text-sm font-medium cursor-pointer"
            >
              Volunteer
              {form.isVolunteer && (
                <Badge
                  variant="outline"
                  className="ml-2 text-xs"
                  style={{ color: "#16a34a", borderColor: "#16a34a" }}
                >
                  Active
                </Badge>
              )}
            </Label>
          </div>
        </SectionCard>

        {/* Professional */}
        <SectionCard title="Professional Information">
          <FieldRow>
            <div>
              <Label
                htmlFor="education"
                className="text-sm font-medium mb-1.5 block"
              >
                Education
              </Label>
              <Select
                value={form.education ?? ""}
                onValueChange={(v) => setField("education", v)}
              >
                <SelectTrigger id="education" className="h-9">
                  <SelectValue placeholder="Select education" />
                </SelectTrigger>
                <SelectContent>
                  {educationOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="profession"
                className="text-sm font-medium mb-1.5 block"
              >
                Profession
              </Label>
              <Select
                value={form.profession ?? ""}
                onValueChange={(v) => setField("profession", v)}
              >
                <SelectTrigger id="profession" className="h-9">
                  <SelectValue placeholder="Select profession" />
                </SelectTrigger>
                <SelectContent>
                  {professionOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <FieldRow>
            <div>
              <Label
                htmlFor="professionalCategory"
                className="text-sm font-medium mb-1.5 block"
              >
                Professional Category
              </Label>
              <Select
                value={form.professionalCategory ?? ""}
                onValueChange={(v) => setField("professionalCategory", v)}
              >
                <SelectTrigger id="professionalCategory" className="h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {profCatOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="organizationName"
                className="text-sm font-medium mb-1.5 block"
              >
                Office / Organization Name
              </Label>
              <Input
                id="organizationName"
                value={form.organizationName ?? ""}
                onChange={(e) => setField("organizationName", e.target.value)}
                className="h-9"
              />
            </div>
          </FieldRow>
        </SectionCard>

        {/* Other */}
        <SectionCard title="Other Details">
          <FieldRow>
            <div>
              <Label
                htmlFor="maritalStatus"
                className="text-sm font-medium mb-1.5 block"
              >
                Marital Status
              </Label>
              <Select
                value={form.maritalStatus ?? ""}
                onValueChange={(v) => setField("maritalStatus", v)}
              >
                <SelectTrigger id="maritalStatus" className="h-9">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {maritalOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="caste"
                className="text-sm font-medium mb-1.5 block"
              >
                Caste
              </Label>
              <Select
                value={form.caste ?? ""}
                onValueChange={(v) => setField("caste", v)}
              >
                <SelectTrigger id="caste" className="h-9">
                  <SelectValue placeholder="Select caste" />
                </SelectTrigger>
                <SelectContent>
                  {casteOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <FieldRow>
            <div>
              <Label
                htmlFor="religion"
                className="text-sm font-medium mb-1.5 block"
              >
                Religion
              </Label>
              <Select
                value={form.religion ?? ""}
                onValueChange={(v) => setField("religion", v)}
              >
                <SelectTrigger id="religion" className="h-9">
                  <SelectValue placeholder="Select religion" />
                </SelectTrigger>
                <SelectContent>
                  {religionOpts.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <div className="mt-4">
            <Label htmlFor="notes" className="text-sm font-medium mb-1.5 block">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={form.notes ?? ""}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              className="resize-none"
              placeholder="Any additional notes…"
            />
          </div>
        </SectionCard>

        {/* Documents */}
        <SectionCard title="Documents & Files">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FileUpload
              label="Signature"
              accept="image/jpeg,image/png"
              value={form.signatureUrl}
              onChange={(v) => setField("signatureUrl", v)}
              maxSizeMB={2}
              isImage
            />
            <FileUpload
              label="ID Proof"
              accept="image/jpeg,image/png,application/pdf"
              value={form.idProofUrl}
              onChange={(v) => setField("idProofUrl", v)}
              maxSizeMB={5}
            />
            <FileUpload
              label="Educational Documents"
              accept="image/jpeg,image/png,application/pdf"
              value={form.educationDocUrl}
              onChange={(v) => setField("educationDocUrl", v)}
              maxSizeMB={5}
            />
          </div>
        </SectionCard>

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <SectionCard title="Custom Fields">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {customFields.map((cf) => (
                <CustomFieldInput
                  key={cf.fieldId}
                  field={cf}
                  value={getCustomValue(cf.fieldId)}
                  onChange={(v) => setCustomValue(cf.fieldId, v)}
                />
              ))}
            </div>
          </SectionCard>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 pb-6">
          <Button type="submit" className="gap-2" disabled={saving || isViewer}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving…" : isEdit ? "Update Voter" : "Add Voter"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate("voters")}
          >
            Cancel
          </Button>
          {isViewer && (
            <span className="text-sm text-muted-foreground">
              You have viewer-only access.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
