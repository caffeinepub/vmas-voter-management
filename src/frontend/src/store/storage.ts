import type {
  CustomField,
  DropdownOption,
  ElectionResult,
  FieldNote,
  LabelConfig,
  Session,
  User,
  VoterRecord,
} from "./types";

const DATA_VERSION = "v3";
const DATA_VERSION_KEY = "vmas_data_version";

const KEYS = {
  users: "vmas_users",
  sessions: "vmas_sessions",
  voters: "vmas_voters",
  dropdownOptions: "vmas_dropdown_options",
  customFields: "vmas_custom_fields",
  labelConfig: "vmas_label_config",
  vlpElectionResults: "vmas_vlp_election_results",
  vlpFieldNotes: "vmas_vlp_field_notes",
  formLabels: "sm_form_labels",
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
  return getObject<LabelConfig>(KEYS.labelConfig, {
    selectedFields: ["fullName", "voterId", "mobile", "ward", "boothNumber"],
  });
}

export function setLabelConfig(config: LabelConfig): void {
  setObject(KEYS.labelConfig, config);
}

// ---- Form Labels ----
export function getFormLabels(): Record<string, string> {
  return getObject<Record<string, string>>(KEYS.formLabels, {});
}

export function setFormLabels(labels: Record<string, string>): void {
  setObject(KEYS.formLabels, labels);
}

// ---- VLP Election Results ----
export function getElectionResults(): ElectionResult[] {
  return getItem<ElectionResult>(KEYS.vlpElectionResults);
}

export function setElectionResults(results: ElectionResult[]): void {
  setItem(KEYS.vlpElectionResults, results);
}

// ---- VLP Field Notes ----
export function getFieldNotes(): FieldNote[] {
  return getItem<FieldNote>(KEYS.vlpFieldNotes);
}

export function setFieldNotes(notes: FieldNote[]): void {
  setItem(KEYS.vlpFieldNotes, notes);
}

