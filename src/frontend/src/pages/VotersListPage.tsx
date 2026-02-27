import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { filterVoters, deleteVoter, exportToCSV } from '../store/voters';
import { getOptionsByCategory } from '../store/dropdowns';
import type { VoterRecord, VoterFilterState } from '../store/types';
import type { PageRoute } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Search, Filter, Download, Trash2, Edit, Eye, ChevronLeft, ChevronRight,
  X, Star, MessageSquare, AlertCircle, Copy,
} from 'lucide-react';

const PAGE_SIZE = 20;

const MONTHS = [
  { value: '0', label: 'January' }, { value: '1', label: 'February' },
  { value: '2', label: 'March' }, { value: '3', label: 'April' },
  { value: '4', label: 'May' }, { value: '5', label: 'June' },
  { value: '6', label: 'July' }, { value: '7', label: 'August' },
  { value: '8', label: 'September' }, { value: '9', label: 'October' },
  { value: '10', label: 'November' }, { value: '11', label: 'December' },
];

function CategoryBadge({ value }: { value?: string }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  const cls = value === 'Supporter' ? 'badge-supporter' : value === 'Opponent' ? 'badge-opponent' : 'badge-neutral';
  return <span className={cls}>{value}</span>;
}

function StarRating({ value }: { value?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={`star-pos-${i + 1}`} className={`w-3.5 h-3.5 ${i < (value || 0) ? 'star-filled fill-current' : 'star-empty'}`} />
      ))}
    </div>
  );
}

interface VotersListPageProps {
  onNavigate: (page: PageRoute, id?: string) => void;
}

