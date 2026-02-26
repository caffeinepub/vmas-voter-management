import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Trash2, Settings2 } from 'lucide-react';
import { getOptionsByCategory, addOption, deleteOption, DROPDOWN_CATEGORIES } from '../store/dropdowns';
import { getAllCustomFields, addCustomField, deleteCustomField } from '../store/customFields';
import { getUsers, setUsers } from '../store/storage';
import { useAuth } from '../contexts/AuthContext';
import type { CustomFieldType, User, UserRole } from '../store/types';

const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  yesno: 'Yes / No',
  dropdown: 'Dropdown',
  multiselect: 'Multi-Select',
};

const ROLE_LABELS: Record<UserRole, string> = {
  superAdmin: 'Super Admin',
  dataEntry: 'Data Entry',
  viewer: 'Viewer',
};

const ROLE_COLORS: Record<UserRole, string> = {
  superAdmin: 'bg-amber-100 text-amber-800',
  dataEntry: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-700',
};

// ---- Dropdown Manager Tab ----
function DropdownManagerTab() {
  const [selectedCategory, setSelectedCategory] = useState('categoryLabel');
  const [newLabel, setNewLabel] = useState('');
  const [options, setOptions] = useState(() => getOptionsByCategory('categoryLabel'));
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const refreshOptions = (cat: string) => {
    setOptions(getOptionsByCategory(cat));
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setOptions(getOptionsByCategory(cat));
    setNewLabel('');
  };

  const handleAdd = () => {
    if (!newLabel.trim()) { toast.error('Please enter an option label.'); return; }
    addOption(selectedCategory, newLabel.trim());
    refreshOptions(selectedCategory);
    setNewLabel('');
    toast.success('Option added.');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteOption(deleteTarget);
    refreshOptions(selectedCategory);
    setDeleteTarget(null);
    toast.success('Option deleted.');
  };

  return (
    <div className="space-y-5">
      <div className="max-w-xs">
        <Label htmlFor="catSelect" className="text-sm font-medium mb-1.5 block">Select Category</Label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger id="catSelect" className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DROPDOWN_CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Options for: {DROPDOWN_CATEGORIES.find(c => c.value === selectedCategory)?.label}</span>
            <Badge variant="outline">{options.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">No options yet. Add one below.</p>
          ) : (
            <ul className="space-y-1.5 mb-4">
              {options.map(opt => (
                <li key={opt.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border">
                  <span className="text-sm">{opt.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(opt.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <Input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="New option label…"
              className="h-9 flex-1"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Button size="sm" className="gap-1.5 h-9" onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Option</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this option?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Custom Fields Tab ----
function CustomFieldsTab() {
  const [fields, setFields] = useState(() => getAllCustomFields());
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<CustomFieldType>('text');
  const [newOptions, setNewOptions] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const needsOptions = newType === 'dropdown' || newType === 'multiselect';

  const handleAdd = () => {
    if (!newLabel.trim()) { toast.error('Field label is required.'); return; }
    if (needsOptions && !newOptions.trim()) { toast.error('Please provide options (comma-separated).'); return; }
    const opts = needsOptions ? newOptions.split(',').map(o => o.trim()).filter(Boolean) : [];
    addCustomField(newLabel.trim(), newType, opts);
    setFields(getAllCustomFields());
    setNewLabel('');
    setNewOptions('');
    toast.success('Custom field added.');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCustomField(deleteTarget);
    setFields(getAllCustomFields());
    setDeleteTarget(null);
    toast.success('Custom field deleted.');
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Existing Custom Fields</CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom fields defined yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold text-xs uppercase text-muted-foreground">Label</th>
                    <th className="text-left py-2 font-semibold text-xs uppercase text-muted-foreground">Type</th>
                    <th className="text-left py-2 font-semibold text-xs uppercase text-muted-foreground">Options</th>
                    <th className="text-right py-2 font-semibold text-xs uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(f => (
                    <tr key={f.fieldId} className="border-b last:border-0">
                      <td className="py-2 font-medium">{f.label}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="text-xs">{FIELD_TYPE_LABELS[f.fieldType]}</Badge>
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">
                        {f.options.length > 0 ? f.options.join(', ') : '—'}
                      </td>
                      <td className="py-2 text-right">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(f.fieldId)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Add Custom Field</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cfLabel" className="text-sm font-medium mb-1.5 block">Field Label</Label>
              <Input id="cfLabel" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Party Affiliation" className="h-9" />
            </div>
            <div>
              <Label htmlFor="cfType" className="text-sm font-medium mb-1.5 block">Field Type</Label>
              <Select value={newType} onValueChange={v => setNewType(v as CustomFieldType)}>
                <SelectTrigger id="cfType" className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(FIELD_TYPE_LABELS) as [CustomFieldType, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {needsOptions && (
              <div className="md:col-span-2">
                <Label htmlFor="cfOptions" className="text-sm font-medium mb-1.5 block">Options (comma-separated)</Label>
                <Input
                  id="cfOptions"
                  value={newOptions}
                  onChange={e => setNewOptions(e.target.value)}
                  placeholder="Option 1, Option 2, Option 3…"
                  className="h-9"
                />
              </div>
            )}
          </div>
          <Button className="mt-4 gap-2 h-9" size="sm" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            Add Custom Field
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
            <AlertDialogDescription>This will remove the custom field. Existing data for this field will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- User Management Tab ----
function UserManagementTab() {
  const { user: currentUser } = useAuth();
  const [users, setUsersState] = useState<User[]>(() => getUsers());
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('viewer');
  const [newMobile, setNewMobile] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const handleAddUser = () => {
    if (!newUsername.trim()) { toast.error('Username is required.'); return; }
    if (!newPassword.trim()) { toast.error('Password is required.'); return; }
    const all = getUsers();
    if (all.some(u => u.username === newUsername.trim())) {
      toast.error('Username already exists.');
      return;
    }
    const newUser: User = {
      userId: `user_${Date.now()}`,
      username: newUsername.trim(),
      passwordHash: newPassword,
      role: newRole,
      mobile: newMobile.trim() || undefined,
      createdAt: Date.now(),
    };
    setUsers([...all, newUser]);
    setUsersState(getUsers());
    setNewUsername('');
    setNewPassword('');
    setNewMobile('');
    toast.success('User added.');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const all = getUsers().filter(u => u.userId !== deleteTarget.userId);
    setUsers(all);
    setUsersState(all);
    setDeleteTarget(null);
    toast.success('User deleted.');
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.userId} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{u.username}</div>
                    {u.mobile && <div className="text-xs text-muted-foreground font-mono-data">{u.mobile}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    disabled={u.userId === currentUser?.userId}
                    onClick={() => setDeleteTarget(u)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newUsername" className="text-sm font-medium mb-1.5 block">Username</Label>
              <Input id="newUsername" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="h-9" />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium mb-1.5 block">Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-9" />
            </div>
            <div>
              <Label htmlFor="newRole" className="text-sm font-medium mb-1.5 block">Role</Label>
              <Select value={newRole} onValueChange={v => setNewRole(v as UserRole)}>
                <SelectTrigger id="newRole" className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="superAdmin">Super Admin</SelectItem>
                  <SelectItem value="dataEntry">Data Entry</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newMobile" className="text-sm font-medium mb-1.5 block">Mobile (optional)</Label>
              <Input id="newMobile" type="tel" value={newMobile} onChange={e => setNewMobile(e.target.value)} className="h-9" />
            </div>
          </div>
          <Button className="mt-4 gap-2 h-9" size="sm" onClick={handleAddUser}>
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>Delete user <strong>{deleteTarget?.username}</strong>? They will no longer be able to log in.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Main Settings Page ----
export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: '#0b0854' }}>
          <Settings2 className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage dropdown options, custom fields, and user accounts</p>
      </div>

      <Tabs defaultValue="dropdowns">
        <TabsList className="mb-5">
          <TabsTrigger value="dropdowns">Dropdown Manager</TabsTrigger>
          <TabsTrigger value="customFields">Custom Fields</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="dropdowns">
          <DropdownManagerTab />
        </TabsContent>
        <TabsContent value="customFields">
          <CustomFieldsTab />
        </TabsContent>
        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
