import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Settings,
  Printer,
  LogOut,
  Menu,
  X,
  Vote,
  ChevronRight,
  Moon,
  Sun,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';
import type { UserRole } from '../store/types';

export type PageRoute =
  | 'dashboard'
  | 'voters'
  | 'voter-add'
  | 'voter-edit'
  | 'voter-detail'
  | 'settings'
  | 'label-print'
  | 'messaging'
  | 'tasks';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
}

interface NavItem {
  id: PageRoute;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['superAdmin', 'dataEntry', 'viewer'] },
  { id: 'voters', label: 'Voters', icon: Users, roles: ['superAdmin', 'dataEntry', 'viewer'] },
  { id: 'voter-add', label: 'Add Voter', icon: UserPlus, roles: ['superAdmin', 'dataEntry'] },
  { id: 'messaging', label: 'Messaging', icon: MessageSquare, roles: ['superAdmin', 'dataEntry', 'viewer'] },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList, roles: ['superAdmin', 'dataEntry', 'viewer'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['superAdmin'] },
  { id: 'label-print', label: 'Label Print', icon: Printer, roles: ['superAdmin'] },
];

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

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('vmas-dark') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('vmas-dark', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  if (!user) return null;

  const visibleNavItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  const isActive = (itemId: PageRoute) => {
    if (itemId === 'voters') return currentPage === 'voters' || currentPage === 'voter-detail';
    if (itemId === 'voter-add') return currentPage === 'voter-add' || currentPage === 'voter-edit';
    return currentPage === itemId;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          <Vote className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-display text-base font-bold leading-tight text-white">
            SurveyMitra
          </div>
          <div className="text-xs text-white opacity-60">
            Voter Management
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleNavItems.map(item => (
          <button
            type="button"
            key={item.id}
            onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
            className={`sidebar-nav-item w-full text-left ${isActive(item.id) ? 'active' : ''}`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
            {isActive(item.id) && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
        <div className="flex items-center gap-3 px-2 mb-3">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate text-white">
              {user.username}
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-sm opacity-70 hover:opacity-100 text-white hover:text-white"
            style={{ color: '#ffffff' }}
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 opacity-70 hover:opacity-100 text-white hover:text-white"
            style={{ color: '#ffffff' }}
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 border-r"
        style={{
          background: '#0b0854',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 w-full cursor-default"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col z-50"
            style={{
              background: '#0b0854',
              borderRight: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-white/60 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b" style={{ background: '#0b0854' }}>
          <Button variant="ghost" size="sm" className="p-1 text-white hover:text-white hover:bg-white/20" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-white" />
          </Button>
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-white" />
            <span className="font-display font-bold text-base text-white">SurveyMitra</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-white border-white/50">{ROLE_LABELS[user.role]}</Badge>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 text-white hover:text-white hover:bg-white/20"
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
