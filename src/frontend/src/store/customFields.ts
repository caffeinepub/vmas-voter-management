import { getCustomFields, setCustomFields } from './storage';
import type { CustomField, CustomFieldType } from './types';

function generateId(): string {
  return `cf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getAllCustomFields(): CustomField[] {
  return getCustomFields().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function addCustomField(
  label: string,
  fieldType: CustomFieldType,
  options: string[]
): CustomField {
  const fields = getCustomFields();
  const maxOrder = fields.length > 0 ? Math.max(...fields.map(f => f.sortOrder)) : 0;
  const newField: CustomField = {
    fieldId: generateId(),
    label: label.trim(),
    fieldType,
    options: options.map(o => o.trim()).filter(Boolean),
    sortOrder: maxOrder + 1,
    createdAt: Date.now(),
  };
  fields.push(newField);
  setCustomFields(fields);
  return newField;
}

export function deleteCustomField(fieldId: string): boolean {
  const fields = getCustomFields();
  const filtered = fields.filter(f => f.fieldId !== fieldId);
  if (filtered.length === fields.length) return false;
  setCustomFields(filtered);
  return true;
}
