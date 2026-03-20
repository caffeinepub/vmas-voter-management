import { getCustomFields, setCustomFields } from "./storage";
import type { CustomField, CustomFieldType } from "./types";

function generateId(): string {
  return `cf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getAllCustomFields(): CustomField[] {
  return getCustomFields().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function addCustomField(
  label: string,
  fieldType: CustomFieldType,
  options: string[],
  parentFieldId?: string,
): CustomField {
  const fields = getCustomFields();
  const maxOrder =
    fields.length > 0 ? Math.max(...fields.map((f) => f.sortOrder)) : 0;
  const newField: CustomField = {
    fieldId: generateId(),
    label: label.trim(),
    fieldType,
    options: options.map((o) => o.trim()).filter(Boolean),
    sortOrder: maxOrder + 1,
    createdAt: Date.now(),
    ...(parentFieldId ? { parentFieldId } : {}),
  };
  fields.push(newField);
  setCustomFields(fields);
  return newField;
}

export function updateCustomField(
  fieldId: string,
  label: string,
  options: string[],
  parentFieldId?: string,
): boolean {
  const fields = getCustomFields();
  const idx = fields.findIndex((f) => f.fieldId === fieldId);
  if (idx === -1) return false;
  fields[idx] = {
    ...fields[idx],
    label: label.trim(),
    options: options.map((o) => o.trim()).filter(Boolean),
    ...(parentFieldId !== undefined ? { parentFieldId } : {}),
  };
  setCustomFields(fields);
  return true;
}

export function deleteCustomField(fieldId: string): boolean {
  const fields = getCustomFields();
  const filtered = fields.filter((f) => f.fieldId !== fieldId);
  if (filtered.length === fields.length) return false;
  setCustomFields(filtered);
  return true;
}
