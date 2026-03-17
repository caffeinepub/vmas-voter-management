import { getDropdownOptions, setDropdownOptions } from "./storage";
import type { DropdownOption } from "./types";

function generateId(): string {
  return `opt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getOptionsByCategory(category: string): DropdownOption[] {
  return getDropdownOptions()
    .filter((o) => o.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function addOption(category: string, label: string): DropdownOption {
  const options = getDropdownOptions();
  const existing = options.filter((o) => o.category === category);
  const maxOrder =
    existing.length > 0 ? Math.max(...existing.map((o) => o.sortOrder)) : 0;
  const newOption: DropdownOption = {
    id: generateId(),
    label: label.trim(),
    category,
    sortOrder: maxOrder + 1,
  };
  options.push(newOption);
  setDropdownOptions(options);
  return newOption;
}

export function deleteOption(id: string): boolean {
  const options = getDropdownOptions();
  const filtered = options.filter((o) => o.id !== id);
  if (filtered.length === options.length) return false;
  setDropdownOptions(filtered);
  return true;
}

export function updateOption(id: string, label: string): boolean {
  const options = getDropdownOptions();
  const idx = options.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  options[idx] = { ...options[idx], label: label.trim() };
  setDropdownOptions(options);
  return true;
}

export const DROPDOWN_CATEGORIES = [
  { value: "booth", label: "Booth" },
  { value: "ward", label: "Ward" },
  { value: "constituency", label: "Constituency" },
  { value: "taluka", label: "Taluka" },
  { value: "district", label: "District" },
  { value: "religion", label: "Religion" },
  { value: "education", label: "Education" },
  { value: "profession", label: "Profession" },
  { value: "professionalCategory", label: "Professional Category" },
  { value: "maritalStatus", label: "Marital Status" },
  { value: "categoryLabel", label: "Category Label" },
  { value: "caste", label: "Caste" },
] as const;
