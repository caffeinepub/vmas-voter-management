import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getVoterById, deleteVoter } from '../store/voters';
import { getAllCustomFields } from '../store/customFields';
import type { VoterRecord, CustomField } from '../store/types';
import type { PageRoute } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { toast } from 'sonner';
import { ArrowLeft, Edit, Trash2, Star, FileText, Check, X as XIcon } from 'lucide-react';
import { format } from 'date-fns';

interface VoterDetailPageProps {
  onNavigate: (page: PageRoute, id?: string) => void;
  voterId: string;
}

function CategoryBadge({ value }: { value?: string }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const cls = value === 'Supporter' ? 'badge-supporter' : value === 'Opponent' ? 'badge-opponent' : 'badge-neutral';
  return <span className={cls}>{value}</span>;
}

function StarRating({ value }: { value?: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={`detail-star-${i + 1}`} className={`w-4 h-4 ${i < (value || 0) ? 'star-filled fill-current' : 'star-empty'}`} />
      ))}
      {value ? <span className="text-sm text-muted-foreground ml-1">Level {value}</span> : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | boolean | number | null }) {
  if (value === undefined || value === null || value === '') {
    return (
      <div>
        <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
        <dd className="text-sm text-muted-foreground/50">—</dd>
      </div>
    );
  }
  if (typeof value === 'boolean') {
    return (
      <div>
        <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
        <dd className="text-sm flex items-center gap-1">
          {value ? <Check className="w-3.5 h-3.5 text-green-600" /> : <XIcon className="w-3.5 h-3.5 text-muted-foreground" />}
          {value ? 'Yes' : 'No'}
        </dd>
      </div>
    );
  }
  return (
    <div>
      <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
      <dd className="text-sm font-medium">{String(value)}</dd>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section-card">
      <div className="section-title">{title}</div>
      {children}
    </div>
  );
}

function CustomFieldValue({ field, value }: { field: CustomField; value: string }) {
  if (!value) return <Field label={field.label} value={null} />;
  if (field.fieldType === 'yesno') {
    return <Field label={field.label} value={value === 'yes'} />;
  }
  if (field.fieldType === 'multiselect') {
    return (
      <div>
        <dt className="text-xs text-muted-foreground mb-1">{field.label}</dt>
        <dd className="flex flex-wrap gap-1">
          {value.split(',').filter(Boolean).map(v => (
            <span key={v} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">{v}</span>
          ))}
        </dd>
      </div>
    );
  }
  return <Field label={field.label} value={value} />;
}

