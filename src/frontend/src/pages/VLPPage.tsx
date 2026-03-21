import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  Edit2,
  FileText,
  MapPin,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  getElectionResults,
  getFieldNotes,
  getVoters,
  setElectionResults,
  setFieldNotes,
} from "../store/storage";
import type { ElectionResult, FieldNote } from "../store/types";

const PARTY_COLORS: Record<string, string> = {
  INC: "#1565c0",
  BJP: "#e65100",
  NCP: "#6a1b9a",
  SS: "#f9a825",
  Others: "#607d8b",
};

const PIE_COLORS = [
  "#0b0854",
  "#1565c0",
  "#e65100",
  "#388e3c",
  "#6a1b9a",
  "#f57f17",
  "#00838f",
  "#c62828",
];

const ELECTION_TYPES = [
  "General Election",
  "State Election",
  "Local Body",
  "By-Election",
];

const PARTIES = ["INC", "BJP", "NCP", "SS", "Others"];

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ---- Election Result Form ----
interface ERFormState {
  year: string;
  electionType: string;
  candidateName: string;
  party: string;
  votesReceived: string;
  village: string;
  booth: string;
  ward: string;
}

const emptyERForm = (): ERFormState => ({
  year: "",
  electionType: "",
  candidateName: "",
  party: "",
  votesReceived: "",
  village: "",
  booth: "",
  ward: "",
});

// ---- Field Note Form ----
interface NoteFormState {
  text: string;
  village: string;
  booth: string;
  ward: string;
  imageUrl: string;
  imageName: string;
  pdfUrl: string;
  pdfName: string;
}

const emptyNoteForm = (): NoteFormState => ({
  text: "",
  village: "",
  booth: "",
  ward: "",
  imageUrl: "",
  imageName: "",
  pdfUrl: "",
  pdfName: "",
});

