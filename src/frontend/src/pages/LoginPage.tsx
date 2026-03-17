import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Vote } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onShowLanding?: () => void;
}

export default function LoginPage({
  onLoginSuccess,
  onShowLanding,
}: LoginPageProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }
    setIsLoading(true);
    setError("");

    // Simulate slight delay for UX
    await new Promise((r) => setTimeout(r, 300));
    const success = login(username.trim(), password);
    setIsLoading(false);

    if (success) {
      onLoginSuccess();
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0b0854" }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, oklch(0.7 0.15 220) 0%, transparent 50%), radial-gradient(circle at 75% 75%, oklch(0.6 0.12 260) 0%, transparent 50%)",
          opacity: 0.12,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: "rgba(227,222,197,0.15)",
              border: "1px solid rgba(227,222,197,0.35)",
            }}
          >
            <Vote className="w-8 h-8" style={{ color: "#e3dec5" }} />
          </div>
          <h1
            className="font-display text-3xl font-bold mb-1"
            style={{ color: "#e3dec5" }}
          >
            SurveyMitra
          </h1>
          <p className="text-sm" style={{ color: "rgba(227,222,197,0.7)" }}>
            Voter Management & Analytics System
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(227,222,197,0.45)" }}
          >
            by Tattva Innovation
          </p>
        </div>

        <Card className="shadow-2xl border-0" style={{ background: "#e3dec5" }}>
          <CardHeader className="pb-4">
            <CardTitle
              className="font-display text-xl"
              style={{ color: "#0b0854" }}
            >
              Sign In
            </CardTitle>
            <CardDescription style={{ color: "#0b0854", opacity: 0.65 }}>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
                  style={{
                    background: "rgba(11,8,84,0.08)",
                    border: "1px solid rgba(11,8,84,0.2)",
                    color: "#0b0854",
                  }}
                  data-ocid="login.error_state"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium"
                  style={{ color: "#0b0854" }}
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  className="h-10"
                  data-ocid="login.input"
                  style={{
                    background: "#e3dec5",
                    borderColor: "rgba(11,8,84,0.25)",
                    color: "#0b0854",
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{ color: "#0b0854" }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-10 pr-10"
                    data-ocid="login.input"
                    style={{
                      background: "#e3dec5",
                      borderColor: "rgba(11,8,84,0.25)",
                      color: "#0b0854",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                    style={{ color: "#0b0854", opacity: 0.55 }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 mt-2 font-semibold"
                disabled={isLoading}
                data-ocid="login.submit_button"
                style={{ background: "#0b0854", color: "#e3dec5" }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div
              className="mt-5 p-3 rounded-lg text-xs space-y-1"
              style={{
                background: "rgba(11,8,84,0.07)",
                border: "1px solid rgba(11,8,84,0.12)",
              }}
            >
              <div
                className="font-semibold mb-1.5"
                style={{ color: "#0b0854" }}
              >
                Default Credentials:
              </div>
              <div
                className="font-mono-data grid grid-cols-2 gap-x-4 gap-y-1"
                style={{ color: "#0b0854", opacity: 0.75 }}
              >
                <span>admin / admin123</span>
                <span className="text-xs opacity-70">Super Admin</span>
                <span>dataentry / data123</span>
                <span className="text-xs opacity-70">Data Entry</span>
                <span>viewer / view123</span>
                <span className="text-xs opacity-70">Viewer</span>
              </div>
            </div>

            {onShowLanding && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={onShowLanding}
                  data-ocid="login.link"
                  className="text-sm underline underline-offset-2 transition-opacity hover:opacity-80"
                  style={{ color: "#0b0854", opacity: 0.6 }}
                >
                  Learn about SurveyMitra →
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <p
          className="text-center text-xs mt-5"
          style={{ color: "rgba(227,222,197,0.5)" }}
        >
          Made by{" "}
          <span style={{ color: "rgba(227,222,197,0.8)", fontWeight: 600 }}>
            Tattva Innovation
          </span>{" "}
          · © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
