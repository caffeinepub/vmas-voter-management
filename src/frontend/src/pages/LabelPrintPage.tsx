import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Save } from "lucide-react";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { getLabelConfig, setLabelConfig } from "../store/storage";
import type { VoterRecord } from "../store/types";
import { filterVoters, getAllVoters } from "../store/voters";

// All standard fields that can appear on a label
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

interface LabelPreviewProps {
  voter: VoterRecord;
  fields: string[];
}

function LabelPreview({ voter, fields }: LabelPreviewProps) {
  const nameField = fields.includes("fullName");
  const otherFields = fields.filter((f) => f !== "fullName");

  return (
    <div
      className="border border-border rounded-lg p-3 bg-white text-gray-900"
      style={{ minHeight: "120px", fontSize: "11px" }}
    >
      {nameField && (
        <div className="font-bold text-sm border-b border-gray-200 pb-1 mb-1.5">
          {voter.fullName}
        </div>
      )}
      <div className="space-y-0.5">
        {otherFields.map((fk) => {
          const def = AVAILABLE_FIELDS.find((f) => f.key === fk);
          const val = getFieldValue(voter, fk);
          if (!val || !def) return null;
          return (
            <div key={fk} className="flex gap-1.5">
              <span className="font-semibold text-gray-500 min-w-[80px]">
                {def.label}:
              </span>
              <span>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LabelPrintPage() {
  const allVoters = useMemo(() => getAllVoters(), []);
  const [config, setConfig] = useState(() => getLabelConfig());
  const [voterScope, setVoterScope] = useState<"all" | "filtered" | "sample">(
    "all",
  );
  const [filterCategory, setFilterCategory] = useState("");

  const selectedVoters = useMemo<VoterRecord[]>(() => {
    if (voterScope === "sample") return allVoters.slice(0, 10);
    if (voterScope === "filtered" && filterCategory) {
      return filterVoters({
        search: "",
        boothNumber: "",
        ward: "",
        education: "",
        profession: "",
        categoryLabel: filterCategory,
        gender: "",
        birthdayMonth: "",
        caste: "",
        organizationName: "",
      });
    }
    return allVoters;
  }, [allVoters, voterScope, filterCategory]);

  const toggleField = (key: string) => {
    setConfig((prev) => ({
      selectedFields: prev.selectedFields.includes(key)
        ? prev.selectedFields.filter((f) => f !== key)
        : [...prev.selectedFields, key],
    }));
  };

  const handleSaveConfig = () => {
    setLabelConfig(config);
    toast.success("Label configuration saved.");
  };

  const handlePrint = () => {
    if (config.selectedFields.length === 0) {
      toast.error("Please select at least one field to print.");
      return;
    }
    if (selectedVoters.length === 0) {
      toast.error("No voters to print.");
      return;
    }

    // Build print HTML

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
            ${selectedVoters.map((v) => labelHTML(v)).join("")}
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
    toast.success(`Printing ${selectedVoters.length} voter labels.`);
  };

  const sampleVoter: VoterRecord = {
    id: "preview",
    voterId: "VOT-001",
    fullName: "Ramesh Kumar",
    fatherHusbandName: "Suresh Kumar",
    gender: "Male",
    mobile: "9876543210",
    ward: "Ward A",
    boothNumber: "Booth 1",
    constituency: "North Constituency",
    categoryLabel: "Supporter",
    influenceLevel: 4,
    caste: "General",
    religion: "Hindu",
    address: "123 Main Street, City",
    education: "Graduate",
    profession: "Business",
    customValues: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: "admin",
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="font-display text-2xl font-bold flex items-center gap-2"
            style={{ color: "#0b0854" }}
          >
            <Printer className="w-6 h-6" />
            Label Printing
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate printable voter labels
          </p>
        </div>
        <Button className="gap-2" onClick={handlePrint}>
          <Printer className="w-4 h-4" />
          Print Labels ({selectedVoters.length})
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Field Selector */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Select Fields for Labels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {AVAILABLE_FIELDS.map((f) => (
                  <div
                    key={f.key as string}
                    className="flex items-center gap-3"
                  >
                    <Checkbox
                      id={`field-${f.key as string}`}
                      checked={config.selectedFields.includes(f.key as string)}
                      onCheckedChange={() => toggleField(f.key as string)}
                    />
                    <Label
                      htmlFor={`field-${f.key as string}`}
                      className="text-sm cursor-pointer"
                    >
                      {f.label}
                    </Label>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={handleSaveConfig}
              >
                <Save className="w-3.5 h-3.5" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Voter Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="voterScope"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Print Scope
                  </Label>
                  <Select
                    value={voterScope}
                    onValueChange={(v) => setVoterScope(v as typeof voterScope)}
                  >
                    <SelectTrigger id="voterScope" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Voters ({allVoters.length})
                      </SelectItem>
                      <SelectItem value="filtered">
                        Filter by Category
                      </SelectItem>
                      <SelectItem value="sample">Sample (first 10)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {voterScope === "filtered" && (
                  <div>
                    <Label
                      htmlFor="printCategory"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      Category
                    </Label>
                    <Select
                      value={filterCategory}
                      onValueChange={setFilterCategory}
                    >
                      <SelectTrigger id="printCategory" className="h-9">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Supporter">Supporter</SelectItem>
                        <SelectItem value="Neutral">Neutral</SelectItem>
                        <SelectItem value="Opponent">Opponent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {selectedVoters.length} voter
                  {selectedVoters.length !== 1 ? "s" : ""} selected for printing
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Label Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Preview of a sample label with selected fields:
              </p>
              {config.selectedFields.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                  Select fields on the left to see a preview
                </div>
              ) : (
                <div className="max-w-sm">
                  <LabelPreview
                    voter={sampleVoter}
                    fields={config.selectedFields}
                  />
                </div>
              )}

              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <div className="font-medium mb-1">Print Format:</div>
                <ul className="space-y-0.5 list-disc ml-4">
                  <li>A4 paper, 2 labels per row</li>
                  <li>Up to 10 labels per page</li>
                  <li>Opens browser print dialog</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