const CASTE_DEFAULTS: DropdownOption[] = [
  { id: "caste_1", label: "Brahmin", category: "caste", sortOrder: 1 },
  { id: "caste_2", label: "Gujarati", category: "caste", sortOrder: 2 },
  { id: "caste_3", label: "Kunbi", category: "caste", sortOrder: 3 },
  { id: "caste_4", label: "Maratha", category: "caste", sortOrder: 4 },
  { id: "caste_5", label: "Teli", category: "caste", sortOrder: 5 },
  { id: "caste_6", label: "Mali", category: "caste", sortOrder: 6 },
  { id: "caste_7", label: "Dhangar", category: "caste", sortOrder: 7 },
  { id: "caste_8", label: "Koli", category: "caste", sortOrder: 8 },
  { id: "caste_9", label: "Chambhar", category: "caste", sortOrder: 9 },
  { id: "caste_10", label: "Mahar", category: "caste", sortOrder: 10 },
  { id: "caste_11", label: "Mang", category: "caste", sortOrder: 11 },
  { id: "caste_12", label: "Banjara", category: "caste", sortOrder: 12 },
  { id: "caste_13", label: "Lingayat", category: "caste", sortOrder: 13 },
  { id: "caste_14", label: "Rajput", category: "caste", sortOrder: 14 },
  { id: "caste_15", label: "Yadav", category: "caste", sortOrder: 15 },
  // Brahmin subcastes
  {
    id: "sc_brahmin_1",
    label: "Kokani",
    category: "subcaste",
    sortOrder: 1,
    parentCategory: "caste",
    parentValue: "Brahmin",
  },
  {
    id: "sc_brahmin_2",
    label: "Saraswat",
    category: "subcaste",
    sortOrder: 2,
    parentCategory: "caste",
    parentValue: "Brahmin",
  },
  {
    id: "sc_brahmin_3",
    label: "Kanyakubja",
    category: "subcaste",
    sortOrder: 3,
    parentCategory: "caste",
    parentValue: "Brahmin",
  },
  {
    id: "sc_brahmin_4",
    label: "Maithil",
    category: "subcaste",
    sortOrder: 4,
    parentCategory: "caste",
    parentValue: "Brahmin",
  },
  {
    id: "sc_brahmin_5",
    label: "Iyer",
    category: "subcaste",
    sortOrder: 5,
    parentCategory: "caste",
    parentValue: "Brahmin",
  },
  {
    id: "sc_brahmin_6",
    label: "Iyengar",
    category: "subcaste",
    sortOrder: 6,
    parentCategory: "caste",
    parentValue: "Brahmin",
  },
  {
    id: "sc_brahmin_7",
    label: "Chitpavan",
    category: "subcaste",
    sortOrder: 7,
    parentCategory: "caste",
    parentValue: "Brahmin",
  },
  {
    id: "sc_brahmin_8",
    label: "Deshastha",
    category: "subcaste",
    sortOrder: 8,
    parentCategory: "caste",
    parentValue: "Brahmin",
  },
  {
    id: "sc_brahmin_9",
    label: "Karhade",
    category: "subcaste",
    sortOrder: 9,
    parentCategory: "caste",
    parentValue: "Brahmin",
  },
  {
    id: "sc_brahmin_10",
    label: "Nagar",
    category: "subcaste",
    sortOrder: 10,
    parentCategory: "caste",
    parentValue: "Brahmin",
  },
  // Maratha subcastes
  {
    id: "sc_maratha_1",
    label: "96 Kuli",
    category: "subcaste",
    sortOrder: 1,
    parentCategory: "caste",
    parentValue: "Maratha",
  },
  {
    id: "sc_maratha_2",
    label: "CKP",
    category: "subcaste",
    sortOrder: 2,
    parentCategory: "caste",
    parentValue: "Maratha",
  },
  {
    id: "sc_maratha_3",
    label: "Kunbi Maratha",
    category: "subcaste",
    sortOrder: 3,
    parentCategory: "caste",
    parentValue: "Maratha",
  },
  // Gujarati subcastes
  {
    id: "sc_gujarati_1",
    label: "Patel",
    category: "subcaste",
    sortOrder: 1,
    parentCategory: "caste",
    parentValue: "Gujarati",
  },
  {
    id: "sc_gujarati_2",
    label: "Leuva Patel",
    category: "subcaste",
    sortOrder: 2,
    parentCategory: "caste",
    parentValue: "Gujarati",
  },
  {
    id: "sc_gujarati_3",
    label: "Kadva Patel",
    category: "subcaste",
    sortOrder: 3,
    parentCategory: "caste",
    parentValue: "Gujarati",
  },
  // Kunbi subcastes
  {
    id: "sc_kunbi_1",
    label: "Tirale Kunbi",
    category: "subcaste",
    sortOrder: 1,
    parentCategory: "caste",
    parentValue: "Kunbi",
  },
  {
    id: "sc_kunbi_2",
    label: "Jadav Kunbi",
    category: "subcaste",
    sortOrder: 2,
    parentCategory: "caste",
    parentValue: "Kunbi",
  },
  // Mali subcastes
  {
    id: "sc_mali_1",
    label: "Phulmali",
    category: "subcaste",
    sortOrder: 1,
    parentCategory: "caste",
    parentValue: "Mali",
  },
  {
    id: "sc_mali_2",
    label: "Marwari Mali",
    category: "subcaste",
    sortOrder: 2,
    parentCategory: "caste",
    parentValue: "Mali",
  },
  // Chambhar subcastes
  {
    id: "sc_chambhar_1",
    label: "Mochi",
    category: "subcaste",
    sortOrder: 1,
    parentCategory: "caste",
    parentValue: "Chambhar",
  },
  {
    id: "sc_chambhar_2",
    label: "Chamar",
    category: "subcaste",
    sortOrder: 2,
    parentCategory: "caste",
    parentValue: "Chambhar",
  },
  // Lingayat subcastes
  {
    id: "sc_lingayat_1",
    label: "Veerashaiva",
    category: "subcaste",
    sortOrder: 1,
    parentCategory: "caste",
    parentValue: "Lingayat",
  },
  {
    id: "sc_lingayat_2",
    label: "Panchamasali",
    category: "subcaste",
    sortOrder: 2,
    parentCategory: "caste",
    parentValue: "Lingayat",
  },
  // Rajput subcastes
  {
    id: "sc_rajput_1",
    label: "Kshatriya",
    category: "subcaste",
    sortOrder: 1,
    parentCategory: "caste",
    parentValue: "Rajput",
  },
  {
    id: "sc_rajput_2",
    label: "Sisodia",
    category: "subcaste",
    sortOrder: 2,
    parentCategory: "caste",
    parentValue: "Rajput",
  },
];

