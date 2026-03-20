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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  addCustomField,
  deleteCustomField,
  getAllCustomFields,
} from "../store/customFields";
import {
  DROPDOWN_CATEGORIES,
  addOption,
  deleteOption,
  getOptionsByCategory,
} from "../store/dropdowns";
import {
  getFormLabels,
  getUsers,
  getVoters,
  setFormLabels,
  setUsers,
  setVoters,
} from "../store/storage";
import type {
  CustomFieldType,
  DropdownOption,
  User,
  UserRole,
  VoterRecord,
} from "../store/types";
// XLSX loaded from CDN at runtime
type XLSXStatic = {
  utils: {
    aoa_to_sheet: (data: unknown[][]) => Record<string, unknown>;
    book_new: () => Record<string, unknown>;
    book_append_sheet: (
      wb: Record<string, unknown>,
      ws: Record<string, unknown>,
      name: string,
    ) => void;
    sheet_to_json: <T>(
      ws: Record<string, unknown>,
      opts?: Record<string, unknown>,
    ) => T[];
  };
  read: (
    data: ArrayBuffer,
    opts?: Record<string, unknown>,
  ) => {
    SheetNames: string[];
    Sheets: Record<string, Record<string, unknown>>;
  };
  writeFile: (wb: Record<string, unknown>, filename: string) => void;
};
declare global {
  interface Window {
    XLSX?: XLSXStatic;
  }
}
const loadXLSX = (): Promise<XLSXStatic> => {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    script.onload = () =>
      window.XLSX
        ? resolve(window.XLSX)
        : reject(new Error("XLSX failed to load"));
    script.onerror = () => reject(new Error("Failed to load XLSX"));
    document.head.appendChild(script);
  });
};

const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  yesno: "Yes / No",
  dropdown: "Dropdown",
  multiselect: "Multi-Select",
};

