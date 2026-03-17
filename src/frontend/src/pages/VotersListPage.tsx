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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit,
  Eye,
  Filter,
  MessageCircle,
  MessageSquare,
  Printer,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { PageRoute } from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { getOptionsByCategory } from "../store/dropdowns";
import { getAllTemplates } from "../store/messaging";
import { getLabelConfig, setLabelConfig } from "../store/storage";
import type { VoterFilterState, VoterRecord } from "../store/types";
import { deleteVoter, exportToCSV, filterVoters } from "../store/voters";

// All standard fields that can appear on a label (mirrors LabelPrintPage.tsx)
const AVAILABLE_FIELDS: { key: keyof VoterRecord | string; label: string }[] = [
  { key: "fullName", label: "Full Name" },
  { key: "voterId", label: "Voter ID" },
  { key: "fatherHusbandName", label: "Father / Husband Name" },
  { key: "gender", label: "Gender" },
  { key: "dateOfBirth", label: "Date of Birth" },
  { key: "mobile", label: "Mobile" },
  { key: "alternateMobile", label: "Alternate Mobile" },
  { key: "address", label: "Address" },
  { key: "landmark", label: "Landmark" },
  { key: "taluka", label: "Taluka" },
  { key: "district", label: "District" },
  { key: "boothNumber", label: "Booth Number" },
  { key: "ward", label: "Ward" },
  { key: "constituency", label: "Constituency" },
  { key: "education", label: "Education" },
  { key: "profession", label: "Profession" },
  { key: "caste", label: "Caste" },
  { key: "religion", label: "Religion" },
  { key: "categoryLabel", label: "Category" },
  { key: "influenceLevel", label: "Influence Level" },
  { key: "maritalStatus", label: "Marital Status" },
  { key: "organizationName", label: "Organization" },
];

function getFieldValue(voter: VoterRecord, key: string): string {
  const val = (voter as unknown as Record<string, unknown>)[key];
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return String(val);
}

const MONTHS = [
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

function CategoryBadge({ value }: { value?: string }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  const cls =
    value === "Supporter"
      ? "badge-supporter"
      : value === "Opponent"
        ? "badge-opponent"
        : "badge-neutral";
  return <span className={cls}>{value}</span>;
}

function StarRating({ value }: { value?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={`star-pos-${i + 1}`}
          className={`w-3.5 h-3.5 ${i < (value || 0) ? "star-filled fill-current" : "star-empty"}`}
        />
      ))}
    </div>
  );
}

// ─── Print Labels Dialog ─────────────────────────────────────────────────────

interface PrintLabelsDialogProps {
  open: boolean;
  onClose: () => void;
  votersToPrint: VoterRecord[];
  votersLabel: string;
}

