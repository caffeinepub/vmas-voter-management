import type { User, Session, VoterRecord, DropdownOption, CustomField, LabelConfig } from './types';

const KEYS = {
  users: 'vmas_users',
  sessions: 'vmas_sessions',
  voters: 'vmas_voters',
  dropdownOptions: 'vmas_dropdown_options',
  customFields: 'vmas_custom_fields',
  labelConfig: 'vmas_label_config',
} as const;

function getItem<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getObject<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function setObject<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- Users ----
export function getUsers(): User[] {
  return getItem<User>(KEYS.users);
}

export function setUsers(users: User[]): void {
  setItem(KEYS.users, users);
}

// ---- Sessions ----
export function getSessions(): Session[] {
  return getItem<Session>(KEYS.sessions);
}

export function setSessions(sessions: Session[]): void {
  setItem(KEYS.sessions, sessions);
}

// ---- Voters ----
export function getVoters(): VoterRecord[] {
  return getItem<VoterRecord>(KEYS.voters);
}

export function setVoters(voters: VoterRecord[]): void {
  setItem(KEYS.voters, voters);
}

// ---- Dropdown Options ----
export function getDropdownOptions(): DropdownOption[] {
  return getItem<DropdownOption>(KEYS.dropdownOptions);
}

export function setDropdownOptions(options: DropdownOption[]): void {
  setItem(KEYS.dropdownOptions, options);
}

// ---- Custom Fields ----
export function getCustomFields(): CustomField[] {
  return getItem<CustomField>(KEYS.customFields);
}

export function setCustomFields(fields: CustomField[]): void {
  setItem(KEYS.customFields, fields);
}

// ---- Label Config ----
export function getLabelConfig(): LabelConfig {
  return getObject<LabelConfig>(KEYS.labelConfig, { selectedFields: ['fullName', 'voterId', 'mobile', 'ward', 'boothNumber'] });
}

export function setLabelConfig(config: LabelConfig): void {
  setObject(KEYS.labelConfig, config);
}

