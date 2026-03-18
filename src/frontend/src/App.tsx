import { Toaster } from "@/components/ui/sonner";
import React, { useState, useEffect } from "react";
import Layout, { type PageRoute } from "./components/Layout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdvancedAnalyticsPage from "./pages/AdvancedAnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import LabelPrintPage from "./pages/LabelPrintPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MessagingPage from "./pages/MessagingPage";
import SettingsPage from "./pages/SettingsPage";
import TasksPage from "./pages/TasksPage";
import VoterDetailPage from "./pages/VoterDetailPage";
import VoterFormPage from "./pages/VoterFormPage";
import VotersListPage from "./pages/VotersListPage";
import { seedDefaultData } from "./store/storage";

// Seed default data on load
seedDefaultData();

interface RouterState {
  page: PageRoute;
  id?: string;
}

function getInitialView(): "landing" | "login" | "app" {
  const hash = window.location.hash.replace("#", "");
  if (hash === "login") return "login";
  if (hash === "landing" || hash === "") return "landing";
  return "app";
}

function AppRouter() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [view, setView] = useState<"landing" | "login" | "app">(getInitialView);
  const [route, setRoute] = useState<RouterState>({ page: "dashboard" });

  // On load, try to restore last page from hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && hash !== "landing" && hash !== "login") {
      const [page, id] = hash.split("/");
      setRoute({ page: page as PageRoute, id });
    }
  }, []);

  // Update URL hash when route/view changes
  useEffect(() => {
    if (view === "landing") {
      window.history.replaceState(null, "", "#landing");
    } else if (view === "login") {
      window.history.replaceState(null, "", "#login");
    } else {
      const hash = route.id ? `#${route.page}/${route.id}` : `#${route.page}`;
      window.history.replaceState(null, "", hash);
    }
  }, [view, route]);

  const navigate = (page: PageRoute, id?: string) => {
    if (!user) return;
    if (
      (page === "settings" || page === "label-print") &&
      user.role !== "superAdmin"
    )
      return;
    if (page === "voter-add" && user.role === "viewer") return;
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

  if (view === "landing") {
    return (
      <LandingPage
        onNavigate={() => {
          setView("login");
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setView("app");
          setRoute({ page: "dashboard" });
        }}
        onShowLanding={() => setView("landing")}
      />
    );
  }

  // If authenticated but view is "login" or "landing", go to app
  if (view !== "app") {
    setView("app");
  }

  const renderPage = () => {
    switch (route.page) {
      case "dashboard":
        return <DashboardPage />;
      case "voters":
        return <VotersListPage onNavigate={navigate} />;
      case "voter-add":
        return user?.role === "viewer" ? (
          <AccessDenied />
        ) : (
          <VoterFormPage onNavigate={navigate} />
        );
      case "voter-edit":
        return user?.role === "viewer" ? (
          <AccessDenied />
        ) : (
          <VoterFormPage onNavigate={navigate} editId={route.id} />
        );
      case "voter-detail":
        return route.id ? (
          <VoterDetailPage onNavigate={navigate} voterId={route.id} />
        ) : (
          <VotersListPage onNavigate={navigate} />
        );
      case "settings":
        return user?.role !== "superAdmin" ? (
          <AccessDenied />
        ) : (
          <SettingsPage />
        );
      case "label-print":
        return user?.role !== "superAdmin" ? (
          <AccessDenied />
        ) : (
          <LabelPrintPage />
        );
      case "messaging":
        return <MessagingPage />;
      case "tasks":
        return <TasksPage />;
      case "analytics":
        return <AdvancedAnalyticsPage />;
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
        <p className="text-muted-foreground text-sm">
          You don&apos;t have permission to view this page.
        </p>
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