function PrintLabelsDialog({
  open,
  onClose,
  votersToPrint,
  votersLabel,
}: PrintLabelsDialogProps) {
  const [config, setConfig] = useState(() => getLabelConfig());

  const toggleField = (key: string) => {
    setConfig((prev) => ({
      selectedFields: prev.selectedFields.includes(key)
        ? prev.selectedFields.filter((f) => f !== key)
        : [...prev.selectedFields, key],
    }));
  };

  const handlePrint = () => {
    if (config.selectedFields.length === 0) {
      toast.error("Please select at least one field to print.");
      return;
    }
    if (votersToPrint.length === 0) {
      toast.error("No voters to print.");
      return;
    }

    setLabelConfig(config);

    const nameField = config.selectedFields.includes("fullName");
    const otherFields = config.selectedFields.filter((f) => f !== "fullName");

    const labelHTML = (voter: VoterRecord) => `
      <div class="label-card">
        ${nameField ? `<div class="label-name">${voter.fullName}</div>` : ""}
        ${otherFields
          .map((fk) => {
            const def = AVAILABLE_FIELDS.find((f) => f.key === fk);
            const val = getFieldValue(voter, fk);
            if (!val || !def) return "";
            return `<div class="label-field"><span class="label-key">${def.label}:</span><span>${val}</span></div>`;
          })
          .join("")}
      </div>
    `;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voter Labels — SurveyMitra</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 9pt; }
          .page { padding: 10mm; }
          .label-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4mm; }
          .label-card { border: 1px solid #ccc; padding: 4mm; break-inside: avoid; }
          .label-name { font-size: 11pt; font-weight: bold; border-bottom: 1px solid #eee; margin-bottom: 2mm; padding-bottom: 1mm; }
          .label-field { display: flex; gap: 2mm; margin-bottom: 0.5mm; }
          .label-key { font-weight: 600; min-width: 28mm; color: #555; }
          @page { size: A4; margin: 0; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="label-grid">
            ${votersToPrint.map((v) => labelHTML(v)).join("")}
          </div>
        </div>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Please allow popups to print labels.");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    toast.success(`Printing ${votersToPrint.length} voter labels.`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2"
            style={{ color: "#0b0854" }}
          >
            <Printer className="w-5 h-5" />
            Print Labels
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Will print labels for <strong>{votersToPrint.length}</strong> voter
            {votersToPrint.length !== 1 ? "s" : ""} ({votersLabel}).
          </p>
          <div>
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: "#0b0854" }}
            >
              Select Fields to Include
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
              {AVAILABLE_FIELDS.map((f) => (
                <div key={f.key as string} className="flex items-center gap-2">
                  <Checkbox
                    id={`print-field-${f.key as string}`}
                    checked={config.selectedFields.includes(f.key as string)}
                    onCheckedChange={() => toggleField(f.key as string)}
                  />
                  <Label
                    htmlFor={`print-field-${f.key as string}`}
                    className="text-sm cursor-pointer"
                  >
                    {f.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {config.selectedFields.length} field
            {config.selectedFields.length !== 1 ? "s" : ""} selected · A4 paper,
            2 labels per row
          </p>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="gap-2"
            style={{ background: "#0b0854", color: "white" }}
            onClick={handlePrint}
            disabled={config.selectedFields.length === 0}
          >
            <Printer className="w-4 h-4" />
            Print {votersToPrint.length} Label
            {votersToPrint.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── WhatsApp Dialog ─────────────────────────────────────────────────────────

interface WhatsAppDialogProps {
  open: boolean;
  onClose: () => void;
  selectedVoters: VoterRecord[];
}

function WhatsAppDialog({
  open,
  onClose,
  selectedVoters,
}: WhatsAppDialogProps) {
  const templates = useMemo(() => getAllTemplates(), []);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) ?? null;

  const votersWithMobile = useMemo(
    () => selectedVoters.filter((v) => v.mobile && v.mobile.trim() !== ""),
    [selectedVoters],
  );

  const firstVoter = selectedVoters[0];

  const personalizeMessage = useCallback((voter: VoterRecord, body: string) => {
    return body
      .replace(/\{name\}/g, voter.fullName || "")
      .replace(/\{voterId\}/g, voter.voterId || "")
      .replace(/\{mobile\}/g, voter.mobile || "");
  }, []);

  const previewMessage = useMemo(() => {
    if (!selectedTemplate || !firstVoter) return "";
    return personalizeMessage(firstVoter, selectedTemplate.body);
  }, [selectedTemplate, firstVoter, personalizeMessage]);

  const waLinks = useMemo(() => {
    if (!selectedTemplate) return [];
    return votersWithMobile.map((voter) => {
      const msg = personalizeMessage(voter, selectedTemplate.body);
      const mobile = (voter.mobile || "").replace(/\D/g, "");
      return {
        voter,
        url: `https://wa.me/${mobile}?text=${encodeURIComponent(msg)}`,
        msg,
      };
    });
  }, [selectedTemplate, votersWithMobile, personalizeMessage]);

  const handleSendAll = () => {
    if (waLinks.length === 0) return;
    // For 3 or fewer, open tabs directly; otherwise show link list
    if (waLinks.length <= 3) {
      for (const link of waLinks) {
        window.open(link.url, "_blank");
      }
      toast.success(
        `Opened WhatsApp for ${waLinks.length} voter${waLinks.length !== 1 ? "s" : ""}.`,
      );
      onClose();
    }
    // For >3, the UI shows the list — handled in JSX
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <MessageCircle className="w-5 h-5" />
            Send WhatsApp
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Mobile count summary */}
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            <strong>{votersWithMobile.length}</strong> of{" "}
            <strong>{selectedVoters.length}</strong> selected voter
            {selectedVoters.length !== 1 ? "s" : ""} have mobile numbers.
          </div>

          {/* Template selector */}
          {templates.length === 0 ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              No templates found. Please add templates in the{" "}
              <strong>Messaging</strong> page.
            </div>
          ) : (
            <>
              <div>
                <Label
                  className="text-sm font-semibold mb-1.5 block"
                  style={{ color: "#0b0854" }}
                >
                  Select Template
                </Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger className="h-9 bg-[#e3dec5] border-[#e3dec5]">
                    <SelectValue placeholder="Choose a message template…" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({t.genderTag})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {selectedTemplate && firstVoter && (
                <div>
                  <Label
                    className="text-sm font-semibold mb-1.5 block"
                    style={{ color: "#0b0854" }}
                  >
                    Message Preview (for {firstVoter.fullName})
                  </Label>
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-900 whitespace-pre-wrap">
                    {previewMessage}
                  </div>
                </div>
              )}

              {/* Link list for >3 voters */}
              {selectedTemplate && waLinks.length > 3 && (
                <div>
                  <Label
                    className="text-sm font-semibold mb-1.5 block"
                    style={{ color: "#0b0854" }}
                  >
                    WhatsApp Links ({waLinks.length} voters)
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Click each link to open WhatsApp with the personalized
                    message.
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-border rounded-lg p-2">
                    {waLinks.map(({ voter, url }) => (
                      <a
                        key={voter.id}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 hover:bg-green-100 transition-colors text-sm text-green-800 font-medium"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{voter.fullName}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {voter.mobile}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {templates.length > 0 &&
            selectedTemplate &&
            waLinks.length > 0 &&
            waLinks.length <= 3 && (
              <Button
                size="sm"
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSendAll}
              >
                <MessageCircle className="w-4 h-4" />
                Send via WhatsApp ({waLinks.length})
              </Button>
            )}
          {templates.length > 0 && selectedTemplate && waLinks.length > 3 && (
            <span className="text-xs text-muted-foreground self-center">
              Click links above to send
            </span>
          )}
          {templates.length > 0 && votersWithMobile.length === 0 && (
            <span className="text-xs text-destructive self-center">
              No voters have mobile numbers
            </span>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface VotersListPageProps {
  onNavigate: (page: PageRoute, id?: string) => void;
}

export default function VotersListPage({ onNavigate }: VotersListPageProps) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<VoterFilterState>({
    search: "",
    boothNumber: "",
    ward: "",
    education: "",
    profession: "",
    categoryLabel: "",
    gender: "",
    birthdayMonth: "",
    caste: "",
    organizationName: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [pageJumpInput, setPageJumpInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<VoterRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [printLabelsDialogOpen, setPrintLabelsDialogOpen] = useState(false);
  const [whatsAppDialogOpen, setWhatsAppDialogOpen] = useState(false);

  const educationOptions = useMemo(() => getOptionsByCategory("education"), []);
  const isSuperAdmin = user?.role === "superAdmin";

  const filteredVoters = useMemo(() => {
    void refreshKey; // reactive dependency for re-fetching after delete
    return filterVoters(filters);
  }, [filters, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filteredVoters.length / pageSize));
  const paginatedVoters = filteredVoters.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const updateFilter = useCallback(
    <K extends keyof VoterFilterState>(key: K, value: VoterFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
      setSelectedIds(new Set());
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      boothNumber: "",
      ward: "",
      education: "",
      profession: "",
      categoryLabel: "",
      gender: "",
      birthdayMonth: "",
      caste: "",
      organizationName: "",
    });
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== "search" && v !== "",
  ).length;

  const allPageSelected =
    paginatedVoters.length > 0 &&
    paginatedVoters.every((v) => selectedIds.has(v.id));
  const somePageSelected = paginatedVoters.some((v) => selectedIds.has(v.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const v of paginatedVoters) next.delete(v.id);
      } else {
        for (const v of paginatedVoters) next.add(v.id);
      }
      return next;
    });
  }, [allPageSelected, paginatedVoters]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedVoters = useMemo(
    () => filteredVoters.filter((v) => selectedIds.has(v.id)),
    [filteredVoters, selectedIds],
  );

  // Voters to print: selected if any, else all filtered
  const votersToPrint = useMemo(
    () => (selectedIds.size > 0 ? selectedVoters : filteredVoters),
    [selectedIds, selectedVoters, filteredVoters],
  );
  const votersPrintLabel =
    selectedIds.size > 0
      ? `${selectedIds.size} selected`
      : `all ${filteredVoters.length} filtered`;

  const handleCopyMobiles = useCallback(() => {
    const mobiles = selectedVoters
      .map((v) => v.mobile)
      .filter(Boolean)
      .join(", ");
    if (!mobiles) {
      toast.error("No mobile numbers available for selected voters.");
      return;
    }
    navigator.clipboard
      .writeText(mobiles)
      .then(() => {
        toast.success("Mobile numbers copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard.");
      });
  }, [selectedVoters]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteVoter(deleteTarget.id);
    toast.success(`Voter "${deleteTarget.fullName}" deleted.`);
    setDeleteTarget(null);
    setRefreshKey((k) => k + 1);
  }, [deleteTarget]);

  const handleExportCSV = useCallback(() => {
    const csv = exportToCSV(filteredVoters);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voters_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredVoters.length} voters to CSV.`);
  }, [filteredVoters]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handlePageJump = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const num = Number.parseInt(pageJumpInput, 10);
        if (!Number.isNaN(num) && num >= 1 && num <= totalPages) {
          setPage(num);
        }
        setPageJumpInput("");
      }
    },
    [pageJumpInput, totalPages],
  );

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "#0b0854" }}
          >
            Voters
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredVoters.length} voter
            {filteredVoters.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#0b0854] text-[#0b0854] hover:bg-[#0b0854]/10"
              onClick={() => setSmsDialogOpen(true)}
            >
              <MessageSquare className="w-4 h-4" />
              Send SMS ({selectedIds.size})
            </Button>
          )}
          {selectedIds.size > 0 && (
            <Button
              size="sm"
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setWhatsAppDialogOpen(true)}
            >
              <MessageCircle className="w-4 h-4" />
              Send WhatsApp ({selectedIds.size})
            </Button>
          )}
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#0b0854] text-[#0b0854] hover:bg-[#0b0854]/10"
              onClick={() => setPrintLabelsDialogOpen(true)}
            >
              <Printer className="w-4 h-4" />
              Print Labels
            </Button>
          )}
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          )}
          {(isSuperAdmin || user?.role === "dataEntry") && (
            <Button
              size="sm"
              onClick={() => onNavigate("voter-add")}
              className="gap-2"
            >
              + Add Voter
            </Button>
          )}
        </div>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, voter ID, or mobile…"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-9 relative"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs flex items-center justify-center text-white"
              style={{ background: "#0b0854" }}
            >
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-lg p-4" style={{ background: "#0b0854" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs gap-1 text-white hover:text-white hover:bg-white/20"
            >
              <X className="w-3 h-3" />
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <span className="text-xs text-white mb-1 block">
                Booth Number
              </span>
              <Input
                id="filter-booth"
                value={filters.boothNumber}
                onChange={(e) => updateFilter("boothNumber", e.target.value)}
                placeholder="Booth…"
                className="h-8 text-sm bg-white text-[#0b0854] border-white placeholder:text-[#0b0854]/50"
              />
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Ward</span>
              <Input
                id="filter-ward"
                value={filters.ward}
                onChange={(e) => updateFilter("ward", e.target.value)}
                placeholder="Ward…"
                className="h-8 text-sm bg-white text-[#0b0854] border-white placeholder:text-[#0b0854]/50"
              />
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Education</span>
              <Select
                value={filters.education}
                onValueChange={(v) =>
                  updateFilter("education", v === "_all" ? "" : v)
                }
              >
                <SelectTrigger className="filter-select-trigger h-8 text-sm w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All</SelectItem>
                  {educationOptions.map((o) => (
                    <SelectItem key={o.id} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Category</span>
              <Select
                value={filters.categoryLabel}
                onValueChange={(v) =>
                  updateFilter("categoryLabel", v === "_all" ? "" : v)
                }
              >
                <SelectTrigger className="filter-select-trigger h-8 text-sm w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All</SelectItem>
                  <SelectItem value="Supporter">Supporter</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Opponent">Opponent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Gender</span>
              <Select
                value={filters.gender}
                onValueChange={(v) =>
                  updateFilter("gender", v === "_all" ? "" : v)
                }
              >
                <SelectTrigger className="filter-select-trigger h-8 text-sm w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">
                Birthday Month
              </span>
              <Select
                value={filters.birthdayMonth}
                onValueChange={(v) =>
                  updateFilter("birthdayMonth", v === "_all" ? "" : v)
                }
              >
                <SelectTrigger className="filter-select-trigger h-8 text-sm w-full">
                  <SelectValue placeholder="Any month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any month</SelectItem>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Caste</span>
              <Input
                id="filter-caste"
                value={filters.caste}
                onChange={(e) => updateFilter("caste", e.target.value)}
                placeholder="Caste…"
                className="h-8 text-sm bg-white text-[#0b0854] border-white placeholder:text-[#0b0854]/50"
              />
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">
                Organization
              </span>
              <Input
                id="filter-org"
                value={filters.organizationName}
                onChange={(e) =>
                  updateFilter("organizationName", e.target.value)
                }
                placeholder="Organization…"
                className="h-8 text-sm bg-white text-[#0b0854] border-white placeholder:text-[#0b0854]/50"
              />
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Profession</span>
              <Input
                id="filter-profession"
                value={filters.profession}
                onChange={(e) => updateFilter("profession", e.target.value)}
                placeholder="Profession…"
                className="h-8 text-sm bg-white text-[#0b0854] border-white placeholder:text-[#0b0854]/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b border-border"
                style={{ background: "oklch(0.96 0.008 240)" }}
              >
                <th className="px-3 py-2.5 w-8">
                  <Checkbox
                    checked={allPageSelected}
                    data-state={
                      somePageSelected && !allPageSelected
                        ? "indeterminate"
                        : undefined
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all on page"
                  />
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Photo
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Voter ID
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Name
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Mobile
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Ward
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Booth
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Category
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Influence
                </th>
                <th className="px-3 py-2.5 text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedVoters.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-30" />
                      <span>No voters found matching your criteria</span>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedVoters.map((voter, idx) => (
                  <tr
                    key={voter.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                    style={
                      idx % 2 === 1
                        ? { background: "oklch(0.98 0.004 240)" }
                        : undefined
                    }
                  >
                    <td className="px-3 py-2.5 w-8">
                      <Checkbox
                        checked={selectedIds.has(voter.id)}
                        onCheckedChange={() => toggleSelect(voter.id)}
                        aria-label={`Select ${voter.fullName}`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Avatar className="w-8 h-8">
                        {voter.photoUrl && (
                          <AvatarImage
                            src={voter.photoUrl}
                            alt={voter.fullName}
                          />
                        )}
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {voter.fullName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono-data text-xs text-muted-foreground">
                        {voter.voterId}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        className="font-medium hover:underline hover:text-primary text-left"
                        onClick={() => onNavigate("voter-detail", voter.id)}
                      >
                        {voter.fullName}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground font-mono-data text-xs">
                      {voter.mobile || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">
                      {voter.ward || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">
                      {voter.boothNumber || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <CategoryBadge value={voter.categoryLabel} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StarRating value={voter.influenceLevel} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onNavigate("voter-detail", voter.id)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {(isSuperAdmin || user?.role === "dataEntry") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => onNavigate("voter-edit", voter.id)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(voter)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-wrap gap-2">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Rows per page:
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => handlePageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-7 w-20 text-xs bg-white border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem
                    key={size}
                    value={String(size)}
                    className="text-xs"
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Page {page} of {totalPages} · {filteredVoters.length} results
            </span>
          </div>
          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum =
                Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  className="h-7 w-7 p-0 text-xs"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            {/* Jump to page */}
            <div className="flex items-center gap-1 ml-1">
              <span className="text-xs text-muted-foreground">Go to:</span>
              <Input
                className="h-7 w-14 text-xs text-center px-1"
                placeholder={String(page)}
                value={pageJumpInput}
                onChange={(e) => setPageJumpInput(e.target.value)}
                onKeyDown={handlePageJump}
                type="number"
                min={1}
                max={totalPages}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.fullName}</strong>? This action cannot be
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

      {/* SMS Not Available Dialog */}
      <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              SMS Not Available
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              Direct SMS integration is not available yet. Please contact your
              administrator to enable SMS service.
            </div>
            <p className="text-sm text-muted-foreground">
              You have selected <strong>{selectedIds.size}</strong> voter
              {selectedIds.size !== 1 ? "s" : ""}. You can copy their mobile
              numbers and use an external SMS tool.
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleCopyMobiles}
            >
              <Copy className="w-4 h-4" />
              Copy Mobile Numbers
            </Button>
            <Button size="sm" onClick={() => setSmsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Labels Dialog */}
      {isSuperAdmin && (
        <PrintLabelsDialog
          open={printLabelsDialogOpen}
          onClose={() => setPrintLabelsDialogOpen(false)}
          votersToPrint={votersToPrint}
          votersLabel={votersPrintLabel}
        />
      )}

      {/* WhatsApp Dialog */}
      <WhatsAppDialog
        open={whatsAppDialogOpen}
        onClose={() => setWhatsAppDialogOpen(false)}
        selectedVoters={selectedVoters}
      />
    </div>
  );
}
