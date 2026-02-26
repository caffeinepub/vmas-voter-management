import { getVoters, setVoters } from './storage';
import type { VoterRecord, VoterFilterState } from './types';

function generateId(): string {
  return `voter_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllVoters(): VoterRecord[] {
  return getVoters();
}

export function getVoterById(id: string): VoterRecord | null {
  return getVoters().find(v => v.id === id) ?? null;
}

export function getVoterByVoterId(voterId: string): VoterRecord | null {
  return getVoters().find(v => v.voterId === voterId) ?? null;
}

export function addVoter(data: Omit<VoterRecord, 'id' | 'createdAt' | 'updatedAt'>): VoterRecord {
  const voters = getVoters();
  const now = Date.now();
  const voter: VoterRecord = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  voters.push(voter);
  setVoters(voters);
  return voter;
}

export function updateVoter(id: string, data: Partial<VoterRecord>): VoterRecord | null {
  const voters = getVoters();
  const idx = voters.findIndex(v => v.id === id);
  if (idx === -1) return null;
  voters[idx] = { ...voters[idx], ...data, updatedAt: Date.now() };
  setVoters(voters);
  return voters[idx];
}

export function deleteVoter(id: string): boolean {
  const voters = getVoters();
  const filtered = voters.filter(v => v.id !== id);
  if (filtered.length === voters.length) return false;
  setVoters(filtered);
  return true;
}

export function filterVoters(filters: VoterFilterState): VoterRecord[] {
  const voters = getVoters();
  const { search, boothNumber, ward, education, profession, categoryLabel, gender, birthdayMonth, caste, organizationName } = filters;

  return voters.filter(v => {
    // Text search
    if (search) {
      const q = search.toLowerCase();
      const match = (
        v.fullName.toLowerCase().includes(q) ||
        v.voterId.toLowerCase().includes(q) ||
        (v.mobile?.includes(q) ?? false) ||
        (v.alternateMobile?.includes(q) ?? false)
      );
      if (!match) return false;
    }

    if (boothNumber && !(v.boothNumber?.toLowerCase().includes(boothNumber.toLowerCase()))) return false;
    if (ward && !(v.ward?.toLowerCase().includes(ward.toLowerCase()))) return false;
    if (education && v.education !== education) return false;
    if (profession && !(v.profession?.toLowerCase().includes(profession.toLowerCase()))) return false;
    if (categoryLabel && v.categoryLabel !== categoryLabel) return false;
    if (gender && v.gender !== gender) return false;
    if (caste && !(v.caste?.toLowerCase().includes(caste.toLowerCase()))) return false;
    if (organizationName && !(v.organizationName?.toLowerCase().includes(organizationName.toLowerCase()))) return false;

    if (birthdayMonth) {
      if (!v.dateOfBirth) return false;
      const dob = new Date(v.dateOfBirth);
      const month = dob.getMonth(); // 0-indexed
      if (month !== parseInt(birthdayMonth)) return false;
    }

    return true;
  });
}

export function exportToCSV(voters: VoterRecord[]): string {
  const headers = [
    'Voter ID', 'Full Name', 'Father/Husband Name', 'Gender', 'Date of Birth',
    'Mobile', 'Alternate Mobile', 'Address', 'Landmark', 'Taluka', 'District',
    'Booth Number', 'Ward', 'Constituency', 'Education', 'Profession',
    'Professional Category', 'Organization', 'Marital Status', 'Caste',
    'Religion', 'Category', 'Influence Level', 'Volunteer', 'Notes',
    'Created At',
  ];

  const escapeCSV = (val: string | undefined | null | boolean | number): string => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = voters.map(v => [
    v.voterId, v.fullName, v.fatherHusbandName, v.gender, v.dateOfBirth,
    v.mobile, v.alternateMobile, v.address, v.landmark, v.taluka, v.district,
    v.boothNumber, v.ward, v.constituency, v.education, v.profession,
    v.professionalCategory, v.organizationName, v.maritalStatus, v.caste,
    v.religion, v.categoryLabel, v.influenceLevel, v.isVolunteer ? 'Yes' : 'No', v.notes,
    new Date(v.createdAt).toLocaleDateString(),
  ].map(escapeCSV).join(','));

  return [headers.join(','), ...rows].join('\n');
}