export default function VoterDetailPage({ onNavigate, voterId }: VoterDetailPageProps) {
  const { user } = useAuth();
  const [voter, setVoter] = useState<VoterRecord | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [customFields] = useState(() => getAllCustomFields());

  useEffect(() => {
    const v = getVoterById(voterId);
    setVoter(v);
  }, [voterId]);

  if (!voter) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          <p>Voter not found.</p>
          <Button variant="link" onClick={() => onNavigate('voters')}>Back to list</Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteVoter(voter.id);
    toast.success(`Voter "${voter.fullName}" deleted.`);
    onNavigate('voters');
  };

  const isSuperAdmin = user?.role === 'superAdmin';
  const canEdit = isSuperAdmin || user?.role === 'dataEntry';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => onNavigate('voters')}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">{voter.fullName}</h1>
            <p className="text-sm text-muted-foreground font-mono-data">{voter.voterId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => onNavigate('voter-edit', voter.id)}>
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          )}
          {isSuperAdmin && (
            <Button variant="outline" size="sm" className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setShowDelete(true)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Hero Card */}
      <div className="section-card flex items-start gap-6 flex-wrap">
        <div className="shrink-0">
          <Avatar className="w-24 h-24 border-2 border-border">
            {voter.photoUrl && <AvatarImage src={voter.photoUrl} alt={voter.fullName} className="object-cover" />}
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {voter.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <h2 className="font-display text-xl font-bold">{voter.fullName}</h2>
            <CategoryBadge value={voter.categoryLabel} />
            {voter.isVolunteer && (
              <span className="badge-supporter">Volunteer</span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Voter ID" value={voter.voterId} />
            <Field label="Gender" value={voter.gender} />
            <Field label="Mobile" value={voter.mobile} />
            <Field label="Ward" value={voter.ward} />
          </div>
          <div className="mt-3">
            <dt className="text-xs text-muted-foreground mb-1">Influence Level</dt>
            <StarRating value={voter.influenceLevel} />
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <SectionCard title="Personal Information">
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Father / Husband Name" value={voter.fatherHusbandName} />
          <Field label="Date of Birth" value={voter.dateOfBirth ? format(new Date(voter.dateOfBirth), 'dd MMM yyyy') : undefined} />
          <Field label="Alternate Mobile" value={voter.alternateMobile} />
          <Field label="Marital Status" value={voter.maritalStatus} />
          <Field label="Caste" value={voter.caste} />
          <Field label="Religion" value={voter.religion} />
        </dl>
      </SectionCard>

      {/* Location */}
      <SectionCard title="Location">
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 md:col-span-3">
            <Field label="Address" value={voter.address} />
          </div>
          <Field label="Landmark" value={voter.landmark} />
          <Field label="Taluka" value={voter.taluka} />
          <Field label="District" value={voter.district} />
          <Field label="Booth Number" value={voter.boothNumber} />
          <Field label="Ward" value={voter.ward} />
          <Field label="Constituency" value={voter.constituency} />
        </dl>
      </SectionCard>

      {/* Professional */}
      <SectionCard title="Professional Information">
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Education" value={voter.education} />
          <Field label="Profession" value={voter.profession} />
          <Field label="Professional Category" value={voter.professionalCategory} />
          <Field label="Organization" value={voter.organizationName} />
        </dl>
      </SectionCard>

      {/* Political */}
      <SectionCard title="Political Information">
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs text-muted-foreground mb-1">Category</dt>
            <dd><CategoryBadge value={voter.categoryLabel} /></dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground mb-1">Influence Level</dt>
            <dd><StarRating value={voter.influenceLevel} /></dd>
          </div>
          <Field label="Volunteer" value={voter.isVolunteer} />
        </dl>
        {voter.notes && (
          <div className="mt-4">
            <dt className="text-xs text-muted-foreground mb-1">Notes</dt>
            <dd className="text-sm bg-muted/50 rounded-lg p-3">{voter.notes}</dd>
          </div>
        )}
      </SectionCard>

      {/* Documents */}
      {(voter.signatureUrl || voter.idProofUrl || voter.educationDocUrl) && (
        <SectionCard title="Documents">
          <div className="flex flex-wrap gap-4">
            {voter.signatureUrl && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Signature</dt>
                <img src={voter.signatureUrl} alt="Signature" className="h-16 border rounded object-contain" />
              </div>
            )}
            {voter.idProofUrl && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">ID Proof</dt>
                <a href={voter.idProofUrl} download className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="w-4 h-4" /> Download
                </a>
              </div>
            )}
            {voter.educationDocUrl && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Educational Documents</dt>
                <a href={voter.educationDocUrl} download className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="w-4 h-4" /> Download
                </a>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Custom Fields */}
      {customFields.length > 0 && (
        <SectionCard title="Custom Fields">
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {customFields.map(cf => {
              const cv = voter.customValues.find(v => v.fieldId === cf.fieldId);
              return <CustomFieldValue key={cf.fieldId} field={cf} value={cv?.value ?? ''} />;
            })}
          </dl>
        </SectionCard>
      )}

      {/* Metadata */}
      <div className="text-xs text-muted-foreground flex gap-6 pb-6">
        <span>Created: {format(new Date(voter.createdAt), 'dd MMM yyyy, HH:mm')}</span>
        <span>Updated: {format(new Date(voter.updatedAt), 'dd MMM yyyy, HH:mm')}</span>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{voter.fullName}</strong>? This action cannot be undone.
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
