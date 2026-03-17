import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart2, Filter, MapPin, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAllVoters } from "../store/voters";

const CHART_COLORS = [
  "#0b0854",
  "#16c784",
  "#f97316",
  "#ef4444",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#eab308",
  "#10b981",
  "#f43f5e",
];

function EmptyChart({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-2">
        <span className="text-lg">∅</span>
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold font-mono">{value}</p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}1a` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: color }}
      />
    </Card>
  );
}

export default function AdvancedAnalyticsPage() {
  const allVoters = useMemo(() => getAllVoters(), []);

  const [filters, setFilters] = useState({
    taluka: "all",
    district: "all",
    ward: "all",
    caste: "all",
    religion: "all",
    category: "all",
    gender: "all",
    booth: "all",
    constituency: "all",
  });

  // Build unique options from data
  const options = useMemo(() => {
    const unique = (arr: (string | undefined)[]): string[] =>
      [...new Set(arr.filter(Boolean))].sort() as string[];
    return {
      taluka: unique(allVoters.map((v) => v.taluka)),
      district: unique(allVoters.map((v) => v.district)),
      ward: unique(allVoters.map((v) => v.ward)),
      caste: unique(allVoters.map((v) => v.caste)),
      religion: unique(allVoters.map((v) => v.religion)),
      category: unique(allVoters.map((v) => v.categoryLabel)),
      gender: unique(allVoters.map((v) => v.gender)),
      booth: unique(allVoters.map((v) => v.boothNumber)),
      constituency: unique(allVoters.map((v) => v.constituency)),
    };
  }, [allVoters]);

  // Apply filters
  const filtered = useMemo(() => {
    return allVoters.filter((v) => {
      if (filters.taluka !== "all" && v.taluka !== filters.taluka) return false;
      if (filters.district !== "all" && v.district !== filters.district)
        return false;
      if (filters.ward !== "all" && v.ward !== filters.ward) return false;
      if (filters.caste !== "all" && v.caste !== filters.caste) return false;
      if (filters.religion !== "all" && v.religion !== filters.religion)
        return false;
      if (filters.category !== "all" && v.categoryLabel !== filters.category)
        return false;
      if (filters.gender !== "all" && v.gender !== filters.gender) return false;
      if (filters.booth !== "all" && v.boothNumber !== filters.booth)
        return false;
      if (
        filters.constituency !== "all" &&
        v.constituency !== filters.constituency
      )
        return false;
      return true;
    });
  }, [allVoters, filters]);

  // Charts data
  const casteData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of filtered) {
      if (v.caste) map[v.caste] = (map[v.caste] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [filtered]);

  const religionData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of filtered) {
      if (v.religion) map[v.religion] = (map[v.religion] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const talukaData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of filtered) {
      if (v.taluka) map[v.taluka] = (map[v.taluka] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const districtData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of filtered) {
      if (v.district) map[v.district] = (map[v.district] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Category by Taluka stacked bar
  const categoryByTalukaData = useMemo(() => {
    const map: Record<
      string,
      { Supporter: number; Neutral: number; Opponent: number }
    > = {};
    for (const v of filtered) {
      if (!v.taluka) continue;
      if (!map[v.taluka])
        map[v.taluka] = { Supporter: 0, Neutral: 0, Opponent: 0 };
      const cat = v.categoryLabel as "Supporter" | "Neutral" | "Opponent";
      if (cat && map[v.taluka][cat] !== undefined) {
        map[v.taluka][cat]++;
      }
    }
    return Object.entries(map).map(([taluka, counts]) => ({
      taluka,
      ...counts,
    }));
  }, [filtered]);

  const boothData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of filtered) {
      if (v.boothNumber) map[v.boothNumber] = (map[v.boothNumber] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtered]);

  const uniqueTalukas = useMemo(
    () => new Set(filtered.map((v) => v.taluka).filter(Boolean)).size,
    [filtered],
  );
  const uniqueCastes = useMemo(
    () => new Set(filtered.map((v) => v.caste).filter(Boolean)).size,
    [filtered],
  );
  const uniqueReligions = useMemo(
    () => new Set(filtered.map((v) => v.religion).filter(Boolean)).size,
    [filtered],
  );
  const volunteers = useMemo(
    () => filtered.filter((v) => v.isVolunteer).length,
    [filtered],
  );

  const setFilter = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const FilterSelect = ({
    label,
    filterKey,
    opts,
  }: {
    label: string;
    filterKey: string;
    opts: string[];
  }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-white/80">{label}</span>
      <Select
        value={filters[filterKey as keyof typeof filters]}
        onValueChange={(v) => setFilter(filterKey, v)}
      >
        <SelectTrigger
          className="h-9 text-sm border-white/30 text-[#0b0854]"
          style={{ background: "#e3dec5" }}
          data-ocid={`analytics.${filterKey}.select`}
        >
          <SelectValue placeholder={`All ${label}`} />
        </SelectTrigger>
        <SelectContent style={{ background: "white" }}>
          <SelectItem value="all">All {label}</SelectItem>
          {opts.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(11,8,84,0.1)" }}
        >
          <BarChart2 className="w-5 h-5" style={{ color: "#0b0854" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0b0854" }}>
            Advanced Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            In-depth voter breakdown by taluka, caste, religion, district &amp;
            category
          </p>
        </div>
      </div>

      {/* Filter Panel */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#0b0854" }}
        data-ocid="analytics.filters.panel"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Filters</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <FilterSelect
            label="Taluka"
            filterKey="taluka"
            opts={options.taluka}
          />
          <FilterSelect
            label="District"
            filterKey="district"
            opts={options.district}
          />
          <FilterSelect
            label="Ward/Area"
            filterKey="ward"
            opts={options.ward}
          />
          <FilterSelect label="Caste" filterKey="caste" opts={options.caste} />
          <FilterSelect
            label="Religion"
            filterKey="religion"
            opts={options.religion}
          />
          <FilterSelect
            label="Category"
            filterKey="category"
            opts={options.category}
          />
          <FilterSelect
            label="Gender"
            filterKey="gender"
            opts={options.gender}
          />
          <FilterSelect
            label="Booth No."
            filterKey="booth"
            opts={options.booth}
          />
          <FilterSelect
            label="Constituency"
            filterKey="constituency"
            opts={options.constituency}
          />
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-5 gap-4"
        data-ocid="analytics.stats.section"
      >
        <StatCard
          title="Total Voters"
          value={filtered.length}
          icon={Users}
          color="#0b0854"
        />
        <StatCard
          title="Unique Talukas"
          value={uniqueTalukas}
          icon={MapPin}
          color="#16c784"
        />
        <StatCard
          title="Unique Castes"
          value={uniqueCastes}
          icon={BarChart2}
          color="#f97316"
        />
        <StatCard
          title="Unique Religions"
          value={uniqueReligions}
          icon={BarChart2}
          color="#a855f7"
        />
        <StatCard
          title="Volunteers"
          value={volunteers}
          icon={Users}
          color="#06b6d4"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Caste Distribution - horizontal bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Caste Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {casteData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={casteData}
                    layout="vertical"
                    margin={{ left: 80, right: 16, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {casteData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Religion Distribution - pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Religion Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {religionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={religionData}
                      cx="50%"
                      cy="45%"
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine
                    >
                      {religionData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taluka-wise Voter Count - vertical bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Taluka-wise Voter Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {talukaData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={talukaData}
                    margin={{ left: 8, right: 16, top: 8, bottom: 90 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      height={80}
                      tick={(props) => {
                        const { x, y, payload } = props as {
                          x: number;
                          y: number;
                          payload: { value: string };
                        };
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={16}
                              textAnchor="end"
                              fontSize={9}
                              transform="rotate(-40)"
                            >
                              {payload.value}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {talukaData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </CardContent>
        </Card>

        {/* District Breakdown - pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              District Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {districtData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={districtData}
                      cx="50%"
                      cy="45%"
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine
                    >
                      {districtData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category by Taluka - stacked bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Category by Taluka
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {categoryByTalukaData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryByTalukaData}
                    margin={{ left: 8, right: 16, top: 8, bottom: 90 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="taluka"
                      interval={0}
                      height={80}
                      tick={(props) => {
                        const { x, y, payload } = props as {
                          x: number;
                          y: number;
                          payload: { value: string };
                        };
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={16}
                              textAnchor="end"
                              fontSize={9}
                              transform="rotate(-40)"
                            >
                              {payload.value}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Supporter" stackId="a" fill="#16c784" />
                    <Bar dataKey="Neutral" stackId="a" fill="#f97316" />
                    <Bar
                      dataKey="Opponent"
                      stackId="a"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booth-wise Count - horizontal bar top 10 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Top 10 Booths by Voter Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {boothData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={boothData}
                    layout="vertical"
                    margin={{ left: 80, right: 16, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {boothData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center text-xs pb-4" style={{ color: "#000000" }}>
        © 2026. Made by Tattva Innovation
      </footer>
    </div>
  );
}