// ---- Mock voter seed data ----
function seedMockVoters(): void {
  if (getVoters().length > 0) return;

  type TalukaInfo = {
    taluka: string;
    district: string;
    code: string;
    villages: string[];
  };

  const talukas: TalukaInfo[] = [
    {
      taluka: "Nashik",
      district: "Nashik District",
      code: "NK",
      villages: ["Ozar", "Sinnar", "Dindori", "Igatpuri"],
    },
    {
      taluka: "Pune",
      district: "Pune District",
      code: "PN",
      villages: ["Hadapsar", "Wakad", "Kothrud", "Pimpri"],
    },
    {
      taluka: "Kolhapur",
      district: "Kolhapur District",
      code: "KL",
      villages: ["Ichalkaranji", "Kagal", "Hatkanangle", "Radhanagari"],
    },
    {
      taluka: "Aurangabad",
      district: "Aurangabad District",
      code: "AB",
      villages: ["Paithan", "Gangapur", "Sillod", "Kannad"],
    },
    {
      taluka: "Nagpur",
      district: "Nagpur District",
      code: "NG",
      villages: ["Kamptee", "Butibori", "Hingna", "Ramtek"],
    },
    {
      taluka: "Solapur",
      district: "Solapur District",
      code: "SL",
      villages: ["Akkalkot", "Barshi", "Mangalwedha", "Pandharpur"],
    },
  ];

  const casteSubcasteMap: Record<string, string[]> = {
    Brahmin: ["Kokani", "Saraswat", "Chitpavan", "Deshastha", "Karhade"],
    Maratha: ["96 Kuli", "CKP", "Kunbi Maratha"],
    Kunbi: ["Tirale Kunbi", "Jadav Kunbi"],
    Gujarati: ["Patel", "Leuva Patel", "Kadva Patel"],
    Teli: [],
    Mali: ["Phulmali", "Marwari Mali"],
    Dhangar: [],
    Koli: [],
    Mahar: [],
    Yadav: [],
    Chambhar: ["Mochi", "Chamar"],
    Lingayat: ["Veerashaiva", "Panchamasali"],
    Rajput: ["Kshatriya", "Sisodia"],
  };

  const castes = Object.keys(casteSubcasteMap);
  const religions = [
    "Hindu",
    "Hindu",
    "Hindu",
    "Muslim",
    "Muslim",
    "Buddhist",
    "Christian",
    "Jain",
    "Sikh",
  ];
  const educations = [
    "Primary",
    "Secondary",
    "Higher Secondary",
    "Graduate",
    "Post Graduate",
  ];
  const professions = [
    "Farmer",
    "Business",
    "Service",
    "Student",
    "Homemaker",
    "Labour",
    "Retired",
  ];
  const categories = [
    "Supporter",
    "Supporter",
    "Neutral",
    "Neutral",
    "Opponent",
  ];
  const maritalStatuses = [
    "Married",
    "Married",
    "Married",
    "Single",
    "Single",
    "Widowed",
    "Divorced",
  ];

  const firstNamesMale = [
    "Rajesh",
    "Suresh",
    "Mahesh",
    "Ramesh",
    "Ganesh",
    "Dinesh",
    "Nilesh",
    "Santosh",
    "Prakash",
    "Rakesh",
    "Vijay",
    "Anil",
    "Sunil",
    "Ajay",
    "Rohit",
    "Amit",
    "Sumit",
    "Nitin",
    "Sachin",
    "Rahul",
  ];
  const firstNamesFemale = [
    "Priya",
    "Sunita",
    "Rekha",
    "Kavita",
    "Anita",
    "Sujata",
    "Vandana",
    "Meena",
    "Lata",
    "Sushma",
    "Archana",
    "Deepa",
    "Pooja",
    "Nisha",
    "Swati",
    "Anjali",
    "Seema",
    "Neha",
    "Shweta",
    "Kiran",
  ];
  const lastNames = [
    "Patil",
    "Deshmukh",
    "Shinde",
    "Jadhav",
    "Pawar",
    "More",
    "Kulkarni",
    "Gaikwad",
    "Bhosale",
    "Kadam",
    "Mane",
    "Chavan",
    "Salunkhe",
    "Yadav",
    "Sharma",
    "Verma",
    "Patel",
    "Shah",
    "Mehta",
    "Joshi",
  ];

  const pick = <T>(arr: T[], seed: number): T => arr[seed % arr.length];

  const voters: VoterRecord[] = [];
  const now = Date.now();

  for (let i = 0; i < 120; i++) {
    const talukaInfo = talukas[i % talukas.length];
    const gender = i % 10 < 6 ? "Male" : "Female";
    const firstName =
      gender === "Male"
        ? pick(firstNamesMale, i * 7)
        : pick(firstNamesFemale, i * 7);
    const lastName = pick(lastNames, i * 3);
    const fullName = `${firstName} ${lastName}`;
    const fatherFirstName = pick(firstNamesMale, i * 11);
    const fatherName = `${fatherFirstName} ${lastName}`;
    const caste = pick(castes, i * 5);
    const subcasteList = casteSubcasteMap[caste];
    const subCaste =
      subcasteList.length > 0 ? pick(subcasteList, i * 3) : undefined;
    const dobYear = 1960 + (i % 46);
    const dobMonth = String((i % 12) + 1).padStart(2, "0");
    const dobDay = String((i % 28) + 1).padStart(2, "0");
    const dateOfBirth = `${dobYear}-${dobMonth}-${dobDay}`;
    const mobilePrefix = ["7", "8", "9"][i % 3];
    const mobileRest = String(100000000 + ((i * 9871) % 900000000)).slice(0, 9);
    const mobile = `${mobilePrefix}${mobileRest}`;
    const ward = `Ward ${(i % 5) + 1}`;
    const boothNumber = `Booth ${(i % 10) + 1}`;
    const village = pick(talukaInfo.villages, i * 2);
    const address = `${(i % 99) + 1}, ${village} Road, Near Panchayat, ${talukaInfo.taluka}`;
    const voterIdNum = String(i + 1).padStart(4, "0");
    const voterId = `MH${talukaInfo.code}${voterIdNum}`;
    const influenceLevel = (i % 5) + 1;
    const isVolunteer = i % 7 === 0;
    const createdAt = now - (120 - i) * 3600000;

    const voter: VoterRecord = {
      id: `mock_voter_${i + 1}`,
      voterId,
      fullName,
      fatherHusbandName: fatherName,
      gender,
      dateOfBirth,
      mobile,
      address,
      taluka: talukaInfo.taluka,
      district: talukaInfo.district,
      ward,
      boothNumber,
      caste,
      subCaste,
      religion: pick(religions, i * 13),
      education: pick(educations, i * 7),
      profession: pick(professions, i * 11),
      categoryLabel: pick(categories, i * 3),
      maritalStatus: pick(maritalStatuses, i * 5),
      influenceLevel,
      isVolunteer,
      constituency: `${talukaInfo.taluka} Constituency`,
      createdBy: "user_1",
      createdAt,
      updatedAt: createdAt,
      customValues: [],
    };

    voters.push(voter);
  }

  setVoters(voters);
}

