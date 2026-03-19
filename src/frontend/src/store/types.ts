export type UserRole = "superAdmin" | "dataEntry" | "viewer";

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

export type CustomFieldType =
  | "text"
  | "number"
  | "date"
  | "yesno"
  | "dropdown"
  | "multiselect";

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

export interface MessageTemplate {
  id: string;
  name: string;
  genderTag: "Male" | "Female" | "All";
  body: string;
  createdAt: number;
  updatedAt: number;
}

export type TaskType =
  | "Follow-up Call"
  | "Field Visit"
  | "Campaign Event"
  | "Other";
export type TaskStatus = "Pending" | "In Progress" | "Done";

export interface Task {
  id: string;
  title: string;
  taskType: TaskType;
  assignedTo: string;
  assignedToName: string;
  linkedVoterId?: string;
  linkedVoterName?: string;
  dueDate?: string;
  status: TaskStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface ElectionResult {
  id: string;
  year: string;
  electionType: string;
  candidateName: string;
  party: string;
  votesReceived: number;
  taluka: string;
  village?: string;
  booth?: string;
  ward?: string;
  createdAt: number;
  createdBy: string;
}

export interface FieldNote {
  id: string;
  text: string;
  taluka: string;
  village?: string;
  booth?: string;
  ward?: string;
  imageUrl?: string;
  imageName?: string;
  pdfUrl?: string;
  pdfName?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  createdByName: string;
}
