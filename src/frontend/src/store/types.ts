export type UserRole = 'superAdmin' | 'dataEntry' | 'viewer';

export interface User {
  userId: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  mobile?: string;
  createdAt: number;
}

export interface Session {
  userId: string;
  token: string;
  lastActivity: number;
}

export interface DropdownOption {
  id: string;
  label: string;
  category: string;
  sortOrder: number;
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'yesno' | 'dropdown' | 'multiselect';

export interface CustomField {
  fieldId: string;
  label: string;
  fieldType: CustomFieldType;
  options: string[];
  sortOrder: number;
  createdAt: number;
}

export interface CustomFieldValue {
  fieldId: string;
  value: string;
}

export interface VoterRecord {
  id: string;
  voterId: string;
  fullName: string;
  fatherHusbandName?: string;
  gender?: string;
  dateOfBirth?: string;
  mobile?: string;
  alternateMobile?: string;
  address?: string;
  landmark?: string;
  taluka?: string;
  district?: string;
  boothNumber?: string;
  ward?: string;
  constituency?: string;
  education?: string;
  profession?: string;
  professionalCategory?: string;
  organizationName?: string;
  maritalStatus?: string;
  caste?: string;
  religion?: string;
  categoryLabel?: string;
  influenceLevel?: number;
  isVolunteer?: boolean;
  notes?: string;
  photoUrl?: string;
  signatureUrl?: string;
  idProofUrl?: string;
  educationDocUrl?: string;
  customValues: CustomFieldValue[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface LabelConfig {
  selectedFields: string[];
}

export type VoterFilterState = {
  search: string;
  boothNumber: string;
  ward: string;
  education: string;
  profession: string;
  categoryLabel: string;
  gender: string;
  birthdayMonth: string;
  caste: string;
  organizationName: string;
};