export default function VotersListPage({ onNavigate }: VotersListPageProps) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<VoterFilterState>({
    search: '', boothNumber: '', ward: '', education: '', profession: '',
    categoryLabel: '', gender: '', birthdayMonth: '', caste: '', organizationName: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<VoterRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);

  const educationOptions = useMemo(() => getOptionsByCategory('education'), []);
  const isSuperAdmin = user?.role === 'superAdmin';

  const filteredVoters = useMemo(() => {
    void refreshKey; // reactive dependency for re-fetching after delete
    return filterVoters(filters);
  }, [filters, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filteredVoters.length / PAGE_SIZE));
  const paginatedVoters = filteredVoters.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateFilter = useCallback(<K extends keyof VoterFilterState>(key: K, value: VoterFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '', boothNumber: '', ward: '', education: '', profession: '',
      categoryLabel: '', gender: '', birthdayMonth: '', caste: '', organizationName: '',
    });
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => k !== 'search' && v !== '')
    .length;

  const allPageSelected = paginatedVoters.length > 0 && paginatedVoters.every(v => selectedIds.has(v.id));
  const somePageSelected = paginatedVoters.some(v => selectedIds.has(v.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
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
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedVoters = useMemo(
    () => filteredVoters.filter(v => selectedIds.has(v.id)),
    [filteredVoters, selectedIds],
  );

  const handleCopyMobiles = useCallback(() => {
    const mobiles = selectedVoters.map(v => v.mobile).filter(Boolean).join(', ');
    if (!mobiles) {
      toast.error('No mobile numbers available for selected voters.');
      return;
    }
    navigator.clipboard.writeText(mobiles).then(() => {
      toast.success('Mobile numbers copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy to clipboard.');
    });
  }, [selectedVoters]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteVoter(deleteTarget.id);
    toast.success(`Voter "${deleteTarget.fullName}" deleted.`);
    setDeleteTarget(null);
    setRefreshKey(k => k + 1);
  }, [deleteTarget]);

  const handleExportCSV = useCallback(() => {
    const csv = exportToCSV(filteredVoters);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voters_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredVoters.length} voters to CSV.`);
  }, [filteredVoters]);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: '#0b0854' }}>Voters</h1>
          <p className="text-sm text-muted-foreground">{filteredVoters.length} voter{filteredVoters.length !== 1 ? 's' : ''}</p>
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
          {isSuperAdmin && (
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          )}
          {(isSuperAdmin || user?.role === 'dataEntry') && (
            <Button size="sm" onClick={() => onNavigate('voter-add')} className="gap-2">
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
            onChange={e => updateFilter('search', e.target.value)}
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
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs flex items-center justify-center text-white"
              style={{ background: '#0b0854' }}>
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-lg p-4" style={{ background: '#0b0854' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Filters</span>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs gap-1 text-white hover:text-white hover:bg-white/20">
              <X className="w-3 h-3" />
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <span className="text-xs text-white mb-1 block">Booth Number</span>
              <Input
                id="filter-booth"
                value={filters.boothNumber}
                onChange={e => updateFilter('boothNumber', e.target.value)}
                placeholder="Booth…"
                className="h-8 text-sm bg-white text-[#0b0854] border-white placeholder:text-[#0b0854]/50"
              />
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Ward</span>
              <Input
                id="filter-ward"
                value={filters.ward}
                onChange={e => updateFilter('ward', e.target.value)}
                placeholder="Ward…"
                className="h-8 text-sm bg-white text-[#0b0854] border-white placeholder:text-[#0b0854]/50"
              />
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Education</span>
              <Select value={filters.education} onValueChange={v => updateFilter('education', v === '_all' ? '' : v)}>
                <SelectTrigger className="filter-select-trigger h-8 text-sm w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All</SelectItem>
                  {educationOptions.map(o => (
                    <SelectItem key={o.id} value={o.label}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Category</span>
              <Select value={filters.categoryLabel} onValueChange={v => updateFilter('categoryLabel', v === '_all' ? '' : v)}>
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
              <Select value={filters.gender} onValueChange={v => updateFilter('gender', v === '_all' ? '' : v)}>
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
              <span className="text-xs text-white mb-1 block">Birthday Month</span>
              <Select value={filters.birthdayMonth} onValueChange={v => updateFilter('birthdayMonth', v === '_all' ? '' : v)}>
                <SelectTrigger className="filter-select-trigger h-8 text-sm w-full">
                  <SelectValue placeholder="Any month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any month</SelectItem>
                  {MONTHS.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Caste</span>
              <Input
                id="filter-caste"
                value={filters.caste}
                onChange={e => updateFilter('caste', e.target.value)}
                placeholder="Caste…"
                className="h-8 text-sm bg-white text-[#0b0854] border-white placeholder:text-[#0b0854]/50"
              />
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Organization</span>
              <Input
                id="filter-org"
                value={filters.organizationName}
                onChange={e => updateFilter('organizationName', e.target.value)}
                placeholder="Organization…"
                className="h-8 text-sm bg-white text-[#0b0854] border-white placeholder:text-[#0b0854]/50"
              />
            </div>
            <div>
              <span className="text-xs text-white mb-1 block">Profession</span>
              <Input
                id="filter-profession"
                value={filters.profession}
                onChange={e => updateFilter('profession', e.target.value)}
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
              <tr className="border-b border-border" style={{ background: 'oklch(0.96 0.008 240)' }}>
                <th className="px-3 py-2.5 w-8">
                  <Checkbox
                    checked={allPageSelected}
                    data-state={somePageSelected && !allPageSelected ? 'indeterminate' : undefined}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all on page"
                  />
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Photo</th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Voter ID</th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Name</th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Mobile</th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Ward</th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Booth</th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Category</th>
                <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Influence</th>
                <th className="px-3 py-2.5 text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVoters.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-30" />
                      <span>No voters found matching your criteria</span>
                      {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginatedVoters.map((voter, idx) => (
                <tr
                  key={voter.id}
                  className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  style={idx % 2 === 1 ? { background: 'oklch(0.98 0.004 240)' } : undefined}
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
                      {voter.photoUrl && <AvatarImage src={voter.photoUrl} alt={voter.fullName} />}
                      <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                        {voter.fullName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono-data text-xs text-muted-foreground">{voter.voterId}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      className="font-medium hover:underline hover:text-primary text-left"
                      onClick={() => onNavigate('voter-detail', voter.id)}
                    >
                      {voter.fullName}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground font-mono-data text-xs">
                    {voter.mobile || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{voter.ward || '—'}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{voter.boothNumber || '—'}</td>
                  <td className="px-3 py-2.5">
                    <CategoryBadge value={voter.categoryLabel} />
                  </td>
                  <td className="px-3 py-2.5">
                    <StarRating value={voter.influenceLevel} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                        onClick={() => onNavigate('voter-detail', voter.id)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {(isSuperAdmin || user?.role === 'dataEntry') && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                          onClick={() => onNavigate('voter-edit', voter.id)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {isSuperAdmin && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(voter)}>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {filteredVoters.length} results
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0"
                disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0 text-xs"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" className="h-7 w-7 p-0"
                disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.fullName}</strong>? This action cannot be undone.
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
              Direct SMS integration is not available yet. Please contact your administrator to enable SMS service.
            </div>
            <p className="text-sm text-muted-foreground">
              You have selected <strong>{selectedIds.size}</strong> voter{selectedIds.size !== 1 ? 's' : ''}.
              You can copy their mobile numbers and use an external SMS tool.
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
    </div>
  );
}