// ---- Seed default data ----
export function seedDefaultData(): void {
  // Data version check — clear old voter data if version changed
  const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
  if (storedVersion !== DATA_VERSION) {
    localStorage.removeItem(KEYS.voters);
    localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION);
  }

  const users = getUsers();
  if (users.length === 0) {
    setUsers([
      {
        userId: "user_1",
        username: "admin",
        passwordHash: "admin123",
        role: "superAdmin",
        mobile: "9999999999",
        createdAt: Date.now(),
      },
      {
        userId: "user_2",
        username: "dataentry",
        passwordHash: "data123",
        role: "dataEntry",
        createdAt: Date.now(),
      },
      {
        userId: "user_3",
        username: "viewer",
        passwordHash: "view123",
        role: "viewer",
        createdAt: Date.now(),
      },
    ]);
  }

  const options = getDropdownOptions();
  if (options.length === 0) {
    const defaultOptions: DropdownOption[] = [
      {
        id: "cat_1",
        label: "Supporter",
        category: "categoryLabel",
        sortOrder: 1,
      },
      {
        id: "cat_2",
        label: "Neutral",
        category: "categoryLabel",
        sortOrder: 2,
      },
      {
        id: "cat_3",
        label: "Opponent",
        category: "categoryLabel",
        sortOrder: 3,
      },
      { id: "gen_1", label: "Male", category: "gender", sortOrder: 1 },
      { id: "gen_2", label: "Female", category: "gender", sortOrder: 2 },
      { id: "gen_3", label: "Other", category: "gender", sortOrder: 3 },
      { id: "edu_1", label: "Primary", category: "education", sortOrder: 1 },
      { id: "edu_2", label: "Secondary", category: "education", sortOrder: 2 },
      {
        id: "edu_3",
        label: "Higher Secondary",
        category: "education",
        sortOrder: 3,
      },
      { id: "edu_4", label: "Graduate", category: "education", sortOrder: 4 },
      {
        id: "edu_5",
        label: "Post Graduate",
        category: "education",
        sortOrder: 5,
      },
      { id: "edu_6", label: "Doctorate", category: "education", sortOrder: 6 },
      { id: "rel_1", label: "Hindu", category: "religion", sortOrder: 1 },
      { id: "rel_2", label: "Muslim", category: "religion", sortOrder: 2 },
      { id: "rel_3", label: "Christian", category: "religion", sortOrder: 3 },
      { id: "rel_4", label: "Sikh", category: "religion", sortOrder: 4 },
      { id: "rel_5", label: "Buddhist", category: "religion", sortOrder: 5 },
      { id: "rel_6", label: "Jain", category: "religion", sortOrder: 6 },
      { id: "rel_7", label: "Other", category: "religion", sortOrder: 7 },
      { id: "mar_1", label: "Single", category: "maritalStatus", sortOrder: 1 },
      {
        id: "mar_2",
        label: "Married",
        category: "maritalStatus",
        sortOrder: 2,
      },
      {
        id: "mar_3",
        label: "Widowed",
        category: "maritalStatus",
        sortOrder: 3,
      },
      {
        id: "mar_4",
        label: "Divorced",
        category: "maritalStatus",
        sortOrder: 4,
      },
      { id: "prof_1", label: "Farmer", category: "profession", sortOrder: 1 },
      { id: "prof_2", label: "Business", category: "profession", sortOrder: 2 },
      { id: "prof_3", label: "Service", category: "profession", sortOrder: 3 },
      { id: "prof_4", label: "Student", category: "profession", sortOrder: 4 },
      {
        id: "prof_5",
        label: "Homemaker",
        category: "profession",
        sortOrder: 5,
      },
      { id: "prof_6", label: "Labour", category: "profession", sortOrder: 6 },
      {
        id: "prof_7",
        label: "Professional",
        category: "profession",
        sortOrder: 7,
      },
      { id: "prof_8", label: "Retired", category: "profession", sortOrder: 8 },
      ...CASTE_DEFAULTS,
    ];
    setDropdownOptions(defaultOptions);
  } else {
    // Migration: add caste defaults if no caste options exist
    if (!options.some((o) => o.category === "caste")) {
      setDropdownOptions([...options, ...CASTE_DEFAULTS]);
    }
  }

  // Seed mock voters if none exist
  seedMockVoters();
}
