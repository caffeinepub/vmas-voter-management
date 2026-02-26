import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { Users, TrendingUp, Heart, ThumbsDown, Calendar, UserCheck } from 'lucide-react';
import { getAllVoters } from '../store/voters';
import { format, subMonths, startOfMonth } from 'date-fns';

const CATEGORY_COLORS: Record<string, string> = {
  Supporter: '#16c784',
  Neutral:   '#f97316',
  Opponent:  '#ef4444',
};

const CHART_COLORS = ['#0b0854', '#16c784', '#f97316', '#ef4444', '#a855f7', '#ec4899', '#06b6d4', '#eab308'];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold font-mono-data">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '1a' }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: color }} />
    </Card>
  );
}

function EmptyChart({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-2">
        <span className="text-lg">∅</span>
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function DashboardPage() {
  const voters = useMemo(() => getAllVoters(), []);

  const stats = useMemo(() => {
    const total = voters.length;
    const supporters = voters.filter(v => v.categoryLabel === 'Supporter').length;
    const neutrals = voters.filter(v => v.categoryLabel === 'Neutral').length;
    const opponents = voters.filter(v => v.categoryLabel === 'Opponent').length;
    const volunteers = voters.filter(v => v.isVolunteer).length;
    return { total, supporters, neutrals, opponents, volunteers };
  }, [voters]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of voters) {
      const key = v.categoryLabel || 'Unknown';
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [voters]);

  const genderData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of voters) {
      const key = v.gender || 'Unknown';
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [voters]);

  const educationData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of voters) {
      if (v.education) {
        map[v.education] = (map[v.education] || 0) + 1;
      }
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [voters]);

  const professionData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of voters) {
      if (v.profession) {
        map[v.profession] = (map[v.profession] || 0) + 1;
      }
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [voters]);

  const growthData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = subMonths(now, 11 - i);
      return { month: format(d, 'MMM yy'), start: startOfMonth(d).getTime(), count: 0 };
    });

    for (const v of voters) {
      const ts = v.createdAt;
      for (const m of months) {
        const monthDate = new Date(m.start);
        const nextMonth = subMonths(startOfMonth(new Date()), 11 - months.indexOf(m) - 1);
        if (ts >= m.start && ts < nextMonth.getTime() + (m === months[months.length - 1] ? 999999999 : 0)) {
          m.count++;
          break;
        }
      }
    }

    // Cumulative approach: per-month count
    const perMonth: Record<string, number> = {};
    for (const v of voters) {
      const monthKey = format(new Date(v.createdAt), 'MMM yy');
      perMonth[monthKey] = (perMonth[monthKey] || 0) + 1;
    }

    return months.map(m => ({ month: m.month, voters: perMonth[m.month] || 0 }));
  }, [voters]);

  const birthdayVoters = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return voters.filter(v => {
      if (!v.dateOfBirth) return false;
      return new Date(v.dateOfBirth).getMonth() === currentMonth;
    });
  }, [voters]);

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: '#0b0854' }}>Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of voter data and analytics
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Voters"
          value={stats.total}
          icon={Users}
          color="#0b0854"
          subtitle={`${stats.volunteers} volunteers`}
        />
        <StatCard
          title="Supporters"
          value={stats.supporters}
          icon={UserCheck}
          color="#16c784"
          subtitle={stats.total > 0 ? `${Math.round((stats.supporters / stats.total) * 100)}%` : '0%'}
        />
        <StatCard
          title="Neutrals"
          value={stats.neutrals}
          icon={TrendingUp}
          color="#f97316"
          subtitle={stats.total > 0 ? `${Math.round((stats.neutrals / stats.total) * 100)}%` : '0%'}
        />
        <StatCard
          title="Opponents"
          value={stats.opponents}
          icon={ThumbsDown}
          color="#ef4444"
          subtitle={stats.total > 0 ? `${Math.round((stats.opponents / stats.total) * 100)}%` : '0%'}
        />
      </div>

      {/* Birthday Alert */}
      {birthdayVoters.length > 0 && (
        <Card className="border-l-4" style={{ borderLeftColor: '#d97706' }}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#fef3c7' }}>
                <Calendar className="w-5 h-5" style={{ color: '#d97706' }} />
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">
                  🎂 {birthdayVoters.length} Birthday{birthdayVoters.length > 1 ? 's' : ''} This Month
                </div>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2">
                  {birthdayVoters.slice(0, 8).map(v => (
                    <span key={v.id} className="font-medium text-foreground">{v.fullName}</span>
                  ))}
                  {birthdayVoters.length > 8 && (
                    <span>and {birthdayVoters.length - 8} more…</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, idx) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>
          </CardContent>
        </Card>

        {/* Gender Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              {genderData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {genderData.map((entry, idx) => (
                        <Cell key={entry.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Education Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Education Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {educationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={educationData} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>
          </CardContent>
        </Card>

        {/* Profession Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Profession Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {professionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={professionData} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voter Growth Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            Voter Growth (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            {growthData.some(d => d.voters > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="voters"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f97316' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyChart message="No voters added yet — register some voters to see growth trends" />}
          </div>
        </CardContent>
      </Card>

      <footer className="text-center text-xs text-muted-foreground pb-4">
        © 2026. Built with ❤️ using{' '}
        <a href="https://caffeine.ai" className="underline hover:opacity-80">caffeine.ai</a>
      </footer>
    </div>
  );
}
