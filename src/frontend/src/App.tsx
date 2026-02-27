import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout, { type PageRoute } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VotersListPage from './pages/VotersListPage';
import VoterFormPage from './pages/VoterFormPage';
import VoterDetailPage from './pages/VoterDetailPage';
import SettingsPage from './pages/SettingsPage';
import LabelPrintPage from './pages/LabelPrintPage';
import MessagingPage from './pages/MessagingPage';
import TasksPage from './pages/TasksPage';
import { seedDefaultData } from './store/storage';

// Seed default data on load
seedDefaultData();

interface RouterState {
  page: PageRoute;
  id?: string;
}

function AppRouter() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [route, setRoute] = useState<RouterState>({ page: 'dashboard' });

  // On load, try to restore last page from hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const [page, id] = hash.split('/');
      setRoute({ page: page as PageRoute, id });
    }
  }, []);

  // Update URL hash when route changes
  useEffect(() => {
    const hash = route.id ? `#${route.page}/${route.id}` : `#${route.page}`;
    window.history.replaceState(null, '', hash);
  }, [route]);

  const navigate = (page: PageRoute, id?: string) => {
    // Role guards
    if (!user) return;
    if ((page === 'settings' || page === 'label-print') && user.role !== 'superAdmin') return;
    if (page === 'voter-add' && user.role === 'viewer') return;
    setRoute({ page, id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setRoute({ page: 'dashboard' })} />;
  }

  const renderPage = () => {
    switch (route.page) {
      case 'dashboard':
        return <DashboardPage />;
      case 'voters':
        return <VotersListPage onNavigate={navigate} />;
      case 'voter-add':
        return user?.role === 'viewer'
          ? <AccessDenied />
          : <VoterFormPage onNavigate={navigate} />;
      case 'voter-edit':
        return user?.role === 'viewer'
          ? <AccessDenied />
          : <VoterFormPage onNavigate={navigate} editId={route.id} />;
      case 'voter-detail':
        return route.id
          ? <VoterDetailPage onNavigate={navigate} voterId={route.id} />
          : <VotersListPage onNavigate={navigate} />;
      case 'settings':
        return user?.role !== 'superAdmin' ? <AccessDenied /> : <SettingsPage />;
      case 'label-print':
        return user?.role !== 'superAdmin' ? <AccessDenied /> : <LabelPrintPage />;
      case 'messaging':
        return <MessagingPage />;
      case 'tasks':
        return <TasksPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={route.page} onNavigate={navigate}>
      {renderPage()}
    </Layout>
  );
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="font-display text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm">You don't have permission to view this page.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