export default function VLPPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "superAdmin";

  // ---- Filters ----
  const [selTaluka, setSelTaluka] = useState("");
  const [selVillage, setSelVillage] = useState("");
  const [selBooth, setSelBooth] = useState("");
  const [selWard, setSelWard] = useState("");

  // Reload triggers
  const [erVersion, setErVersion] = useState(0);
  const [noteVersion, setNoteVersion] = useState(0);

  // ---- Raw data ----
  // biome-ignore lint/correctness/useExhaustiveDependencies: version counters intentionally trigger refresh
  const allVoters = useMemo(() => getVoters(), [erVersion, noteVersion]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: version counter intentionally triggers refresh
  const allElectionResults = useMemo(() => getElectionResults(), [erVersion]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: version counter intentionally triggers refresh
  const allFieldNotes = useMemo(() => getFieldNotes(), [noteVersion]);

  // ---- Filter options derived from voters ----
  const talukaOptions = useMemo(() => {
    const set = new Set<string>();
    for (const v of allVoters) if (v.taluka) set.add(v.taluka);
    return Array.from(set).sort();
  }, [allVoters]);

  const boothOptions = useMemo(() => {
    if (!selTaluka) return [];
    const set = new Set<string>();
    for (const v of allVoters)
      if (v.taluka === selTaluka && v.boothNumber) set.add(v.boothNumber);
    return Array.from(set).sort();
  }, [allVoters, selTaluka]);

  const villageOptions = useMemo(() => {
    if (!selTaluka) return [];
    const set = new Set<string>();
    for (const r of allElectionResults) {
      if (r.taluka === selTaluka && r.village) set.add(r.village);
    }
    for (const n of allFieldNotes) {
      if (n.taluka === selTaluka && n.village) set.add(n.village);
    }
    return Array.from(set).sort();
  }, [allElectionResults, allFieldNotes, selTaluka]);

  const wardOptions = useMemo(() => {
    if (!selTaluka) return [];
    const set = new Set<string>();
    for (const v of allVoters) {
      if (v.taluka === selTaluka && v.ward) {
        if (!selBooth || v.boothNumber === selBooth) set.add(v.ward);
      }
    }
    return Array.from(set).sort();
  }, [allVoters, selTaluka, selBooth]);

  // ---- Filtered voters ----
  const filteredVoters = useMemo(() => {
    if (!selTaluka) return [];
    return allVoters.filter((v) => {
      if (v.taluka !== selTaluka) return false;
      if (selBooth && v.boothNumber !== selBooth) return false;
      if (selWard && v.ward !== selWard) return false;
      return true;
    });
  }, [allVoters, selTaluka, selBooth, selWard]);

  // ---- Filtered election results ----
  const filteredER = useMemo(() => {
    if (!selTaluka) return [];
    return allElectionResults.filter((r) => {
      if (r.taluka !== selTaluka) return false;
      if (selVillage && r.village && r.village !== selVillage) return false;
      if (selBooth && r.booth && r.booth !== selBooth) return false;
      if (selWard && r.ward && r.ward !== selWard) return false;
      return true;
    });
  }, [allElectionResults, selTaluka, selVillage, selBooth, selWard]);

  // ---- Filtered notes ----
  const filteredNotes = useMemo(() => {
    if (!selTaluka) return [];
    return allFieldNotes.filter((n) => {
      if (n.taluka !== selTaluka) return false;
      if (selVillage && n.village && n.village !== selVillage) return false;
      if (selBooth && n.booth && n.booth !== selBooth) return false;
      if (selWard && n.ward && n.ward !== selWard) return false;
      return true;
    });
  }, [allFieldNotes, selTaluka, selVillage, selBooth, selWard]);

  // ---- Caste Analysis ----
  const casteData = useMemo(() => {
    const map: Record<
      string,
      {
        total: number;
        male: number;
        female: number;
        supporter: number;
        neutral: number;
        opponent: number;
      }
    > = {};
    for (const v of filteredVoters) {
      const caste = v.caste || "Unknown";
      if (!map[caste])
        map[caste] = {
          total: 0,
          male: 0,
          female: 0,
          supporter: 0,
          neutral: 0,
          opponent: 0,
        };
      map[caste].total++;
      if (v.gender === "Male") map[caste].male++;
      else if (v.gender === "Female") map[caste].female++;
      if (v.categoryLabel === "Supporter") map[caste].supporter++;
      else if (v.categoryLabel === "Neutral") map[caste].neutral++;
      else if (v.categoryLabel === "Opponent") map[caste].opponent++;
    }
    return Object.entries(map)
      .map(([caste, d]) => ({ caste, ...d }))
      .sort((a, b) => b.total - a.total);
  }, [filteredVoters]);

  // ---- Sub Caste Analysis ----
  const subcasteData = useMemo(() => {
    const map: Record<
      string,
      {
        total: number;
        caste: string;
        supporter: number;
        neutral: number;
        opponent: number;
      }
    > = {};
    for (const v of filteredVoters) {
      if (!v.subCaste) continue;
      const key = v.subCaste;
      if (!map[key])
        map[key] = {
          total: 0,
          caste: v.caste || "",
          supporter: 0,
          neutral: 0,
          opponent: 0,
        };
      map[key].total++;
      if (v.categoryLabel === "Supporter") map[key].supporter++;
      else if (v.categoryLabel === "Neutral") map[key].neutral++;
      else if (v.categoryLabel === "Opponent") map[key].opponent++;
    }
    return Object.entries(map)
      .map(([subcaste, data]) => ({ subcaste, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [filteredVoters]);

  // ---- ER Dialog ----
  const [erDialogOpen, setErDialogOpen] = useState(false);
  const [editingER, setEditingER] = useState<ElectionResult | null>(null);
  const [erForm, setErForm] = useState<ERFormState>(emptyERForm());
  const [erViewBy, setErViewBy] = useState<"year" | "party" | "candidate">(
    "year",
  );
  const [erSort, setErSort] = useState<{ col: string; dir: "asc" | "desc" }>({
    col: "year",
    dir: "desc",
  });

  const openAddER = () => {
    setEditingER(null);
    setErForm({
      ...emptyERForm(),
      village: selVillage,
      booth: selBooth,
      ward: selWard,
    });
    setErDialogOpen(true);
  };

  const openEditER = (r: ElectionResult) => {
    setEditingER(r);
    setErForm({
      year: r.year,
      electionType: r.electionType,
      candidateName: r.candidateName,
      party: r.party,
      votesReceived: String(r.votesReceived),
      village: r.village || "",
      booth: r.booth || "",
      ward: r.ward || "",
    });
    setErDialogOpen(true);
  };

  const saveER = () => {
    if (
      !erForm.year ||
      !erForm.candidateName ||
      !erForm.party ||
      !erForm.electionType ||
      !erForm.votesReceived
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    const all = getElectionResults();
    if (editingER) {
      const updated = all.map((r) =>
        r.id === editingER.id
          ? { ...r, ...erForm, votesReceived: Number(erForm.votesReceived) }
          : r,
      );
      setElectionResults(updated);
      toast.success("Election result updated");
    } else {
      const newResult: ElectionResult = {
        id: generateId(),
        taluka: selTaluka,
        year: erForm.year,
        electionType: erForm.electionType,
        candidateName: erForm.candidateName,
        party: erForm.party,
        votesReceived: Number(erForm.votesReceived),
        village: erForm.village || undefined,
        booth: erForm.booth || undefined,
        ward: erForm.ward || undefined,
        createdAt: Date.now(),
        createdBy: user?.userId || "",
      };
      setElectionResults([...all, newResult]);
      toast.success("Election result added");
    }
    setErDialogOpen(false);
    setErVersion((v) => v + 1);
  };

  const deleteER = (id: string) => {
    if (!confirm("Delete this election result?")) return;
    setElectionResults(getElectionResults().filter((r) => r.id !== id));
    setErVersion((v) => v + 1);
    toast.success("Deleted");
  };

  // Sorted ER
  const sortedER = useMemo(() => {
    const sorted = [...filteredER];
    sorted.sort((a, b) => {
      const av = (a as any)[erSort.col];
      const bv = (b as any)[erSort.col];
      if (typeof av === "number")
        return erSort.dir === "asc" ? av - bv : bv - av;
      return erSort.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return sorted;
  }, [filteredER, erSort]);

  const toggleSort = (col: string) => {
    setErSort((prev) => ({
      col,
      dir: prev.col === col && prev.dir === "asc" ? "desc" : "asc",
    }));
  };
  // ---- Election Results Derived Data ----
  const latestYear = useMemo(() => {
    if (filteredER.length === 0) return null;
    return filteredER.reduce(
      (max, r) => (r.year > max ? r.year : max),
      filteredER[0].year,
    );
  }, [filteredER]);

  const latestYearResults = useMemo(() => {
    if (!latestYear) return [];
    return filteredER
      .filter((r) => r.year === latestYear)
      .sort((a, b) => b.votesReceived - a.votesReceived);
  }, [filteredER, latestYear]);

  const electionSummary = useMemo(() => {
    if (latestYearResults.length === 0) return null;
    const total = latestYearResults.reduce((s, r) => s + r.votesReceived, 0);
    const winner = latestYearResults[0];
    const runnerUp = latestYearResults[1] || null;
    const margin = runnerUp
      ? winner.votesReceived - runnerUp.votesReceived
      : winner.votesReceived;
    const marginPct = total > 0 ? ((margin / total) * 100).toFixed(1) : "0";
    const isClose = Number.parseFloat(marginPct) < 5;
    return { winner, runnerUp, margin, marginPct, isClose, total, latestYear };
  }, [latestYearResults, latestYear]);

  const top2Parties = useMemo(() => {
    if (filteredER.length === 0) return [];
    const partyVotes: Record<string, number> = {};
    for (const r of filteredER) {
      partyVotes[r.party] = (partyVotes[r.party] || 0) + r.votesReceived;
    }
    return Object.entries(partyVotes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([p]) => p);
  }, [filteredER]);

  const trendData = useMemo(() => {
    if (top2Parties.length === 0) return [];
    const years = Array.from(new Set(filteredER.map((r) => r.year))).sort();
    return years.map((year) => {
      const yearResults = filteredER.filter((r) => r.year === year);
      const entry: Record<string, string | number> = { year };
      for (const p of top2Parties) {
        const found = yearResults.find((r) => r.party === p);
        entry[p] = found ? found.votesReceived : 0;
      }
      return entry;
    });
  }, [filteredER, top2Parties]);

  const quickInsight = useMemo(() => {
    if (!electionSummary) return null;
    const { winner, marginPct, isClose } = electionSummary;
    const years = Array.from(new Set(filteredER.map((r) => r.year))).sort();
    const partyWins = filteredER.filter((r) => {
      const yearMax = filteredER
        .filter((x) => x.year === r.year)
        .reduce((m, x) => (x.votesReceived > m ? x.votesReceived : m), 0);
      return r.party === winner.party && r.votesReceived === yearMax;
    }).length;
    const classification = isClose
      ? "SWING"
      : Number.parseFloat(marginPct) > 10
        ? "STRONG"
        : "MODERATE";
    const classColor =
      classification === "STRONG"
        ? "#16a34a"
        : classification === "SWING"
          ? "#ca8a04"
          : "#1565c0";
    return {
      text: `${winner.party} leads in ${latestYear} with ${marginPct}% margin. ${partyWins > 1 ? `Won ${partyWins} of ${years.length} tracked elections.` : ""} This area is classified as`,
      classification,
      classColor,
    };
  }, [electionSummary, filteredER, latestYear]);

  // ---- Notes Dialog ----
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<FieldNote | null>(null);
  const [noteForm, setNoteForm] = useState<NoteFormState>(emptyNoteForm());

  const openAddNote = () => {
    setEditingNote(null);
    setNoteForm({
      ...emptyNoteForm(),
      village: selVillage,
      booth: selBooth,
      ward: selWard,
    });
    setNoteDialogOpen(true);
  };

  const openEditNote = (n: FieldNote) => {
    setEditingNote(n);
    setNoteForm({
      text: n.text,
      village: n.village || "",
      booth: n.booth || "",
      ward: n.ward || "",
      imageUrl: n.imageUrl || "",
      imageName: n.imageName || "",
      pdfUrl: n.pdfUrl || "",
      pdfName: n.pdfName || "",
    });
    setNoteDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error("Image must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNoteForm((prev) => ({
        ...prev,
        imageUrl: ev.target?.result as string,
        imageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("PDF must be under 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNoteForm((prev) => ({
        ...prev,
        pdfUrl: ev.target?.result as string,
        pdfName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveNote = () => {
    if (!noteForm.text.trim()) {
      toast.error("Note text is required");
      return;
    }
    const all = getFieldNotes();
    if (editingNote) {
      const updated = all.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              text: noteForm.text,
              village: noteForm.village || undefined,
              booth: noteForm.booth || undefined,
              ward: noteForm.ward || undefined,
              imageUrl: noteForm.imageUrl || undefined,
              imageName: noteForm.imageName || undefined,
              pdfUrl: noteForm.pdfUrl || undefined,
              pdfName: noteForm.pdfName || undefined,
              updatedAt: Date.now(),
            }
          : n,
      );
      setFieldNotes(updated);
      toast.success("Note updated");
    } else {
      const newNote: FieldNote = {
        id: generateId(),
        text: noteForm.text,
        taluka: selTaluka,
        village: noteForm.village || undefined,
        booth: noteForm.booth || undefined,
        ward: noteForm.ward || undefined,
        imageUrl: noteForm.imageUrl || undefined,
        imageName: noteForm.imageName || undefined,
        pdfUrl: noteForm.pdfUrl || undefined,
        pdfName: noteForm.pdfName || undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: user?.userId || "",
        createdByName: user?.username || "",
      };
      setFieldNotes([...all, newNote]);
      toast.success("Note added");
    }
    setNoteDialogOpen(false);
    setNoteVersion((v) => v + 1);
  };

  const deleteNote = (id: string) => {
    if (!confirm("Delete this note?")) return;
    setFieldNotes(getFieldNotes().filter((n) => n.id !== id));
    setNoteVersion((v) => v + 1);
    toast.success("Deleted");
  };

  const canEditNote = (n: FieldNote) =>
    isSuperAdmin || n.createdBy === user?.userId;

  // ---- Notes grouped ----
  const talukaLevelNotes = useMemo(
    () => filteredNotes.filter((n) => !n.village && !n.booth && !n.ward),
    [filteredNotes],
  );

  const groupedNotes = useMemo(() => {
    const sub = filteredNotes.filter((n) => n.village || n.booth || n.ward);
    const map: Record<string, Record<string, FieldNote[]>> = {};
    for (const n of sub) {
      const vk = n.village || "(No Village)";
      const bk = n.booth || "(No Booth)";
      if (!map[vk]) map[vk] = {};
      if (!map[vk][bk]) map[vk][bk] = [];
      map[vk][bk].push(n);
    }
    return map;
  }, [filteredNotes]);

  // ---- Export Notes CSV ----
  const exportNotesCSV = () => {
    const headers = [
      "Note Text",
      "Taluka",
      "Village",
      "Booth",
      "Ward",
      "Date",
      "Has Image",
      "Has PDF",
      "PDF Name",
    ];
    const rows = filteredNotes.map((n) => [
      `"${n.text.replace(/"/g, '""')}"`,
      n.taluka,
      n.village || "",
      n.booth || "",
      n.ward || "",
      formatDate(n.createdAt),
      n.imageUrl ? "Yes" : "No",
      n.pdfUrl ? "Yes" : "No",
      n.pdfName || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vlp_notes_${selTaluka}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Notes exported to CSV");
  };

  // ---- AI Insights ----
  const aiInsights = useMemo(() => {
    if (!selTaluka || filteredER.length === 0) return null;

    // Most recent year
    const years = [...new Set(filteredER.map((r) => r.year))].sort().reverse();
    const latestYear = years[0];
    const latestResults = filteredER.filter((r) => r.year === latestYear);

    const totalVotes = latestResults.reduce((s, r) => s + r.votesReceived, 0);
    if (totalVotes === 0) return null;

    // Party vote shares
    const partyVotes: Record<string, number> = {};
    for (const r of latestResults) {
      partyVotes[r.party] = (partyVotes[r.party] || 0) + r.votesReceived;
    }

    // Voter ideology per party alignment
    const supporterCount = filteredVoters.filter(
      (v) => v.categoryLabel === "Supporter",
    ).length;
    const totalFilteredVoters = filteredVoters.length;
    const supporterRatio =
      totalFilteredVoters > 0 ? supporterCount / totalFilteredVoters : 0;

    const leadParty = Object.entries(partyVotes).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    const partyStats = Object.entries(partyVotes)
      .map(([party, votes]) => {
        const voteShare = (votes / totalVotes) * 100;
        // Ideology bonus: if this is the most supported party, add bonus
        const ideologyBonus =
          party === leadParty ? supporterRatio * 15 : -supporterRatio * 5;
        const winProb = Math.min(
          99,
          Math.max(
            1,
            voteShare * 0.7 +
              ideologyBonus * 0.3 +
              (party === leadParty ? 5 : 0),
          ),
        );
        return { party, votes, voteShare, winProb };
      })
      .sort((a, b) => b.winProb - a.winProb);

    const topShare = partyStats[0]?.voteShare || 0;
    const secondShare = partyStats[1]?.voteShare || 0;
    let areaClass: "Strong" | "Swing" | "Weak";
    if (topShare > 55) areaClass = "Strong";
    else if (topShare - secondShare < 15) areaClass = "Swing";
    else areaClass = "Weak";

    const topCastes = casteData.slice(0, 3);
    const topCastesWithIdeology = topCastes.map((c) => {
      const dominant =
        c.supporter >= c.neutral && c.supporter >= c.opponent
          ? "Supporter"
          : c.opponent >= c.neutral
            ? "Opponent"
            : "Neutral";
      return { ...c, dominant };
    });

    // Target suggestion
    const swingCaste = topCastesWithIdeology.find(
      (c) => c.dominant === "Neutral",
    );
    const targetCaste = swingCaste || topCastesWithIdeology[0];
    const areaLabel = selWard || selBooth || selVillage || selTaluka;
    const suggestion = targetCaste
      ? `Focus on ${targetCaste.caste} community in ${areaLabel}. They have ${targetCaste.total} voters with ${Math.round((targetCaste.neutral / Math.max(1, targetCaste.total)) * 100)}% showing neutral stance — strong potential to convert.`
      : `Consolidate support in ${areaLabel} by engaging top communities through local outreach programs.`;

    return {
      partyStats,
      areaClass,
      topCastesWithIdeology,
      suggestion,
      latestYear,
      leadParty,
    };
  }, [
    filteredER,
    filteredVoters,
    casteData,
    selTaluka,
    selVillage,
    selBooth,
    selWard,
  ]);

  // ---- Mock Data ----
  const generateMockData = () => {
    if (!selTaluka) {
      toast.error("Select a Taluka first");
      return;
    }
    const years = ["2020", "2021", "2022", "2023", "2024"];
    const candidates = [
      ["Rajesh Patil", "INC"],
      ["Suresh Desai", "BJP"],
      ["Mahesh More", "NCP"],
      ["Ganesh Shinde", "SS"],
    ];
    const newResults: ElectionResult[] = [];
    for (const year of years) {
      const count = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const [name, party] = candidates[i % candidates.length];
        newResults.push({
          id: generateId(),
          year,
          electionType: year <= "2021" ? "State Election" : "Local Body",
          candidateName: `${name} (${year})`,
          party,
          votesReceived: 500 + Math.floor(Math.random() * 4000),
          taluka: selTaluka,
          booth: selBooth || undefined,
          ward: selWard || undefined,
          createdAt: Date.now(),
          createdBy: user?.userId || "",
        });
      }
    }
    const noteTexts = [
      "Booth 5 has strong support for BJP based on ground survey.",
      "Village dominated by OBC voters, key demographic to target.",
      "Local leader influence is very high in this area.",
      "Minority community showing swing tendency — needs engagement.",
      "Youth voter turnout expected to be high in upcoming election.",
    ];
    const newNotes: FieldNote[] = noteTexts.map((text, i) => ({
      id: generateId(),
      text,
      taluka: selTaluka,
      booth: selBooth || `Booth ${i + 1}`,
      ward: selWard || undefined,
      createdAt: Date.now() - i * 86400000,
      updatedAt: Date.now(),
      createdBy: user?.userId || "",
      createdByName: user?.username || "admin",
    }));
    setElectionResults([...getElectionResults(), ...newResults]);
    setFieldNotes([...getFieldNotes(), ...newNotes]);
    setErVersion((v) => v + 1);
    setNoteVersion((v) => v + 1);
    toast.success(
      `Generated ${newResults.length} election results and ${newNotes.length} field notes`,
    );
  };

  // ---- Print Report ----
  const printReport = () => {
    // Build election results grouped by year for the bar chart
    const allYears = Array.from(new Set(sortedER.map((r) => r.year))).sort();
    const allParties = Array.from(new Set(sortedER.map((r) => r.party)));
    const partyColorMap: Record<string, string> = {
      BJP: "#FF6B35",
      INC: "#19A0E3",
      NCP: "#006B3C",
      SS: "#E8A020",
      Others: "#9B59B6",
    };
    const getPartyColor = (party: string) => partyColorMap[party] || "#607d8b";

    // Latest year results sorted by votes desc
    const latestElecYear = allYears[allYears.length - 1] || "";
    const latestElecResults = sortedER
      .filter((r) => r.year === latestElecYear)
      .sort((a, b) => b.votesReceived - a.votesReceived);
    const _totalVotesLatest = latestElecResults.reduce(
      (s, r) => s + r.votesReceived,
      0,
    );

    // Build bar chart SVG for latest election
    const maxVotes = Math.max(
      ...latestElecResults.map((r) => r.votesReceived),
      1,
    );
    const chartWidth = 600;
    const chartHeight = 200;
    const barAreaWidth = chartWidth - 120;
    const barH = Math.min(
      28,
      Math.floor((chartHeight - 20) / Math.max(1, latestElecResults.length)) -
        6,
    );
    const barChartSvg =
      latestElecResults.length > 0
        ? `
<svg width="${chartWidth}" height="${Math.max(chartHeight, latestElecResults.length * (barH + 8) + 30)}" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="16" font-size="11" fill="#0b0854" font-weight="bold">${latestElecYear} — Votes by Candidate</text>
  ${latestElecResults
    .map((r, i) => {
      const barW = Math.max(
        4,
        Math.round((r.votesReceived / maxVotes) * barAreaWidth),
      );
      const y = 28 + i * (barH + 8);
      const label =
        r.candidateName.length > 14
          ? `${r.candidateName.slice(0, 14)}…`
          : r.candidateName;
      const color =
        i === 0 ? "#16a34a" : i === 1 ? "#dc2626" : getPartyColor(r.party);
      return `
  <text x="0" y="${y + barH - 4}" font-size="9" fill="#333" text-anchor="start">${label}</text>
  <rect x="115" y="${y}" width="${barW}" height="${barH}" fill="${color}" rx="3"/>
  <text x="${115 + barW + 4}" y="${y + barH - 4}" font-size="9" fill="#555">${r.votesReceived.toLocaleString()}</text>`;
    })
    .join("")}
</svg>`
        : "";

    // Build trend chart SVG (top 2 parties across years)
    const top2 = allParties
      .map((p) => ({
        party: p,
        total: sortedER
          .filter((r) => r.party === p)
          .reduce((s, r) => s + r.votesReceived, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 2)
      .map((x) => x.party);
    const trendSvgWidth = 560;
    const trendSvgHeight = 160;
    const trendPadL = 50;
    const trendPadB = 30;
    const trendPadT = 20;
    const trendPadR = 20;
    const plotW = trendSvgWidth - trendPadL - trendPadR;
    const plotH = trendSvgHeight - trendPadT - trendPadB;
    const trendPoints = allYears.map((yr) => {
      const entry: Record<string, number> = {};
      for (const p of top2) {
        const r = sortedER
          .filter((x) => x.year === yr && x.party === p)
          .reduce((s, x) => s + x.votesReceived, 0);
        entry[p] = r;
      }
      return { year: yr, ...entry };
    });
    const maxTrend = Math.max(
      ...trendPoints.flatMap((d) => top2.map((p) => d[p] || 0)),
      1,
    );
    const getX = (i: number) =>
      trendPadL +
      (allYears.length > 1 ? (i / (allYears.length - 1)) * plotW : plotW / 2);
    const getY = (v: number) => trendPadT + plotH - (v / maxTrend) * plotH;
    const trendChartSvg =
      trendPoints.length > 1 && top2.length >= 1
        ? `
<svg width="${trendSvgWidth}" height="${trendSvgHeight}" xmlns="http://www.w3.org/2000/svg">
  <text x="${trendPadL}" y="14" font-size="11" fill="#0b0854" font-weight="bold">Vote Trend — ${top2.join(" vs ")}</text>
  <line x1="${trendPadL}" y1="${trendPadT}" x2="${trendPadL}" y2="${trendPadT + plotH}" stroke="#ccc" stroke-width="1"/>
  <line x1="${trendPadL}" y1="${trendPadT + plotH}" x2="${trendPadL + plotW}" y2="${trendPadT + plotH}" stroke="#ccc" stroke-width="1"/>
  ${allYears.map((yr, i) => `<text x="${getX(i)}" y="${trendPadT + plotH + 16}" font-size="9" fill="#666" text-anchor="middle">${yr}</text>`).join("")}
  ${top2
    .map((p) => {
      const color = getPartyColor(p);
      const pts = trendPoints
        .map((d, i) => `${getX(i)},${getY(d[p] || 0)}`)
        .join(" ");
      return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
    ${trendPoints.map((d, i) => `<circle cx="${getX(i)}" cy="${getY(d[p] || 0)}" r="4" fill="${color}"/>`).join("")}`;
    })
    .join("")}
  <rect x="${trendPadL}" y="${trendPadT + plotH + 22}" width="12" height="8" fill="${getPartyColor(top2[0])}"/>
  <text x="${trendPadL + 16}" y="${trendPadT + plotH + 29}" font-size="10" fill="#333">${top2[0] || ""}</text>
  ${
    top2[1]
      ? `<rect x="${trendPadL + 70}" y="${trendPadT + plotH + 22}" width="12" height="8" fill="${getPartyColor(top2[1])}"/>
  <text x="${trendPadL + 86}" y="${trendPadT + plotH + 29}" font-size="10" fill="#333">${top2[1]}</text>`
      : ""
  }
</svg>`
        : "";

    // Caste pie chart SVG (simplified as horizontal bars)
    const casteTotalVoters = casteData.reduce((s, c) => s + c.total, 0);
    const casteBarsHtml = casteData
      .slice(0, 8)
      .map((c) => {
        const pct =
          casteTotalVoters > 0
            ? ((c.total / casteTotalVoters) * 100).toFixed(1)
            : "0";
        const barW =
          casteTotalVoters > 0
            ? Math.round((c.total / casteTotalVoters) * 400)
            : 0;
        return `<tr>
        <td style="padding:4px 8px;font-size:11px;border:1px solid #eee;">${c.caste}</td>
        <td style="padding:4px 8px;font-size:11px;border:1px solid #eee;">${c.total.toLocaleString()}</td>
        <td style="padding:4px 8px;border:1px solid #eee;">
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:${barW}px;max-width:200px;min-width:4px;height:12px;background:#0b0854;border-radius:3px;"></div>
            <span style="font-size:11px;color:#555;">${pct}%</span>
          </div>
        </td>
        <td style="padding:4px 8px;font-size:11px;border:1px solid #eee;color:#16a34a;">${c.supporter}</td>
        <td style="padding:4px 8px;font-size:11px;border:1px solid #eee;color:#ca8a04;">${c.neutral}</td>
        <td style="padding:4px 8px;font-size:11px;border:1px solid #eee;color:#dc2626;">${c.opponent}</td>
      </tr>`;
      })
      .join("");

    // Summary cards HTML
    const summaryHtml = electionSummary
      ? `
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
  <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:12px;text-align:center;">
    <div style="font-size:10px;color:#16a34a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">🏆 Winner</div>
    <div style="font-size:14px;font-weight:700;color:#15803d;margin-top:4px;">${electionSummary.winner.party}</div>
    <div style="font-size:11px;color:#166534;margin-top:2px;">${electionSummary.winner.candidateName}</div>
    <div style="font-size:16px;font-weight:800;color:#15803d;margin-top:4px;">${electionSummary.winner.votesReceived.toLocaleString()}</div>
    <div style="font-size:9px;color:#16a34a;">votes</div>
  </div>
  <div style="background:#fef2f2;border:2px solid #dc2626;border-radius:10px;padding:12px;text-align:center;">
    <div style="font-size:10px;color:#dc2626;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Runner-up</div>
    <div style="font-size:14px;font-weight:700;color:#b91c1c;margin-top:4px;">${electionSummary.runnerUp ? electionSummary.runnerUp.party : "—"}</div>
    <div style="font-size:11px;color:#991b1b;margin-top:2px;">${electionSummary.runnerUp ? electionSummary.runnerUp.candidateName : "—"}</div>
    <div style="font-size:16px;font-weight:800;color:#b91c1c;margin-top:4px;">${electionSummary.runnerUp ? electionSummary.runnerUp.votesReceived.toLocaleString() : "—"}</div>
    <div style="font-size:9px;color:#dc2626;">votes</div>
  </div>
  <div style="background:${electionSummary.isClose ? "#fefce8" : "#f0f9ff"};border:2px solid ${electionSummary.isClose ? "#ca8a04" : "#0284c7"};border-radius:10px;padding:12px;text-align:center;">
    <div style="font-size:10px;color:${electionSummary.isClose ? "#ca8a04" : "#0284c7"};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Margin</div>
    <div style="font-size:18px;font-weight:800;color:${electionSummary.isClose ? "#a16207" : "#0369a1"};margin-top:8px;">${electionSummary.margin.toLocaleString()}</div>
    <div style="font-size:13px;font-weight:700;color:${electionSummary.isClose ? "#ca8a04" : "#0284c7"};">${electionSummary.marginPct}%</div>
    ${electionSummary.isClose ? '<div style="font-size:9px;color:#ca8a04;margin-top:2px;">⚠️ CLOSE CONTEST</div>' : ""}
  </div>
  <div style="background:#f8fafc;border:2px solid #94a3b8;border-radius:10px;padding:12px;text-align:center;">
    <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Total Votes</div>
    <div style="font-size:18px;font-weight:800;color:#334155;margin-top:8px;">${electionSummary.total.toLocaleString()}</div>
    <div style="font-size:10px;color:#64748b;margin-top:2px;">${electionSummary.latestYear} Election</div>
  </div>
</div>`
      : "";

    // AI insights HTML
    const aiHtml = aiInsights
      ? `
<h2 style="color:#0b0854;border-bottom:2px solid #0b0854;padding-bottom:6px;margin-top:28px;">AI Insights</h2>
<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
  <div style="padding:6px 18px;border-radius:20px;font-weight:700;font-size:13px;background:${aiInsights.areaClass === "Strong" ? "#dcfce7" : aiInsights.areaClass === "Swing" ? "#fef9c3" : "#fee2e2"};color:${aiInsights.areaClass === "Strong" ? "#15803d" : aiInsights.areaClass === "Swing" ? "#a16207" : "#b91c1c"};border:2px solid ${aiInsights.areaClass === "Strong" ? "#16a34a" : aiInsights.areaClass === "Swing" ? "#ca8a04" : "#dc2626"};">
    ${aiInsights.areaClass === "Strong" ? "🟢" : aiInsights.areaClass === "Swing" ? "🟡" : "🔴"} ${aiInsights.areaClass} Area
  </div>
  <span style="font-size:11px;color:#64748b;">Based on ${aiInsights.latestYear} election data</span>
</div>
<h3 style="font-size:12px;color:#0b0854;margin-bottom:8px;font-weight:600;">Win Probability</h3>
<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
${aiInsights.partyStats
  .sort(
    (a: { winProb: number }, b: { winProb: number }) => b.winProb - a.winProb,
  )
  .map(
    (p: { party: string; voteShare: number; winProb: number }) => `
  <div style="display:flex;align-items:center;gap:10px;">
    <div style="width:60px;font-size:11px;font-weight:600;color:#333;">${p.party}</div>
    <div style="flex:1;background:#f1f5f9;border-radius:6px;height:18px;overflow:hidden;">
      <div style="width:${Math.round(p.winProb)}%;background:${getPartyColor(p.party)};height:100%;border-radius:6px;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;">
        <span style="font-size:9px;color:white;font-weight:700;">${p.winProb.toFixed(1)}%</span>
      </div>
    </div>
    <div style="width:50px;font-size:10px;color:#64748b;text-align:right;">${p.voteShare.toFixed(1)}% votes</div>
  </div>`,
  )
  .join("")}
</div>
<div style="background:#f8fafc;border-left:4px solid #0b0854;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:12px;">
  <strong style="font-size:11px;color:#0b0854;">🎯 Target Suggestion:</strong>
  <p style="font-size:11px;color:#334155;margin:4px 0 0 0;">${aiInsights.suggestion}</p>
</div>`
      : "";

    // Election results table rows with rank/highlight
    const erTableRows = (() => {
      const grouped: Record<string, typeof sortedER> = {};
      for (const r of sortedER) {
        if (!grouped[r.year]) grouped[r.year] = [];
        grouped[r.year].push(r);
      }
      const rows: string[] = [];
      for (const yr of Object.keys(grouped).sort().reverse()) {
        const yearGroup = grouped[yr].sort(
          (a, b) => b.votesReceived - a.votesReceived,
        );
        const yearTotal = yearGroup.reduce((s, r) => s + r.votesReceived, 0);
        yearGroup.forEach((r, rank) => {
          const votePct =
            yearTotal > 0
              ? ((r.votesReceived / yearTotal) * 100).toFixed(1)
              : "0";
          const rowBg =
            rank === 0 ? "#f0fdf4" : rank === 1 ? "#fef2f2" : "white";
          const rankBadge =
            rank === 0
              ? `<span style="background:#16a34a;color:white;padding:1px 6px;border-radius:10px;font-size:9px;">🥇 1st</span>`
              : rank === 1
                ? `<span style="background:#dc2626;color:white;padding:1px 6px;border-radius:10px;font-size:9px;">🥈 2nd</span>`
                : `<span style="color:#64748b;font-size:10px;">${rank + 1}</span>`;
          rows.push(`<tr style="background:${rowBg};">
            <td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;">${rankBadge}</td>
            <td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;">${r.year}</td>
            <td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;">${r.electionType}</td>
            <td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;font-weight:${rank < 2 ? "600" : "400"};">${r.candidateName}</td>
            <td style="padding:5px 8px;border:1px solid #e5e7eb;"><span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:600;background:${getPartyColor(r.party)}22;color:${getPartyColor(r.party)};border:1px solid ${getPartyColor(r.party)}44;">${r.party}</span></td>
            <td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;font-weight:${rank === 0 ? "700" : "400"};color:${rank === 0 ? "#15803d" : rank === 1 ? "#b91c1c" : "#333"};">${r.votesReceived.toLocaleString()}</td>
            <td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;">${votePct}%</td>
          </tr>`);
        });
        if (yearGroup.length >= 2) {
          const margin =
            yearGroup[0].votesReceived - yearGroup[1].votesReceived;
          const marginPct =
            yearTotal > 0 ? ((margin / yearTotal) * 100).toFixed(1) : "0";
          rows.push(`<tr style="background:#f8fafc;">
            <td colspan="7" style="padding:3px 8px;border:1px solid #e5e7eb;font-size:9px;color:#64748b;font-style:italic;">
              ${yr} Margin: ${yearGroup[0].party} won by ${margin.toLocaleString()} votes (${marginPct}%) over ${yearGroup[1].party}
            </td>
          </tr>`);
        }
      }
      return rows.join("");
    })();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>VLP Report — ${selTaluka}</title>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; color: #1e293b; }
    h1 { color: #0b0854; font-size: 20px; margin-bottom: 4px; }
    h2 { color: #0b0854; font-size: 14px; border-bottom: 2px solid #0b0854; padding-bottom: 5px; margin-top: 28px; margin-bottom: 12px; }
    h3 { color: #0b0854; font-size: 12px; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #0b0854; color: white; padding: 6px 8px; font-size: 10px; text-align: left; }
    .filter-bar { background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 10px 14px; margin-bottom: 20px; font-size: 11px; color: #3730a3; }
    .section-break { page-break-before: always; margin-top: 20px; }
    footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    .chart-container { margin: 12px 0 20px 0; }
    @media print {
      body { padding: 10px; }
      .section-break { page-break-before: always; }
      svg { max-width: 100%; }
    }
  </style>
</head>
<body>

<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
  <div>
    <h1>SurveyMitra — VLP Report</h1>
    <div style="font-size:11px;color:#64748b;">Village Level Program · Political Intelligence Dashboard</div>
  </div>
  <div style="text-align:right;font-size:10px;color:#94a3b8;">
    <div>Generated: ${new Date().toLocaleString("en-IN")}</div>
    <div style="margin-top:2px;">Made by Tattva Innovation</div>
  </div>
</div>

<div class="filter-bar">
  📍 <strong>Viewing Data For:</strong> &nbsp;
  ${selTaluka ? `<strong>Taluka:</strong> ${selTaluka}` : ""}
  ${selVillage ? ` &nbsp;›&nbsp; <strong>Village:</strong> ${selVillage}` : " &nbsp;›&nbsp; Village: All"}
  ${selBooth ? ` &nbsp;›&nbsp; <strong>Booth:</strong> ${selBooth}` : " &nbsp;›&nbsp; Booth: All"}
  ${selWard ? ` &nbsp;›&nbsp; <strong>Ward:</strong> ${selWard}` : ""}
</div>

<!-- ELECTION RESULTS SECTION -->
<h2>📊 Election Results</h2>

${summaryHtml}

${
  quickInsight
    ? `<div style="background:#eff6ff;border-left:4px solid #1565c0;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:16px;font-size:11px;color:#1e3a5f;">
  <strong>Quick Insight:</strong> ${quickInsight.text} <strong style="color:${quickInsight.classColor};">${quickInsight.classification}</strong>.
</div>`
    : ""
}

<div class="chart-container">
  <h3>Latest Election — Votes by Candidate</h3>
  ${barChartSvg}
</div>

${
  trendChartSvg
    ? `<div class="chart-container">
  <h3>Vote Trend Across Years</h3>
  ${trendChartSvg}
</div>`
    : ""
}

<h3 style="margin-top:16px;">Detailed Results (All Years)</h3>
<table>
  <thead><tr>
    <th>Rank</th><th>Year</th><th>Election Type</th><th>Candidate</th><th>Party</th><th>Votes</th><th>Vote %</th>
  </tr></thead>
  <tbody>${erTableRows}</tbody>
</table>

<!-- CASTE ANALYSIS SECTION -->
<div class="section-break">
<h2>👥 Caste Analysis</h2>
<p style="font-size:11px;color:#64748b;margin-bottom:12px;">Based on ${filteredVoters.length.toLocaleString()} voters in the selected area. Total: ${casteTotalVoters.toLocaleString()} with caste data.</p>
<table>
  <thead><tr>
    <th>Caste</th><th>Total Voters</th><th>% of Area</th><th style="color:#86efac;">Supporters</th><th style="color:#fde68a;">Neutral</th><th style="color:#fca5a5;">Opponents</th>
  </tr></thead>
  <tbody>${casteBarsHtml}</tbody>
</table>
<h3>Sub Caste Distribution</h3>
${
  subcasteData.length > 0
    ? `
<table border="1" style="width:100%; border-collapse:collapse; font-size:12px; margin-top:8px;">
  <thead><tr style="background:#0b0854;color:white;">
    <th style="padding:4px 8px">Sub Caste</th><th style="padding:4px 8px">Caste</th><th style="padding:4px 8px">Total</th><th style="padding:4px 8px">Supporter</th><th style="padding:4px 8px">Neutral</th><th style="padding:4px 8px">Opponent</th>
  </tr></thead>
  <tbody>${subcasteData
    .map(
      (s) => `<tr>
    <td style="padding:4px 8px">${s.subcaste}</td>
    <td style="padding:4px 8px">${s.caste}</td>
    <td style="padding:4px 8px;text-align:center;font-weight:bold">${s.total}</td>
    <td style="padding:4px 8px;text-align:center;color:#388e3c">${s.supporter}</td>
    <td style="padding:4px 8px;text-align:center;color:#f57f17">${s.neutral}</td>
    <td style="padding:4px 8px;text-align:center;color:#c62828">${s.opponent}</td>
  </tr>`,
    )
    .join("")}</tbody>
</table>`
    : "<p>No subcaste data</p>"
}
</div>

<!-- AI INSIGHTS SECTION -->
${aiHtml}

<!-- FIELD NOTES SECTION -->
<div class="section-break">
<h2>📝 Field Notes (${filteredNotes.length})</h2>
${
  filteredNotes.length === 0
    ? '<p style="color:#94a3b8;font-style:italic;font-size:11px;">No field notes recorded for this area.</p>'
    : filteredNotes
        .map(
          (n) => `
<div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:8px;background:white;">
  <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px;">
    <div style="font-size:9px;color:#64748b;">
      ${n.booth ? `<span style="background:#e0e7ff;color:#3730a3;padding:1px 6px;border-radius:10px;margin-right:4px;">Booth: ${n.booth}</span>` : ""}
      ${n.ward ? `<span style="background:#fce7f3;color:#9d174d;padding:1px 6px;border-radius:10px;margin-right:4px;">Ward: ${n.ward}</span>` : ""}
      ${n.village ? `<span style="background:#ecfdf5;color:#065f46;padding:1px 6px;border-radius:10px;margin-right:4px;">Village: ${n.village}</span>` : ""}
    </div>
    <div style="font-size:9px;color:#94a3b8;">${formatDate(n.createdAt)} · By ${n.createdByName || "Admin"}</div>
  </div>
  <p style="margin:0;font-size:11px;color:#1e293b;">${n.text}</p>
  ${n.imageUrl ? `<div style="margin-top:4px;font-size:9px;color:#0284c7;">📷 Image attached</div>` : ""}
  ${n.pdfUrl ? `<div style="margin-top:4px;font-size:9px;color:#dc2626;">📄 PDF: ${n.pdfName || "Document"}</div>` : ""}
</div>`,
        )
        .join("")
}
</div>

<footer>Made by Tattva Innovation &mdash; SurveyMitra VLP Report &mdash; Confidential &mdash; ${new Date().getFullYear()}</footer>
</body>
</html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  };

  const areaLabel = selWard || selBooth || selVillage || selTaluka;

  // ---- Render ----
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5" style={{ color: "#0b0854" }} />
            <h1 className="text-2xl font-bold" style={{ color: "#0b0854" }}>
              Village Level Program (VLP)
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Micro-level Political Intelligence Dashboard
          </p>
        </div>
        {selTaluka && (
          <Badge
            className="mt-1 px-3 py-1 text-sm"
            style={{ background: "#0b0854", color: "white" }}
          >
            {areaLabel}
          </Badge>
        )}
      </div>

      {/* Filter Bar */}
      <Card data-ocid="vlp.filter.card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Taluka */}
            <div>
              <Label className="text-xs mb-1 block">Taluka *</Label>
              <select
                value={selTaluka}
                onChange={(e) => {
                  setSelTaluka(e.target.value);
                  setSelVillage("");
                  setSelBooth("");
                  setSelWard("");
                }}
                className="w-full h-9 rounded-md border border-input text-sm px-2"
                style={{ background: "#e3dec5" }}
                data-ocid="vlp.taluka.select"
              >
                <option value="">Select Taluka</option>
                {talukaOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Village */}
            <div>
              <Label className="text-xs mb-1 block">Village</Label>
              <select
                value={selVillage}
                onChange={(e) => setSelVillage(e.target.value)}
                disabled={!selTaluka}
                className="w-full h-9 rounded-md border border-input text-sm px-2"
                style={{ background: selTaluka ? "#e3dec5" : undefined }}
                data-ocid="vlp.village.select"
              >
                <option value="">All Villages</option>
                {villageOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Booth */}
            <div>
              <Label className="text-xs mb-1 block">Booth</Label>
              <select
                value={selBooth}
                onChange={(e) => {
                  setSelBooth(e.target.value);
                  setSelWard("");
                }}
                disabled={!selTaluka}
                className="w-full h-9 rounded-md border border-input text-sm px-2"
                style={{ background: selTaluka ? "#e3dec5" : undefined }}
                data-ocid="vlp.booth.select"
              >
                <option value="">All Booths</option>
                {boothOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward */}
            <div>
              <Label className="text-xs mb-1 block">Ward</Label>
              <select
                value={selWard}
                onChange={(e) => setSelWard(e.target.value)}
                disabled={!selTaluka}
                className="w-full h-9 rounded-md border border-input text-sm px-2"
                style={{ background: selTaluka ? "#e3dec5" : undefined }}
                data-ocid="vlp.ward.select"
              >
                <option value="">All Wards</option>
                {wardOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selTaluka && (
            <div className="mt-3 text-xs text-muted-foreground">
              Showing <strong>{filteredVoters.length}</strong> voters in
              selected area
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty state */}
      {!selTaluka && (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed"
          style={{ borderColor: "#0b0854", background: "rgba(11,8,84,0.03)" }}
          data-ocid="vlp.empty_state"
        >
          <MapPin
            className="w-12 h-12 mb-4"
            style={{ color: "#0b0854", opacity: 0.4 }}
          />
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: "#0b0854" }}
          >
            Select a Taluka to begin analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose a taluka from the filter above to view election intelligence
          </p>
        </div>
      )}

      {selTaluka && (
        <>
          {/* ========== SECTION 1: ELECTION RESULTS ========== */}
          <Card data-ocid="vlp.election.card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "#0b0854" }}
                >
                  <TrendingUp className="w-4 h-4" />
                  Election Results (Last 5 Years)
                </CardTitle>
                {isSuperAdmin && (
                  <Button
                    size="sm"
                    onClick={openAddER}
                    style={{ background: "#0b0854", color: "white" }}
                    data-ocid="vlp.election.open_modal_button"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Result
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Filter Context Breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-slate-50 border rounded-md px-3 py-2">
                <MapPin className="w-3.5 h-3.5 text-[#0b0854]" />
                <span className="font-medium text-[#0b0854]">
                  Viewing Data For:
                </span>
                <span>{selTaluka}</span>
                {selVillage && (
                  <>
                    <span className="text-slate-400">›</span>
                    <span>{selVillage}</span>
                  </>
                )}
                {selBooth && (
                  <>
                    <span className="text-slate-400">›</span>
                    <span>Booth {selBooth}</span>
                  </>
                )}
                {selWard && (
                  <>
                    <span className="text-slate-400">›</span>
                    <span>Ward {selWard}</span>
                  </>
                )}
              </div>

              {filteredER.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground text-sm">
                  No election results for selected filters. Add results or
                  generate mock data.
                </p>
              ) : (
                <>
                  {/* Summary Cards */}
                  {electionSummary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Winner Card */}
                      <div className="rounded-xl border-2 border-green-500 bg-green-50 p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                            Winner
                          </span>
                        </div>
                        <div className="text-xl font-bold text-green-800">
                          {electionSummary.winner.party}
                        </div>
                        <div className="text-sm text-green-700 truncate">
                          {electionSummary.winner.candidateName}
                        </div>
                        <div className="text-lg font-semibold text-green-900">
                          {electionSummary.winner.votesReceived.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">
                          votes · {electionSummary.latestYear}
                        </div>
                      </div>

                      {/* Runner-up Card */}
                      {electionSummary.runnerUp ? (
                        <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                              Runner-up
                            </span>
                          </div>
                          <div className="text-xl font-bold text-red-800">
                            {electionSummary.runnerUp.party}
                          </div>
                          <div className="text-sm text-red-700 truncate">
                            {electionSummary.runnerUp.candidateName}
                          </div>
                          <div className="text-lg font-semibold text-red-900">
                            {electionSummary.runnerUp.votesReceived.toLocaleString()}
                          </div>
                          <div className="text-xs text-red-600">
                            votes · {electionSummary.latestYear}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 flex items-center justify-center text-sm text-muted-foreground">
                          No runner-up
                        </div>
                      )}

                      {/* Vote Margin Card */}
                      <div
                        className={`rounded-xl border-2 p-4 flex flex-col gap-1 ${electionSummary.isClose ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${electionSummary.isClose ? "bg-amber-400" : "bg-slate-400"}`}
                          />
                          <span
                            className={`text-xs font-semibold uppercase tracking-wide ${electionSummary.isClose ? "text-amber-700" : "text-slate-600"}`}
                          >
                            {electionSummary.isClose
                              ? "⚠ Close Margin"
                              : "Vote Margin"}
                          </span>
                        </div>
                        <div
                          className={`text-xl font-bold ${electionSummary.isClose ? "text-amber-800" : "text-slate-800"}`}
                        >
                          {electionSummary.margin.toLocaleString()}
                        </div>
                        <div
                          className={`text-2xl font-black ${electionSummary.isClose ? "text-amber-700" : "text-slate-700"}`}
                        >
                          {electionSummary.marginPct}%
                        </div>
                        <div
                          className={`text-xs ${electionSummary.isClose ? "text-amber-600" : "text-slate-500"}`}
                        >
                          margin gap
                        </div>
                      </div>

                      {/* Total Votes Card */}
                      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                            Total Votes
                          </span>
                        </div>
                        <div className="text-2xl font-black text-blue-900">
                          {electionSummary.total.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-600">
                          {electionSummary.latestYear} election
                        </div>
                        <div className="text-xs text-blue-500">
                          {latestYearResults.length} candidates
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Insight */}
                  {quickInsight && (
                    <div className="flex items-start gap-2 bg-[#0b0854]/5 border border-[#0b0854]/20 rounded-lg px-4 py-3">
                      <Zap className="w-4 h-4 text-[#0b0854] mt-0.5 shrink-0" />
                      <p className="text-sm text-[#0b0854]">
                        {quickInsight.text}{" "}
                        <span
                          className="font-bold px-1.5 py-0.5 rounded text-white text-xs"
                          style={{ background: quickInsight.classColor }}
                        >
                          {quickInsight.classification}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Charts — respond to erViewBy */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {erViewBy === "candidate" ? (
                      // By Candidate: total votes per candidate across all years
                      (() => {
                        const candMap: Record<
                          string,
                          {
                            name: string;
                            party: string;
                            totalVotes: number;
                            wins: number;
                          }
                        > = {};
                        for (const r of filteredER) {
                          const key = r.candidateName;
                          if (!candMap[key])
                            candMap[key] = {
                              name: r.candidateName,
                              party: r.party,
                              totalVotes: 0,
                              wins: 0,
                            };
                          candMap[key].totalVotes += r.votesReceived;
                        }
                        // Count wins per candidate
                        const allYears = Array.from(
                          new Set(filteredER.map((r) => r.year)),
                        );
                        for (const yr of allYears) {
                          const yrResults = filteredER.filter(
                            (r) => r.year === yr,
                          );
                          if (yrResults.length === 0) continue;
                          const maxV = Math.max(
                            ...yrResults.map((r) => r.votesReceived),
                          );
                          const winner = yrResults.find(
                            (r) => r.votesReceived === maxV,
                          );
                          if (winner && candMap[winner.candidateName])
                            candMap[winner.candidateName].wins++;
                        }
                        const candRows = Object.values(candMap).sort(
                          (a, b) => b.totalVotes - a.totalVotes,
                        );
                        const PARTY_COLORS: Record<string, string> = {
                          INC: "#1565C0",
                          BJP: "#FF6600",
                          NCP: "#4CAF50",
                          SS: "#9C27B0",
                          BSP: "#3F51B5",
                          AAP: "#00BCD4",
                          IND: "#607D8B",
                        };
                        const barData = candRows.map((c, i) => ({
                          name:
                            c.name.length > 12
                              ? `${c.name.slice(0, 12)}…`
                              : c.name,
                          fullName: c.name,
                          votes: c.totalVotes,
                          wins: c.wins,
                          party: c.party,
                          fill:
                            i === 0
                              ? "#16a34a"
                              : i === 1
                                ? "#dc2626"
                                : (PARTY_COLORS[c.party] ?? "#607d8b"),
                        }));
                        return (
                          <>
                            <div className="bg-white border rounded-xl p-4 md:col-span-2">
                              <h4 className="text-sm font-semibold text-[#0b0854] mb-3">
                                Total Votes by Candidate (All Years)
                              </h4>
                              <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                  data={barData}
                                  margin={{ bottom: 20 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10 }}
                                    interval={0}
                                    angle={-20}
                                    textAnchor="end"
                                  />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <RechartsTooltip
                                    formatter={(
                                      v: number,
                                      _n: string,
                                      p: {
                                        payload?: {
                                          party?: string;
                                          wins?: number;
                                        };
                                      },
                                    ) => [
                                      `${v.toLocaleString()} votes — Party: ${p.payload?.party ?? ""} — Wins: ${p.payload?.wins ?? 0}`,
                                    ]}
                                  />
                                  <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                                    {barData.map((d, idx) => (
                                      <Cell
                                        key={`bar-${d.name}-${idx}`}
                                        fill={d.fill}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </>
                        );
                      })()
                    ) : erViewBy === "party" ? (
                      // By Party: total votes per party
                      (() => {
                        const partyMap: Record<string, number> = {};
                        for (const r of filteredER) {
                          partyMap[r.party] =
                            (partyMap[r.party] ?? 0) + r.votesReceived;
                        }
                        const PARTY_COLORS: Record<string, string> = {
                          INC: "#1565C0",
                          BJP: "#FF6600",
                          NCP: "#4CAF50",
                          SS: "#9C27B0",
                          BSP: "#3F51B5",
                          AAP: "#00BCD4",
                          IND: "#607D8B",
                        };
                        const barData = Object.entries(partyMap)
                          .sort((a, b) => b[1] - a[1])
                          .map(([party, votes], i) => ({
                            name: party,
                            votes,
                            fill:
                              i === 0
                                ? "#16a34a"
                                : i === 1
                                  ? "#dc2626"
                                  : (PARTY_COLORS[party] ?? "#607d8b"),
                          }));
                        return (
                          <>
                            <div className="bg-white border rounded-xl p-4">
                              <h4 className="text-sm font-semibold text-[#0b0854] mb-3">
                                Total Votes by Party
                              </h4>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={barData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10 }}
                                  />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <RechartsTooltip
                                    formatter={(v: number) => [
                                      `${v.toLocaleString()} votes`,
                                    ]}
                                  />
                                  <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                                    {barData.map((d, idx) => (
                                      <Cell
                                        key={`bar-${d.name}-${idx}`}
                                        fill={d.fill}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            {trendData.length > 1 && top2Parties.length >= 2 ? (
                              <div className="bg-white border rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-[#0b0854] mb-3">
                                  Vote Trend — {top2Parties[0]} vs{" "}
                                  {top2Parties[1]}
                                </h4>
                                <ResponsiveContainer width="100%" height={200}>
                                  <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="year"
                                      tick={{ fontSize: 10 }}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <RechartsTooltip />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Line
                                      type="monotone"
                                      dataKey={top2Parties[0]}
                                      stroke="#16a34a"
                                      strokeWidth={2.5}
                                      dot={{ r: 4 }}
                                      activeDot={{ r: 6 }}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey={top2Parties[1]}
                                      stroke="#dc2626"
                                      strokeWidth={2.5}
                                      dot={{ r: 4 }}
                                      activeDot={{ r: 6 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <div className="bg-slate-50 border rounded-xl p-4 flex items-center justify-center text-sm text-muted-foreground">
                                Add results from multiple years to see trend
                                chart
                              </div>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      // By Year (default): latest year bar + trend line
                      <>
                        <div className="bg-white border rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-[#0b0854] mb-3">
                            {latestYear} — Votes by Candidate
                          </h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                              data={latestYearResults.map((r, i) => ({
                                name:
                                  r.candidateName.length > 10
                                    ? `${r.candidateName.slice(0, 10)}…`
                                    : r.candidateName,
                                votes: r.votesReceived,
                                party: r.party,
                                fill:
                                  i === 0
                                    ? "#16a34a"
                                    : i === 1
                                      ? "#dc2626"
                                      : "#607d8b",
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <RechartsTooltip
                                formatter={(v: number) => [
                                  `${v.toLocaleString()} votes`,
                                ]}
                              />
                              <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                                {latestYearResults.map((r, i) => (
                                  <Cell
                                    key={r.id || i}
                                    fill={
                                      i === 0
                                        ? "#16a34a"
                                        : i === 1
                                          ? "#dc2626"
                                          : "#607d8b"
                                    }
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        {trendData.length > 1 && top2Parties.length >= 2 ? (
                          <div className="bg-white border rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-[#0b0854] mb-3">
                              Vote Trend — {top2Parties[0]} vs {top2Parties[1]}
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <RechartsTooltip />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Line
                                  type="monotone"
                                  dataKey={top2Parties[0]}
                                  stroke="#16a34a"
                                  strokeWidth={2.5}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey={top2Parties[1]}
                                  stroke="#dc2626"
                                  strokeWidth={2.5}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border rounded-xl p-4 flex items-center justify-center text-sm text-muted-foreground">
                            Add results from multiple years to see trend chart
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Toggle View Buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      View by:
                    </span>
                    {(["year", "party", "candidate"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setErViewBy(v)}
                        data-ocid={`vlp.election.${v}.tab`}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize ${erViewBy === v ? "bg-[#0b0854] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      >
                        {v === "year"
                          ? "By Year"
                          : v === "party"
                            ? "By Party"
                            : "By Candidate"}
                      </button>
                    ))}
                  </div>

                  {/* Enhanced Table */}
                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "#0b0854", color: "white" }}>
                          <th className="px-3 py-2.5 text-left w-12">Rank</th>
                          {(
                            [
                              "year",
                              "candidateName",
                              "party",
                              "votesReceived",
                            ] as const
                          ).map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2.5 text-left cursor-pointer hover:bg-white/10 select-none"
                              onClick={() => toggleSort(col)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && toggleSort(col)
                              }
                            >
                              {col === "candidateName"
                                ? "Candidate"
                                : col === "votesReceived"
                                  ? "Votes"
                                  : col.charAt(0).toUpperCase() + col.slice(1)}
                              {erSort.col === col
                                ? erSort.dir === "asc"
                                  ? " ▲"
                                  : " ▼"
                                : ""}
                            </th>
                          ))}
                          <th className="px-3 py-2.5 text-left">Vote %</th>
                          {isSuperAdmin && (
                            <th className="px-3 py-2.5 text-left">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedER.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No election results for selected filters
                            </td>
                          </tr>
                        ) : erViewBy === "party" ? (
                          (() => {
                            const partyMap: Record<
                              string,
                              {
                                party: string;
                                totalVotes: number;
                                wins: number;
                                years: string[];
                              }
                            > = {};
                            for (const r of filteredER) {
                              if (!partyMap[r.party])
                                partyMap[r.party] = {
                                  party: r.party,
                                  totalVotes: 0,
                                  wins: 0,
                                  years: [],
                                };
                              partyMap[r.party].totalVotes += r.votesReceived;
                              if (!partyMap[r.party].years.includes(r.year))
                                partyMap[r.party].years.push(r.year);
                            }
                            const allYears = Array.from(
                              new Set(filteredER.map((r) => r.year)),
                            );
                            for (const yr of allYears) {
                              const maxVotes = Math.max(
                                ...filteredER
                                  .filter((r) => r.year === yr)
                                  .map((r) => r.votesReceived),
                              );
                              const winnerRow = filteredER.find(
                                (r) =>
                                  r.year === yr && r.votesReceived === maxVotes,
                              );
                              if (winnerRow) partyMap[winnerRow.party].wins++;
                            }
                            const partyRows = Object.values(partyMap).sort(
                              (a, b) => b.totalVotes - a.totalVotes,
                            );
                            const grandTotal = partyRows.reduce(
                              (s, p) => s + p.totalVotes,
                              0,
                            );
                            return partyRows.map((p, i) => (
                              <tr
                                key={p.party}
                                className={`border-b ${i === 0 ? "bg-green-50" : i === 1 ? "bg-red-50" : "hover:bg-muted/30"}`}
                              >
                                <td className="px-3 py-2 text-center">
                                  <span
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? "bg-green-500 text-white" : i === 1 ? "bg-red-400 text-white" : "bg-slate-200 text-slate-600"}`}
                                  >
                                    {i + 1}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-muted-foreground text-xs">
                                  {p.years.sort().join(", ")}
                                </td>
                                <td className="px-3 py-2 font-medium">
                                  {p.wins} win{p.wins !== 1 ? "s" : ""}
                                </td>
                                <td className="px-3 py-2">
                                  <Badge
                                    className="text-xs"
                                    style={{
                                      background:
                                        PARTY_COLORS[p.party] || "#607d8b",
                                      color: "white",
                                    }}
                                  >
                                    {p.party}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 font-semibold">
                                  {p.totalVotes.toLocaleString()}
                                </td>
                                <td className="px-3 py-2">
                                  {grandTotal > 0
                                    ? (
                                        (p.totalVotes / grandTotal) *
                                        100
                                      ).toFixed(1)
                                    : "0"}
                                  %
                                </td>
                                {isSuperAdmin && <td className="px-3 py-2" />}
                              </tr>
                            ));
                          })()
                        ) : (
                          (() => {
                            const yearTotals: Record<string, number> = {};
                            const yearCounters: Record<string, number> = {};
                            for (const r of sortedER) {
                              yearTotals[r.year] =
                                (yearTotals[r.year] || 0) + r.votesReceived;
                            }
                            return sortedER.map((r, idx) => {
                              yearCounters[r.year] =
                                (yearCounters[r.year] || 0) + 1;
                              const rank = yearCounters[r.year];
                              const yearTotal = yearTotals[r.year] || 1;
                              const votePct = (
                                (r.votesReceived / yearTotal) *
                                100
                              ).toFixed(1);
                              const isWinner = rank === 1;
                              const isRunnerUp = rank === 2;
                              return (
                                <tr
                                  key={r.id}
                                  className={`border-b transition-colors ${isWinner ? "bg-green-50 hover:bg-green-100" : isRunnerUp ? "bg-red-50 hover:bg-red-100" : "hover:bg-muted/30"}`}
                                  data-ocid={`vlp.election.row.${idx + 1}`}
                                >
                                  <td className="px-3 py-2 text-center">
                                    <span
                                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isWinner ? "bg-green-500 text-white" : isRunnerUp ? "bg-red-400 text-white" : "bg-slate-200 text-slate-600"}`}
                                    >
                                      {rank}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 font-medium">
                                    {r.year}
                                  </td>
                                  <td className="px-3 py-2">
                                    {r.candidateName}
                                  </td>
                                  <td className="px-3 py-2">
                                    <Badge
                                      className="text-xs"
                                      style={{
                                        background: isWinner
                                          ? "#16a34a"
                                          : isRunnerUp
                                            ? "#dc2626"
                                            : PARTY_COLORS[r.party] ||
                                              "#607d8b",
                                        color: "white",
                                      }}
                                    >
                                      {r.party}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-2 font-semibold">
                                    {r.votesReceived.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {votePct}%
                                  </td>
                                  {isSuperAdmin && (
                                    <td className="px-3 py-2">
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 text-blue-600"
                                          onClick={() => openEditER(r)}
                                          data-ocid={`vlp.election.edit_button.${idx + 1}`}
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 text-red-600"
                                          onClick={() => deleteER(r.id)}
                                          data-ocid={`vlp.election.delete_button.${idx + 1}`}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              );
                            });
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ========== SECTION 2: CASTE BREAKDOWN ========== */}
          <Card data-ocid="vlp.caste.card">
            <CardHeader>
              <CardTitle style={{ color: "#0b0854" }}>
                Caste Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {casteData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No voter data with caste information for selected filters
                </p>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Pie chart */}
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={casteData.slice(0, 8)}
                          dataKey="total"
                          nameKey="caste"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ caste, percent }) =>
                            `${caste} (${(percent * 100).toFixed(0)}%)`
                          }
                          labelLine={false}
                        >
                          {casteData.slice(0, 8).map((cd, i) => (
                            <Cell
                              key={cd.caste}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Stacked bar */}
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={casteData.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="caste" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar
                          dataKey="supporter"
                          name="Supporter"
                          stackId="a"
                          fill="#388e3c"
                        />
                        <Bar
                          dataKey="neutral"
                          name="Neutral"
                          stackId="a"
                          fill="#f57f17"
                        />
                        <Bar
                          dataKey="opponent"
                          name="Opponent"
                          stackId="a"
                          fill="#c62828"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "#0b0854", color: "white" }}>
                          <th className="px-3 py-2 text-left">Caste</th>
                          <th className="px-3 py-2 text-left">Total</th>
                          <th className="px-3 py-2 text-left">Male</th>
                          <th className="px-3 py-2 text-left">Female</th>
                          <th className="px-3 py-2 text-left">Supporter</th>
                          <th className="px-3 py-2 text-left">Neutral</th>
                          <th className="px-3 py-2 text-left">Opponent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {casteData.map((c, idx) => (
                          <tr
                            key={c.caste}
                            className="border-b hover:bg-muted/50"
                            data-ocid={`vlp.caste.row.${idx + 1}`}
                          >
                            <td className="px-3 py-2 font-medium">{c.caste}</td>
                            <td className="px-3 py-2">{c.total}</td>
                            <td className="px-3 py-2">{c.male}</td>
                            <td className="px-3 py-2">{c.female}</td>
                            <td className="px-3 py-2 text-green-700">
                              {c.supporter}
                            </td>
                            <td className="px-3 py-2 text-amber-700">
                              {c.neutral}
                            </td>
                            <td className="px-3 py-2 text-red-700">
                              {c.opponent}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Sub Caste Distribution */}
                  {subcasteData.length > 0 && (
                    <div className="mt-4">
                      <h4
                        className="font-semibold text-sm mb-2"
                        style={{ color: "#0b0854" }}
                      >
                        Sub Caste Distribution
                      </h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={subcasteData.slice(0, 10)}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis
                            dataKey="subcaste"
                            type="category"
                            width={110}
                            tick={{ fontSize: 10 }}
                          />
                          <RechartsTooltip />
                          <Legend />
                          <Bar
                            dataKey="supporter"
                            name="Supporter"
                            stackId="a"
                            fill="#388e3c"
                          />
                          <Bar
                            dataKey="neutral"
                            name="Neutral"
                            stackId="a"
                            fill="#f57f17"
                          />
                          <Bar
                            dataKey="opponent"
                            name="Opponent"
                            stackId="a"
                            fill="#c62828"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ========== SECTION 3: FIELD NOTES ========== */}
          <Card data-ocid="vlp.notes.card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "#0b0854" }}
                >
                  <FileText className="w-4 h-4" />
                  Field Notes
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportNotesCSV}
                    data-ocid="vlp.notes.upload_button"
                  >
                    <Download className="w-4 h-4 mr-1" /> Export CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={openAddNote}
                    style={{ background: "#0b0854", color: "white" }}
                    data-ocid="vlp.notes.open_modal_button"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Note
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredNotes.length === 0 ? (
                <p
                  className="text-sm text-muted-foreground text-center py-6"
                  data-ocid="vlp.notes.empty_state"
                >
                  No field notes for selected area
                </p>
              ) : (
                <Accordion type="multiple" defaultValue={["taluka-notes"]}>
                  {/* Taluka Level Notes */}
                  {talukaLevelNotes.length > 0 && (
                    <AccordionItem value="taluka-notes">
                      <AccordionTrigger className="font-semibold">
                        Taluka Level Notes ({talukaLevelNotes.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {talukaLevelNotes.map((n, idx) => (
                            <NoteCard
                              key={n.id}
                              note={n}
                              idx={idx}
                              canEdit={canEditNote(n)}
                              isSuperAdmin={isSuperAdmin}
                              onEdit={openEditNote}
                              onDelete={deleteNote}
                            />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Village → Booth grouped notes */}
                  {Object.entries(groupedNotes).map(([village, booths]) => (
                    <AccordionItem key={village} value={`village-${village}`}>
                      <AccordionTrigger className="font-semibold">
                        Village: {village}
                      </AccordionTrigger>
                      <AccordionContent>
                        <Accordion type="multiple">
                          {Object.entries(booths).map(([booth, notes]) => (
                            <AccordionItem key={booth} value={`booth-${booth}`}>
                              <AccordionTrigger className="pl-4 text-sm">
                                Booth: {booth} ({notes.length})
                              </AccordionTrigger>
                              <AccordionContent className="pl-4">
                                <div className="space-y-3">
                                  {notes.map((n, idx) => (
                                    <NoteCard
                                      key={n.id}
                                      note={n}
                                      idx={idx}
                                      canEdit={canEditNote(n)}
                                      isSuperAdmin={isSuperAdmin}
                                      onEdit={openEditNote}
                                      onDelete={deleteNote}
                                    />
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* ========== SECTION 4: AI INSIGHTS ========== */}
          <Card data-ocid="vlp.ai.card">
            <CardHeader>
              <CardTitle
                className="flex items-center gap-2"
                style={{ color: "#0b0854" }}
              >
                <Zap className="w-4 h-4" /> AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!aiInsights ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Add election results to see AI-powered insights
                </p>
              ) : (
                <div className="space-y-6">
                  {/* 1. Win Probability */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                      Win Probability — {aiInsights.latestYear} Election
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: "#0b0854", color: "white" }}>
                            <th className="px-3 py-2 text-left">Party</th>
                            <th className="px-3 py-2 text-left">Vote %</th>
                            <th className="px-3 py-2 text-left w-48">
                              Win Probability
                            </th>
                            <th className="px-3 py-2 text-left">Win Prob %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aiInsights.partyStats.map((p, idx) => (
                            <tr
                              key={p.party}
                              className="border-b"
                              style={
                                idx === 0
                                  ? { background: "rgba(56,142,60,0.08)" }
                                  : {}
                              }
                              data-ocid={`vlp.ai.row.${idx + 1}`}
                            >
                              <td className="px-3 py-2">
                                <Badge
                                  style={{
                                    background:
                                      PARTY_COLORS[p.party] || "#607d8b",
                                    color: "white",
                                  }}
                                >
                                  {p.party}
                                </Badge>
                                {idx === 0 && (
                                  <span className="ml-2 text-xs text-green-700 font-semibold">
                                    🏆 Likely Winner
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {p.voteShare.toFixed(1)}%
                              </td>
                              <td className="px-3 py-2">
                                <Progress value={p.winProb} className="h-2" />
                              </td>
                              <td className="px-3 py-2 font-semibold">
                                {p.winProb.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. Area Classification */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                      Area Classification
                    </h4>
                    <Badge
                      className="text-base px-4 py-1.5"
                      style={{
                        background:
                          aiInsights.areaClass === "Strong"
                            ? "#388e3c"
                            : aiInsights.areaClass === "Swing"
                              ? "#f57f17"
                              : "#c62828",
                        color: "white",
                      }}
                      data-ocid="vlp.ai.toggle"
                    >
                      {aiInsights.areaClass === "Strong"
                        ? "✅ Strong Hold"
                        : aiInsights.areaClass === "Swing"
                          ? "🟡 Swing Area"
                          : "🔴 Weak Area"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      {aiInsights.areaClass === "Strong"
                        ? "Leading party has dominant vote share (>55%). Consolidate existing support."
                        : aiInsights.areaClass === "Swing"
                          ? "Top parties are closely matched. Every vote counts — intensify outreach."
                          : "No clear dominant force. Multi-cornered contest — strategic targeting needed."}
                    </p>
                  </div>

                  {/* 3. Top Caste Influence */}
                  {aiInsights.topCastesWithIdeology.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                        Top Caste Influence
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {aiInsights.topCastesWithIdeology.map((c, idx) => (
                          <div
                            key={c.caste}
                            className="p-3 rounded-lg border"
                            style={{
                              borderColor: PIE_COLORS[idx],
                              borderWidth: 2,
                            }}
                            data-ocid={`vlp.ai.card.${idx + 1}`}
                          >
                            <div className="font-semibold text-sm">
                              {c.caste}
                            </div>
                            <div
                              className="text-2xl font-bold mt-1"
                              style={{ color: "#0b0854" }}
                            >
                              {c.total}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              voters
                            </div>
                            <Badge
                              className="mt-2 text-xs"
                              style={{
                                background:
                                  c.dominant === "Supporter"
                                    ? "#388e3c"
                                    : c.dominant === "Opponent"
                                      ? "#c62828"
                                      : "#f57f17",
                                color: "white",
                              }}
                            >
                              {c.dominant}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Target Suggestion */}
                  <div
                    className="p-4 rounded-lg border-l-4"
                    style={{
                      borderColor: "#0b0854",
                      background: "rgba(11,8,84,0.04)",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Zap
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: "#0b0854" }}
                      />
                      <div>
                        <div
                          className="font-semibold text-sm mb-1"
                          style={{ color: "#0b0854" }}
                        >
                          Target Suggestion
                        </div>
                        <p className="text-sm">{aiInsights.suggestion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ========== SECTION 5: REPORT GENERATION ========== */}
          <Card data-ocid="vlp.report.card">
            <CardHeader>
              <CardTitle style={{ color: "#0b0854" }}>
                Report Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a comprehensive VLP report including election results,
                caste analysis, AI insights, and field notes for the selected
                area.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={printReport}
                  style={{ background: "#0b0854", color: "white" }}
                  data-ocid="vlp.report.primary_button"
                >
                  <FileText className="w-4 h-4 mr-2" /> Generate Report
                </Button>
                <Button
                  variant="outline"
                  onClick={printReport}
                  data-ocid="vlp.report.secondary_button"
                >
                  <Download className="w-4 h-4 mr-2" /> Download as PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ========== SECTION 6: MOCK DATA (superAdmin only) ========== */}
          {isSuperAdmin && (
            <Card data-ocid="vlp.mock.card">
              <CardHeader>
                <CardTitle style={{ color: "#0b0854" }}>
                  Generate Mock Data for Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Populate election results (2020–2024) and sample field notes
                  for the selected taluka/area to test the VLP dashboard.
                </p>
                <Button
                  onClick={generateMockData}
                  variant="outline"
                  className="border-2"
                  style={{ borderColor: "#0b0854", color: "#0b0854" }}
                  data-ocid="vlp.mock.primary_button"
                >
                  <Zap className="w-4 h-4 mr-2" /> Generate Mock Data
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ========== ELECTION RESULT DIALOG ========== */}
      <Dialog open={erDialogOpen} onOpenChange={setErDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="vlp.election.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "#0b0854" }}>
              {editingER ? "Edit Election Result" : "Add Election Result"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Year *</Label>
                <Input
                  placeholder="e.g. 2024"
                  value={erForm.year}
                  onChange={(e) =>
                    setErForm((p) => ({ ...p, year: e.target.value }))
                  }
                  style={{ background: "#e3dec5" }}
                  data-ocid="vlp.election.input"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Election Type *</Label>
                <Select
                  value={erForm.electionType}
                  onValueChange={(v) =>
                    setErForm((p) => ({ ...p, electionType: v }))
                  }
                >
                  <SelectTrigger style={{ background: "#e3dec5" }}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "white" }}>
                    {ELECTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Candidate Name *</Label>
              <Input
                placeholder="Full name"
                value={erForm.candidateName}
                onChange={(e) =>
                  setErForm((p) => ({ ...p, candidateName: e.target.value }))
                }
                style={{ background: "#e3dec5" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Party *</Label>
                <Select
                  value={erForm.party}
                  onValueChange={(v) => setErForm((p) => ({ ...p, party: v }))}
                >
                  <SelectTrigger style={{ background: "#e3dec5" }}>
                    <SelectValue placeholder="Party" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "white" }}>
                    {PARTIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Votes Received *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={erForm.votesReceived}
                  onChange={(e) =>
                    setErForm((p) => ({ ...p, votesReceived: e.target.value }))
                  }
                  style={{ background: "#e3dec5" }}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Taluka</Label>
              <Input
                value={selTaluka}
                readOnly
                className="opacity-60"
                style={{ background: "#e3dec5" }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Village</Label>
                <Input
                  value={erForm.village}
                  onChange={(e) =>
                    setErForm((p) => ({ ...p, village: e.target.value }))
                  }
                  style={{ background: "#e3dec5" }}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Booth</Label>
                <Input
                  value={erForm.booth}
                  onChange={(e) =>
                    setErForm((p) => ({ ...p, booth: e.target.value }))
                  }
                  style={{ background: "#e3dec5" }}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Ward</Label>
                <Input
                  value={erForm.ward}
                  onChange={(e) =>
                    setErForm((p) => ({ ...p, ward: e.target.value }))
                  }
                  style={{ background: "#e3dec5" }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setErDialogOpen(false)}
              data-ocid="vlp.election.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveER}
              style={{ background: "#0b0854", color: "white" }}
              data-ocid="vlp.election.submit_button"
            >
              {editingER ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== FIELD NOTE DIALOG ========== */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="vlp.notes.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "#0b0854" }}>
              {editingNote ? "Edit Note" : "Add Field Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs mb-1 block">Note *</Label>
              <Textarea
                placeholder="Enter your field observation..."
                rows={4}
                value={noteForm.text}
                onChange={(e) =>
                  setNoteForm((p) => ({ ...p, text: e.target.value }))
                }
                style={{ background: "#e3dec5" }}
                data-ocid="vlp.notes.textarea"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Village</Label>
                <Input
                  value={noteForm.village}
                  onChange={(e) =>
                    setNoteForm((p) => ({ ...p, village: e.target.value }))
                  }
                  style={{ background: "#e3dec5" }}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Booth</Label>
                <Input
                  value={noteForm.booth}
                  onChange={(e) =>
                    setNoteForm((p) => ({ ...p, booth: e.target.value }))
                  }
                  style={{ background: "#e3dec5" }}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Ward</Label>
                <Input
                  value={noteForm.ward}
                  onChange={(e) =>
                    setNoteForm((p) => ({ ...p, ward: e.target.value }))
                  }
                  style={{ background: "#e3dec5" }}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Image (max 500KB)</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm"
                data-ocid="vlp.notes.upload_button"
              />
              {noteForm.imageName && (
                <p className="text-xs text-muted-foreground mt-1">
                  📷 {noteForm.imageName}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs mb-1 block">PDF (max 1MB)</Label>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="w-full text-sm"
              />
              {noteForm.pdfName && (
                <p className="text-xs text-muted-foreground mt-1">
                  📄 {noteForm.pdfName}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNoteDialogOpen(false)}
              data-ocid="vlp.notes.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveNote}
              style={{ background: "#0b0854", color: "white" }}
              data-ocid="vlp.notes.submit_button"
            >
              {editingNote ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- NoteCard sub-component ----
interface NoteCardProps {
  note: FieldNote;
  idx: number;
  canEdit: boolean;
  isSuperAdmin: boolean;
  onEdit: (n: FieldNote) => void;
  onDelete: (id: string) => void;
}

function NoteCard({
  note,
  idx,
  canEdit,
  isSuperAdmin,
  onEdit,
  onDelete,
}: NoteCardProps) {
  return (
    <div
      className="p-3 rounded-lg border bg-card"
      data-ocid={`vlp.notes.item.${idx + 1}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm flex-1">{note.text}</p>
        <div className="flex gap-1 shrink-0">
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-blue-600"
              onClick={() => onEdit(note)}
              data-ocid={`vlp.notes.edit_button.${idx + 1}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          )}
          {isSuperAdmin && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-red-600"
              onClick={() => onDelete(note.id)}
              data-ocid={`vlp.notes.delete_button.${idx + 1}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {formatDate(note.createdAt)} · {note.createdByName}
      </div>
      {note.imageUrl && (
        <img
          src={note.imageUrl}
          alt={note.imageName || "note image"}
          className="mt-2 rounded max-h-20 object-cover"
        />
      )}
      {note.pdfUrl && (
        <a
          href={note.pdfUrl}
          download={note.pdfName || "document.pdf"}
          className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"
        >
          <FileText className="w-3 h-3" /> {note.pdfName || "Download PDF"}
        </a>
      )}
    </div>
  );
}