const ROLE_LABELS: Record<UserRole, string> = {
  superAdmin: "Super Admin",
  dataEntry: "Data Entry",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<UserRole, string> = {
  superAdmin: "bg-amber-100 text-amber-800",
  dataEntry: "bg-blue-100 text-blue-800",
  viewer: "bg-gray-100 text-gray-700",
};

// ---- Dropdown Manager Tab ----
function DropdownManagerTab() {
  const [selectedCategory, setSelectedCategory] = useState("categoryLabel");
  const [newLabel, setNewLabel] = useState("");
  const [newParentCaste, setNewParentCaste] = useState("");
  const [options, setOptions] = useState(() =>
    getOptionsByCategory("categoryLabel"),
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const isSubcaste = selectedCategory === "subcaste";
  const casteOpts = getOptionsByCategory("caste");

  const refreshOptions = (cat: string) => {
    setOptions(getOptionsByCategory(cat));
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setOptions(getOptionsByCategory(cat));
    setNewLabel("");
    setNewParentCaste("");
  };

  const handleAdd = () => {
    if (!newLabel.trim()) {
      toast.error("Please enter an option label.");
      return;
    }
    if (isSubcaste && !newParentCaste) {
      toast.error("Please select a parent caste for the sub caste.");
      return;
    }
    if (isSubcaste) {
      addOption(selectedCategory, newLabel.trim(), "caste", newParentCaste);
    } else {
      addOption(selectedCategory, newLabel.trim());
    }
    refreshOptions(selectedCategory);
    setNewLabel("");
    setNewParentCaste("");
    toast.success("Option added.");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteOption(deleteTarget);
    refreshOptions(selectedCategory);
    setDeleteTarget(null);
    toast.success("Option deleted.");
  };

  // Group subcaste options by parent caste
  const groupedSubcaste: Record<string, DropdownOption[]> = {};
  if (isSubcaste) {
    for (const opt of options) {
      const parent = opt.parentValue ?? "(No Parent)";
      if (!groupedSubcaste[parent]) groupedSubcaste[parent] = [];
      groupedSubcaste[parent].push(opt);
    }
  }

  return (
    <div className="space-y-5">
      <div className="max-w-xs">
        <Label htmlFor="catSelect" className="text-sm font-medium mb-1.5 block">
          Select Category
        </Label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger id="catSelect" className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DROPDOWN_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>
              Options for:{" "}
              {
                DROPDOWN_CATEGORIES.find((c) => c.value === selectedCategory)
                  ?.label
              }
            </span>
            <Badge variant="outline">{options.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSubcaste ? (
            <div className="mb-4">
              {Object.keys(groupedSubcaste).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sub castes yet. Add one below.
                </p>
              ) : (
                Object.entries(groupedSubcaste).map(([parent, subOpts]) => (
                  <div key={parent} className="mb-4">
                    <div
                      className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded mb-2"
                      style={{
                        background: "rgba(11,8,84,0.08)",
                        color: "#0b0854",
                      }}
                    >
                      {parent}
                    </div>
                    <ul className="space-y-1.5 pl-2">
                      {subOpts.map((opt) => (
                        <li
                          key={opt.id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border"
                        >
                          <span className="text-sm">{opt.label}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(opt.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          ) : options.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-4">
              No options yet. Add one below.
            </p>
          ) : (
            <ul className="space-y-1.5 mb-4">
              {options.map((opt) => (
                <li
                  key={opt.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border"
                >
                  <span className="text-sm">{opt.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(opt.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2 flex-wrap">
            {isSubcaste && (
              <Select value={newParentCaste} onValueChange={setNewParentCaste}>
                <SelectTrigger className="h-9 w-40">
                  <SelectValue placeholder="Parent Caste" />
                </SelectTrigger>
                <SelectContent>
                  {casteOpts.map((c) => (
                    <SelectItem key={c.id} value={c.label}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={isSubcaste ? "Sub caste name…" : "New option label…"}
              className="h-9 flex-1 min-w-[140px]"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button size="sm" className="gap-1.5 h-9" onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Option</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this option?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Form Labels Tab ----
const STANDARD_FORM_FIELDS = [
  { key: "voterId", default: "Voter ID" },
  { key: "fullName", default: "Full Name" },
  { key: "fatherHusbandName", default: "Father/Husband Name" },
  { key: "gender", default: "Gender" },
  { key: "mobile", default: "Mobile" },
  { key: "address", default: "Address" },
  { key: "taluka", default: "Taluka" },
  { key: "district", default: "District" },
  { key: "boothNumber", default: "Booth Number" },
  { key: "ward", default: "Ward" },
  { key: "constituency", default: "Constituency" },
  { key: "caste", default: "Caste Category" },
  { key: "subCaste", default: "Sub Caste" },
  { key: "religion", default: "Religion" },
  { key: "education", default: "Education" },
  { key: "profession", default: "Profession" },
  { key: "maritalStatus", default: "Marital Status" },
  { key: "categoryLabel", default: "Category Label" },
  { key: "influenceLevel", default: "Influence Level" },
];

function FormLabelsTab() {
  const [labels, setLabels] = useState<Record<string, string>>(() =>
    getFormLabels(),
  );
  const [dirty, setDirty] = useState(false);

  const handleChange = (key: string, value: string) => {
    setLabels((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleReset = (key: string) => {
    setLabels((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setDirty(true);
  };

  const handleSave = () => {
    setFormLabels(labels);
    setDirty(false);
    toast.success("Form labels saved.");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Customize the labels shown in the voter form. Useful for regional
            language adaptation or renaming fields.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 h-9"
          onClick={handleSave}
          disabled={!dirty}
          style={dirty ? { background: "#0b0854" } : {}}
        >
          <Save className="w-4 h-4" />
          Save All Labels
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {STANDARD_FORM_FIELDS.map((f) => (
              <div
                key={f.key}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center py-2 border-b last:border-0"
              >
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {f.default}
                  </span>
                  <span className="text-xs text-muted-foreground/60 block">
                    field: {f.key}
                  </span>
                </div>
                <Input
                  value={labels[f.key] ?? ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.default}
                  className="h-9 col-span-1"
                />
                <div className="flex items-center gap-2">
                  {labels[f.key] && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ color: "#0b0854", borderColor: "#0b0854" }}
                    >
                      Custom
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground"
                    onClick={() => handleReset(f.key)}
                    disabled={!labels[f.key]}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Location Hierarchy Tab ----
function LocationHierarchyTab() {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTaluka, setSelectedTaluka] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newTaluka, setNewTaluka] = useState("");
  const [newWard, setNewWard] = useState("");
  const [newBooth, setNewBooth] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const districts = getOptionsByCategory("district");
  const allTalukas = getOptionsByCategory("taluka");
  const allWards = getOptionsByCategory("ward");
  const allBooths = getOptionsByCategory("booth");

  const talukas = selectedDistrict
    ? allTalukas.filter(
        (t) => !t.parentValue || t.parentValue === selectedDistrict,
      )
    : allTalukas.filter((t) => !t.parentValue);

  const wards = selectedTaluka
    ? allWards.filter((w) => !w.parentValue || w.parentValue === selectedTaluka)
    : allWards.filter((w) => !w.parentValue);

  const booths = selectedWard
    ? allBooths.filter((b) => !b.parentValue || b.parentValue === selectedWard)
    : allBooths.filter((b) => !b.parentValue);

  const doRefresh = () => setRefresh((r) => r + 1);

  // Suppress unused warning - refresh is used in the key
  void refresh;

  const handleAddDistrict = () => {
    if (!newDistrict.trim()) return;
    addOption("district", newDistrict.trim());
    setNewDistrict("");
    doRefresh();
    toast.success("District added.");
  };

  const handleAddTaluka = () => {
    if (!newTaluka.trim()) return;
    addOption(
      "taluka",
      newTaluka.trim(),
      "district",
      selectedDistrict || undefined,
    );
    setNewTaluka("");
    doRefresh();
    toast.success("Taluka added.");
  };

  const handleAddWard = () => {
    if (!newWard.trim()) return;
    addOption("ward", newWard.trim(), "taluka", selectedTaluka || undefined);
    setNewWard("");
    doRefresh();
    toast.success("Ward added.");
  };

  const handleAddBooth = () => {
    if (!newBooth.trim()) return;
    addOption("booth", newBooth.trim(), "ward", selectedWard || undefined);
    setNewBooth("");
    doRefresh();
    toast.success("Booth added.");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteOption(deleteTarget.id);
    setDeleteTarget(null);
    doRefresh();
    toast.success("Deleted.");
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Set up the District → Taluka → Ward → Booth hierarchy. When a voter
        selects a district, only relevant talukas are shown, etc.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* District */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle
              className="text-xs font-semibold flex items-center gap-1.5"
              style={{ color: "#0b0854" }}
            >
              <MapPin className="w-3.5 h-3.5" />
              Districts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="max-h-48 overflow-y-auto space-y-1">
              {districts.length === 0 && (
                <p className="text-xs text-muted-foreground">None yet</p>
              )}
              {districts.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm ${
                    selectedDistrict === d.label
                      ? "text-white"
                      : "hover:bg-muted"
                  }`}
                  style={
                    selectedDistrict === d.label
                      ? { background: "#0b0854" }
                      : {}
                  }
                  onClick={() => {
                    setSelectedDistrict(
                      d.label === selectedDistrict ? "" : d.label,
                    );
                    setSelectedTaluka("");
                    setSelectedWard("");
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setSelectedDistrict(d.label)
                  }
                >
                  <span className="truncate">{d.label}</span>
                  <div className="flex items-center gap-1">
                    {selectedDistrict === d.label ? (
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    ) : (
                      <ChevronRight className="w-3 h-3 opacity-40" />
                    )}
                    <button
                      type="button"
                      className="text-destructive hover:opacity-70 p-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ id: d.id, label: d.label });
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                placeholder="Add district…"
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleAddDistrict()}
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={handleAddDistrict}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Taluka */}
        <Card className={!selectedDistrict ? "opacity-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle
              className="text-xs font-semibold"
              style={{ color: "#0b0854" }}
            >
              Talukas
              {selectedDistrict && (
                <span className="font-normal text-muted-foreground ml-1">
                  in {selectedDistrict}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="max-h-48 overflow-y-auto space-y-1">
              {talukas.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedDistrict ? "None yet" : "Select a district"}
                </p>
              )}
              {talukas.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm ${
                    selectedTaluka === t.label ? "text-white" : "hover:bg-muted"
                  }`}
                  style={
                    selectedTaluka === t.label ? { background: "#0b0854" } : {}
                  }
                  onClick={() => {
                    setSelectedTaluka(
                      t.label === selectedTaluka ? "" : t.label,
                    );
                    setSelectedWard("");
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setSelectedTaluka(t.label)
                  }
                >
                  <span className="truncate">{t.label}</span>
                  <div className="flex items-center gap-1">
                    {selectedTaluka === t.label ? (
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    ) : (
                      <ChevronRight className="w-3 h-3 opacity-40" />
                    )}
                    <button
                      type="button"
                      className="text-destructive hover:opacity-70 p-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ id: t.id, label: t.label });
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                value={newTaluka}
                onChange={(e) => setNewTaluka(e.target.value)}
                placeholder="Add taluka…"
                className="h-8 text-xs"
                disabled={!selectedDistrict}
                onKeyDown={(e) => e.key === "Enter" && handleAddTaluka()}
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={handleAddTaluka}
                disabled={!selectedDistrict}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ward */}
        <Card className={!selectedTaluka ? "opacity-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle
              className="text-xs font-semibold"
              style={{ color: "#0b0854" }}
            >
              Wards
              {selectedTaluka && (
                <span className="font-normal text-muted-foreground ml-1">
                  in {selectedTaluka}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="max-h-48 overflow-y-auto space-y-1">
              {wards.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedTaluka ? "None yet" : "Select a taluka"}
                </p>
              )}
              {wards.map((w) => (
                <div
                  key={w.id}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm ${
                    selectedWard === w.label ? "text-white" : "hover:bg-muted"
                  }`}
                  style={
                    selectedWard === w.label ? { background: "#0b0854" } : {}
                  }
                  onClick={() =>
                    setSelectedWard(w.label === selectedWard ? "" : w.label)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && setSelectedWard(w.label)
                  }
                >
                  <span className="truncate">{w.label}</span>
                  <div className="flex items-center gap-1">
                    {selectedWard === w.label ? (
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    ) : (
                      <ChevronRight className="w-3 h-3 opacity-40" />
                    )}
                    <button
                      type="button"
                      className="text-destructive hover:opacity-70 p-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ id: w.id, label: w.label });
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                value={newWard}
                onChange={(e) => setNewWard(e.target.value)}
                placeholder="Add ward…"
                className="h-8 text-xs"
                disabled={!selectedTaluka}
                onKeyDown={(e) => e.key === "Enter" && handleAddWard()}
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={handleAddWard}
                disabled={!selectedTaluka}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Booth */}
        <Card className={!selectedWard ? "opacity-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle
              className="text-xs font-semibold"
              style={{ color: "#0b0854" }}
            >
              Booths
              {selectedWard && (
                <span className="font-normal text-muted-foreground ml-1">
                  in {selectedWard}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="max-h-48 overflow-y-auto space-y-1">
              {booths.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedWard ? "None yet" : "Select a ward"}
                </p>
              )}
              {booths.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted"
                >
                  <span className="truncate">{b.label}</span>
                  <button
                    type="button"
                    className="text-destructive hover:opacity-70 p-0.5"
                    onClick={() =>
                      setDeleteTarget({ id: b.id, label: b.label })
                    }
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                value={newBooth}
                onChange={(e) => setNewBooth(e.target.value)}
                placeholder="Add booth…"
                className="h-8 text-xs"
                disabled={!selectedWard}
                onKeyDown={(e) => e.key === "Enter" && handleAddBooth()}
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={handleAddBooth}
                disabled={!selectedWard}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.label}</strong>? Child items may
              become orphaned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Custom Fields Tab ----
function CustomFieldsTab() {
  const [fields, setFields] = useState(() => getAllCustomFields());
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<CustomFieldType>("text");
  const [newOptions, setNewOptions] = useState("");
  const [newParentFieldId, setNewParentFieldId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const needsOptions = newType === "dropdown" || newType === "multiselect";
  const dropdownFields = fields.filter(
    (f) => f.fieldType === "dropdown" || f.fieldType === "multiselect",
  );

  const handleAdd = () => {
    if (!newLabel.trim()) {
      toast.error("Field label is required.");
      return;
    }
    if (needsOptions && !newOptions.trim()) {
      toast.error("Please provide options (comma-separated).");
      return;
    }
    const opts = needsOptions
      ? newOptions
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean)
      : [];
    addCustomField(
      newLabel.trim(),
      newType,
      opts,
      newParentFieldId || undefined,
    );
    setFields(getAllCustomFields());
    setNewLabel("");
    setNewOptions("");
    setNewParentFieldId("");
    toast.success("Custom field added.");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCustomField(deleteTarget);
    setFields(getAllCustomFields());
    setDeleteTarget(null);
    toast.success("Custom field deleted.");
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Existing Custom Fields
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No custom fields defined yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold text-xs uppercase text-muted-foreground">
                      Label
                    </th>
                    <th className="text-left py-2 font-semibold text-xs uppercase text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left py-2 font-semibold text-xs uppercase text-muted-foreground">
                      Options
                    </th>
                    <th className="text-left py-2 font-semibold text-xs uppercase text-muted-foreground">
                      Parent
                    </th>
                    <th className="text-right py-2 font-semibold text-xs uppercase text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f) => {
                    const parentField = f.parentFieldId
                      ? fields.find((pf) => pf.fieldId === f.parentFieldId)
                      : null;
                    return (
                      <tr key={f.fieldId} className="border-b last:border-0">
                        <td className="py-2 font-medium">{f.label}</td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {FIELD_TYPE_LABELS[f.fieldType]}
                          </Badge>
                        </td>
                        <td className="py-2 text-muted-foreground text-xs">
                          {f.options.length > 0 ? f.options.join(", ") : "—"}
                        </td>
                        <td className="py-2 text-xs">
                          {parentField ? (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                color: "#0b0854",
                                borderColor: "#0b0854",
                              }}
                            >
                              {parentField.label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(f.fieldId)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Add New Field</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="cfLabel"
                className="text-sm font-medium mb-1.5 block"
              >
                Field Label
              </Label>
              <Input
                id="cfLabel"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Blood Group"
                className="h-9"
              />
            </div>
            <div>
              <Label
                htmlFor="cfType"
                className="text-sm font-medium mb-1.5 block"
              >
                Field Type
              </Label>
              <Select
                value={newType}
                onValueChange={(v) => setNewType(v as CustomFieldType)}
              >
                <SelectTrigger id="cfType" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(FIELD_TYPE_LABELS) as [
                      CustomFieldType,
                      string,
                    ][]
                  ).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {needsOptions && (
              <div className="md:col-span-2">
                <Label
                  htmlFor="cfOptions"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Options (comma-separated)
                </Label>
                <Input
                  id="cfOptions"
                  value={newOptions}
                  onChange={(e) => setNewOptions(e.target.value)}
                  placeholder="Option 1, Option 2, Option 3…"
                  className="h-9"
                />
              </div>
            )}
            {needsOptions && dropdownFields.length > 0 && (
              <div className="md:col-span-2">
                <Label className="text-sm font-medium mb-1.5 block">
                  Parent Field{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Select
                  value={newParentFieldId}
                  onValueChange={setNewParentFieldId}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="None (independent field)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (independent field)</SelectItem>
                    {dropdownFields.map((pf) => (
                      <SelectItem key={pf.fieldId} value={pf.fieldId}>
                        {pf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  When a parent field is selected, this field will only show
                  options that start with the selected parent value in the voter
                  form.
                </p>
              </div>
            )}
          </div>
          <Button className="mt-4 gap-2 h-9" size="sm" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            Add Custom Field
          </Button>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the custom field. Existing data for this field
              will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- User Management Tab ----
function UserManagementTab() {
  const { user: currentUser } = useAuth();
  const [users, setUsersState] = useState<User[]>(() => getUsers());
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("viewer");
  const [newMobile, setNewMobile] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const handleAddUser = () => {
    if (!newUsername.trim()) {
      toast.error("Username is required.");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Password is required.");
      return;
    }
    const all = getUsers();
    if (all.some((u) => u.username === newUsername.trim())) {
      toast.error("Username already exists.");
      return;
    }
    const newUser: User = {
      userId: `user_${Date.now()}`,
      username: newUsername.trim(),
      passwordHash: newPassword,
      role: newRole,
      mobile: newMobile.trim() || undefined,
      createdAt: Date.now(),
    };
    setUsers([...all, newUser]);
    setUsersState(getUsers());
    setNewUsername("");
    setNewPassword("");
    setNewMobile("");
    toast.success("User added.");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const all = getUsers().filter((u) => u.userId !== deleteTarget.userId);
    setUsers(all);
    setUsersState(all);
    setDeleteTarget(null);
    toast.success("User deleted.");
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.userId}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/50 border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{u.username}</div>
                    {u.mobile && (
                      <div className="text-xs text-muted-foreground font-mono-data">
                        {u.mobile}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[u.role]}`}
                  >
                    {ROLE_LABELS[u.role]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    disabled={u.userId === currentUser?.userId}
                    onClick={() => setDeleteTarget(u)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="newUsername"
                className="text-sm font-medium mb-1.5 block"
              >
                Username
              </Label>
              <Input
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label
                htmlFor="newPassword"
                className="text-sm font-medium mb-1.5 block"
              >
                Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label
                htmlFor="newRole"
                className="text-sm font-medium mb-1.5 block"
              >
                Role
              </Label>
              <Select
                value={newRole}
                onValueChange={(v) => setNewRole(v as UserRole)}
              >
                <SelectTrigger id="newRole" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superAdmin">Super Admin</SelectItem>
                  <SelectItem value="dataEntry">Data Entry</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="newMobile"
                className="text-sm font-medium mb-1.5 block"
              >
                Mobile (optional)
              </Label>
              <Input
                id="newMobile"
                type="tel"
                value={newMobile}
                onChange={(e) => setNewMobile(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <Button className="mt-4 gap-2 h-9" size="sm" onClick={handleAddUser}>
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Delete user <strong>{deleteTarget?.username}</strong>? They will
              no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Import Voters Tab ----
const STANDARD_COLUMNS = [
  { key: "voterId", label: "Voter ID", required: true },
  { key: "fullName", label: "Full Name", required: true },
  { key: "fatherHusbandName", label: "Father/Husband Name", required: false },
  {
    key: "gender",
    label: "Gender",
    required: false,
    hint: "Male / Female / Other",
  },
  {
    key: "dateOfBirth",
    label: "Date of Birth",
    required: false,
    hint: "YYYY-MM-DD",
  },
  { key: "mobile", label: "Mobile", required: false },
  { key: "alternateMobile", label: "Alternate Mobile", required: false },
  { key: "address", label: "Address", required: false },
  { key: "landmark", label: "Landmark", required: false },
  { key: "taluka", label: "Taluka", required: false },
  { key: "district", label: "District", required: false },
  { key: "boothNumber", label: "Booth Number", required: false },
  { key: "ward", label: "Ward", required: false },
  { key: "constituency", label: "Constituency", required: false },
  { key: "education", label: "Education", required: false },
  { key: "profession", label: "Profession", required: false },
  {
    key: "professionalCategory",
    label: "Professional Category",
    required: false,
  },
  { key: "organizationName", label: "Organization Name", required: false },
  { key: "maritalStatus", label: "Marital Status", required: false },
  { key: "caste", label: "Caste", required: false },
  { key: "subCaste", label: "Sub Caste", required: false },
  { key: "religion", label: "Religion", required: false },
  {
    key: "categoryLabel",
    label: "Category Label",
    required: false,
    hint: "Supporter / Neutral / Opponent",
  },
  {
    key: "influenceLevel",
    label: "Influence Level",
    required: false,
    hint: "1 to 5",
  },
  { key: "isVolunteer", label: "Volunteer", required: false, hint: "Yes / No" },
  { key: "notes", label: "Notes", required: false },
];

interface ImportResult {
  success: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

function ImportVotersTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = async () => {
    const XLSX = await loadXLSX();
    const customFields = getAllCustomFields();
    const headers = [
      ...STANDARD_COLUMNS.map((c) => c.label),
      ...customFields.map((f) => `Custom: ${f.label}`),
    ];

    // Build hint row
    const hints = [
      ...STANDARD_COLUMNS.map((c) =>
        c.required ? `(Required)${c.hint ? ` ${c.hint}` : ""}` : (c.hint ?? ""),
      ),
      ...customFields.map(() => ""),
    ];

    const sampleRow = [
      "VTR001",
      "Ramesh Kumar",
      "Suresh Kumar",
      "Male",
      "1985-06-15",
      "9876543210",
      "",
      "12 MG Road, Pune",
      "Near Bus Stand",
      "Haveli",
      "Pune",
      "Booth 4",
      "Ward 7",
      "Pune North",
      "Graduate",
      "Farmer",
      "Agriculture",
      "Kumar Farms",
      "Married",
      "Maratha",
      "96 Kuli",
      "Hindu",
      "Supporter",
      "4",
      "No",
      "Active member",
      ...customFields.map(() => ""),
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, hints, sampleRow]);

    // Style header row width
    const colWidths = headers.map((h) => ({ wch: Math.max(h.length + 4, 15) }));
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Voters");

    // Add an Instructions sheet
    const instrData = [
      ["SurveyMitra - Voter Import Template"],
      [""],
      ["Instructions:"],
      [
        "1. Fill voter data starting from Row 3 (Row 1 = headers, Row 2 = hints)",
      ],
      ["2. Voter ID and Full Name are required fields"],
      ["3. Date of Birth format: YYYY-MM-DD (e.g. 1985-06-15)"],
      ["4. Gender: Male / Female / Other"],
      ["5. Category Label: Supporter / Neutral / Opponent"],
      ["6. Influence Level: 1 to 5"],
      ["7. Volunteer: Yes / No"],
      ["8. Custom fields are added as extra columns at the end"],
      ["9. Duplicate Voter IDs will be skipped"],
      ["10. Save as .xlsx or .xls before uploading"],
    ];
    const wsInstr = XLSX.utils.aoa_to_sheet(instrData);
    wsInstr["!cols"] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

    XLSX.writeFile(wb, "SurveyMitra_VoterImport_Template.xlsx");
    toast.success("Template downloaded!");
  };

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Please upload an .xlsx or .xls file");
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    try {
      const XLSX = await loadXLSX();
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellDates: true,
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
        raw: false,
      }) as unknown[][];

      if (rawData.length < 3) {
        toast.error(
          "The file has no data rows. Please use the downloaded template.",
        );
        setIsProcessing(false);
        return;
      }

      const headerRow = (rawData[0] as unknown[]).map((h) =>
        h !== null && h !== undefined ? String(h) : "",
      );
      // Map header label → column index
      const colMap: Record<string, number> = {};
      headerRow.forEach((h, i) => {
        if (h) colMap[h.trim()] = i;
      });

      const customFields = getAllCustomFields();
      const existingVoters = getVoters();
      const existingVoterIds = new Set(existingVoters.map((v) => v.voterId));

      const result: ImportResult = { success: 0, skipped: 0, errors: [] };
      const newVoters: VoterRecord[] = [];

      // Data starts at row index 2 (0=headers, 1=hints, 2+=data)
      for (let i = 2; i < rawData.length; i++) {
        const row = rawData[i] as unknown[];
        if (!row || row.length === 0) continue;

        const getVal = (label: string): string => {
          const idx = colMap[label];
          if (idx === undefined) return "";
          const v = row[idx];
          return v !== undefined && v !== null ? String(v).trim() : "";
        };

        const voterId = getVal("Voter ID");
        const fullName = getVal("Full Name");

        if (!voterId || !fullName) {
          result.errors.push({
            row: i + 1,
            reason: "Missing required fields: Voter ID or Full Name",
          });
          continue;
        }

        if (existingVoterIds.has(voterId)) {
          result.skipped++;
          continue;
        }

        // Parse influence level
        const influenceRaw = getVal("Influence Level");
        const influenceLevel = influenceRaw
          ? Math.min(5, Math.max(1, Number.parseInt(influenceRaw) || 1))
          : undefined;

        // Parse volunteer
        const volunteerRaw = getVal("Volunteer").toLowerCase();
        const isVolunteer =
          volunteerRaw === "yes" ||
          volunteerRaw === "1" ||
          volunteerRaw === "true";

        // Custom field values
        const customValues = customFields
          .map((cf) => ({
            fieldId: cf.fieldId,
            value: getVal(`Custom: ${cf.label}`),
          }))
          .filter((cv) => cv.value !== "");

        const now = Date.now();
        const voter: VoterRecord = {
          id: `voter_${now}_${Math.random().toString(36).slice(2, 9)}_${i}`,
          voterId,
          fullName,
          fatherHusbandName: getVal("Father/Husband Name") || undefined,
          gender: getVal("Gender") || undefined,
          dateOfBirth: getVal("Date of Birth") || undefined,
          mobile: getVal("Mobile") || undefined,
          alternateMobile: getVal("Alternate Mobile") || undefined,
          address: getVal("Address") || undefined,
          landmark: getVal("Landmark") || undefined,
          taluka: getVal("Taluka") || undefined,
          district: getVal("District") || undefined,
          boothNumber: getVal("Booth Number") || undefined,
          ward: getVal("Ward") || undefined,
          constituency: getVal("Constituency") || undefined,
          education: getVal("Education") || undefined,
          profession: getVal("Profession") || undefined,
          professionalCategory: getVal("Professional Category") || undefined,
          organizationName: getVal("Organization Name") || undefined,
          maritalStatus: getVal("Marital Status") || undefined,
          caste: getVal("Caste") || undefined,
          subCaste: getVal("Sub Caste") || undefined,
          religion: getVal("Religion") || undefined,
          categoryLabel: getVal("Category Label") || undefined,
          influenceLevel,
          isVolunteer: volunteerRaw ? isVolunteer : undefined,
          notes: getVal("Notes") || undefined,
          customValues,
          createdAt: now,
          updatedAt: now,
          createdBy: "import",
        };

        newVoters.push(voter);
        existingVoterIds.add(voterId);
        result.success++;
      }

      if (newVoters.length > 0) {
        setVoters([...existingVoters, ...newVoters]);
      }

      setImportResult(result);
      if (result.success > 0) {
        toast.success(
          `Successfully imported ${result.success} voter${result.success !== 1 ? "s" : ""}`,
        );
      } else if (result.skipped > 0 && result.success === 0) {
        toast.info("All rows were skipped (duplicate Voter IDs)");
      }
    } catch {
      toast.error("Failed to read file. Please use the downloaded template.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-5">
      {/* Step 1: Download Template */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold"
              style={{ background: "#0b0854" }}
            >
              1
            </span>
            Download Excel Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Download the template file, fill in voter data starting from Row 3,
            and save as .xlsx before uploading. The template includes all
            standard fields plus any custom fields you have defined.
          </p>
          <Button
            className="gap-2 h-9"
            size="sm"
            onClick={downloadTemplate}
            style={{ background: "#0b0854" }}
          >
            <Download className="w-4 h-4" />
            Download Template (.xlsx)
          </Button>

          {/* Column list */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Template Columns
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STANDARD_COLUMNS.map((c) => (
                <span
                  key={c.key}
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    c.required
                      ? "bg-amber-100 text-amber-800"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.label}
                  {c.required ? " *" : ""}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Required fields
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Upload File */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold"
              style={{ background: "#0b0854" }}
            >
              2
            </span>
            Upload Filled Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) =>
              e.key === "Enter" && fileInputRef.current?.click()
            }
          >
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {isProcessing
                ? "Processing..."
                : "Drop your Excel file here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .xlsx and .xls files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </button>

          <div className="mt-3 flex justify-center">
            <Button
              className="gap-2 h-9"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? "Importing..." : "Select File"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Result */}
      {importResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Import Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-green-700">
                    {importResult.success}
                  </div>
                  <div className="text-xs text-green-600">Imported</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-amber-700">
                    {importResult.skipped}
                  </div>
                  <div className="text-xs text-amber-600">
                    Skipped (Duplicates)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-red-700">
                    {importResult.errors.length}
                  </div>
                  <div className="text-xs text-red-600">Errors</div>
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Error Details
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {importResult.errors.map((e) => (
                    <div
                      key={`row-${e.row}-${e.reason}`}
                      className="text-xs px-3 py-1.5 rounded bg-red-50 border border-red-100 text-red-700"
                    >
                      Row {e.row}: {e.reason}
                    </div>
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

// ---- Main Settings Page ----
export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1
          className="font-display text-2xl font-bold flex items-center gap-2"
          style={{ color: "#0b0854" }}
        >
          <Settings2 className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage dropdown options, form labels, location hierarchy, custom
          fields, user accounts, and import voter data
        </p>
      </div>

      <Tabs defaultValue="dropdowns">
        <TabsList className="mb-5 flex-wrap h-auto gap-1">
          <TabsTrigger value="dropdowns">Dropdown Manager</TabsTrigger>
          <TabsTrigger value="formLabels">Form Labels</TabsTrigger>
          <TabsTrigger value="locationHierarchy">
            Location Hierarchy
          </TabsTrigger>
          <TabsTrigger value="customFields">Custom Fields</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="import" className="gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Import Voters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dropdowns">
          <DropdownManagerTab />
        </TabsContent>
        <TabsContent value="formLabels">
          <FormLabelsTab />
        </TabsContent>
        <TabsContent value="locationHierarchy">
          <LocationHierarchyTab />
        </TabsContent>
        <TabsContent value="customFields">
          <CustomFieldsTab />
        </TabsContent>
        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>
        <TabsContent value="import">
          <ImportVotersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
