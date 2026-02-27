import { MessageTemplate } from './types';

const KEY = 'vmas_message_templates';

export function getAllTemplates(): MessageTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch { return []; }
}

export function saveTemplate(template: MessageTemplate): void {
  const all = getAllTemplates();
  const idx = all.findIndex(t => t.id === template.id);
  if (idx >= 0) all[idx] = template;
  else all.push(template);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteTemplate(id: string): void {
  const all = getAllTemplates().filter(t => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}