// ---- Seed default data ----
export function seedDefaultData(): void {
  const users = getUsers();
  if (users.length === 0) {
    setUsers([
      {
        userId: 'user_1',
        username: 'admin',
        passwordHash: 'admin123',
        role: 'superAdmin',
        mobile: '9999999999',
        createdAt: Date.now(),
      },
      {
        userId: 'user_2',
        username: 'dataentry',
        passwordHash: 'data123',
        role: 'dataEntry',
        createdAt: Date.now(),
      },
      {
        userId: 'user_3',
        username: 'viewer',
        passwordHash: 'view123',
        role: 'viewer',
        createdAt: Date.now(),
      },
    ]);
  }

  const options = getDropdownOptions();
  if (options.length === 0) {
    const now = Date.now();
    const defaultOptions: DropdownOption[] = [
      // Category Labels
      { id: 'cat_1', label: 'Supporter', category: 'categoryLabel', sortOrder: 1 },
      { id: 'cat_2', label: 'Neutral', category: 'categoryLabel', sortOrder: 2 },
      { id: 'cat_3', label: 'Opponent', category: 'categoryLabel', sortOrder: 3 },
      // Gender
      { id: 'gen_1', label: 'Male', category: 'gender', sortOrder: 1 },
      { id: 'gen_2', label: 'Female', category: 'gender', sortOrder: 2 },
      { id: 'gen_3', label: 'Other', category: 'gender', sortOrder: 3 },
      // Education
      { id: 'edu_1', label: 'Primary', category: 'education', sortOrder: 1 },
      { id: 'edu_2', label: 'Secondary', category: 'education', sortOrder: 2 },
      { id: 'edu_3', label: 'Higher Secondary', category: 'education', sortOrder: 3 },
      { id: 'edu_4', label: 'Graduate', category: 'education', sortOrder: 4 },
      { id: 'edu_5', label: 'Post Graduate', category: 'education', sortOrder: 5 },
      { id: 'edu_6', label: 'Doctorate', category: 'education', sortOrder: 6 },
      // Religion
      { id: 'rel_1', label: 'Hindu', category: 'religion', sortOrder: 1 },
      { id: 'rel_2', label: 'Muslim', category: 'religion', sortOrder: 2 },
      { id: 'rel_3', label: 'Christian', category: 'religion', sortOrder: 3 },
      { id: 'rel_4', label: 'Sikh', category: 'religion', sortOrder: 4 },
      { id: 'rel_5', label: 'Buddhist', category: 'religion', sortOrder: 5 },
      { id: 'rel_6', label: 'Jain', category: 'religion', sortOrder: 6 },
      { id: 'rel_7', label: 'Other', category: 'religion', sortOrder: 7 },
      // Marital Status
      { id: 'mar_1', label: 'Single', category: 'maritalStatus', sortOrder: 1 },
      { id: 'mar_2', label: 'Married', category: 'maritalStatus', sortOrder: 2 },
      { id: 'mar_3', label: 'Widowed', category: 'maritalStatus', sortOrder: 3 },
      { id: 'mar_4', label: 'Divorced', category: 'maritalStatus', sortOrder: 4 },
      // Profession
      { id: 'pro_1', label: 'Farmer', category: 'profession', sortOrder: 1 },
      { id: 'pro_2', label: 'Business', category: 'profession', sortOrder: 2 },
      { id: 'pro_3', label: 'Government Employee', category: 'profession', sortOrder: 3 },
      { id: 'pro_4', label: 'Private Employee', category: 'profession', sortOrder: 4 },
      { id: 'pro_5', label: 'Student', category: 'profession', sortOrder: 5 },
      { id: 'pro_6', label: 'Homemaker', category: 'profession', sortOrder: 6 },
      { id: 'pro_7', label: 'Retired', category: 'profession', sortOrder: 7 },
      // Professional Category
      { id: 'prc_1', label: 'Agriculture', category: 'professionalCategory', sortOrder: 1 },
      { id: 'prc_2', label: 'Commerce', category: 'professionalCategory', sortOrder: 2 },
      { id: 'prc_3', label: 'Service', category: 'professionalCategory', sortOrder: 3 },
      { id: 'prc_4', label: 'Self-Employed', category: 'professionalCategory', sortOrder: 4 },
      // Booth
      { id: 'bth_1', label: 'Booth 1', category: 'booth', sortOrder: 1 },
      { id: 'bth_2', label: 'Booth 2', category: 'booth', sortOrder: 2 },
      { id: 'bth_3', label: 'Booth 3', category: 'booth', sortOrder: 3 },
      // Ward
      { id: 'wrd_1', label: 'Ward A', category: 'ward', sortOrder: 1 },
      { id: 'wrd_2', label: 'Ward B', category: 'ward', sortOrder: 2 },
      { id: 'wrd_3', label: 'Ward C', category: 'ward', sortOrder: 3 },
      // Constituency
      { id: 'con_1', label: 'North Constituency', category: 'constituency', sortOrder: 1 },
      { id: 'con_2', label: 'South Constituency', category: 'constituency', sortOrder: 2 },
      { id: 'con_3', label: 'East Constituency', category: 'constituency', sortOrder: 3 },
      // Taluka
      { id: 'tal_1', label: 'Taluka 1', category: 'taluka', sortOrder: 1 },
      { id: 'tal_2', label: 'Taluka 2', category: 'taluka', sortOrder: 2 },
      // District
      { id: 'dis_1', label: 'District A', category: 'district', sortOrder: 1 },
      { id: 'dis_2', label: 'District B', category: 'district', sortOrder: 2 },
      // Caste
      { id: 'cst_1', label: 'General', category: 'caste', sortOrder: 1 },
      { id: 'cst_2', label: 'OBC', category: 'caste', sortOrder: 2 },
      { id: 'cst_3', label: 'SC', category: 'caste', sortOrder: 3 },
      { id: 'cst_4', label: 'ST', category: 'caste', sortOrder: 4 },
    ].map(o => ({ ...o, sortOrder: o.sortOrder * now })); // make unique sortOrder
    
    const finalOptions = defaultOptions.map((o, idx) => ({ ...o, sortOrder: idx + 1 }));
    setDropdownOptions(finalOptions);
  }
}
