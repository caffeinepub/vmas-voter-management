import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setIsLoading(true);
    setError('');

    // Simulate slight delay for UX
    await new Promise(r => setTimeout(r, 300));
    const success = login(username.trim(), password);
    setIsLoading(false);

    if (success) {
      onLoginSuccess();
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, oklch(0.2 0.07 258) 0%, oklch(0.15 0.05 265) 100%)' }}>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, oklch(0.7 0.15 220) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, oklch(0.6 0.12 260) 0%, transparent 50%)`
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'oklch(0.68 0.15 220 / 0.2)', border: '1px solid oklch(0.68 0.15 220 / 0.3)' }}>
            <Vote className="w-8 h-8" style={{ color: 'oklch(0.78 0.14 220)' }} />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">SurveyMitra</h1>
          <p className="text-sm" style={{ color: 'oklch(0.75 0.04 250)' }}>
            Voter Management & Analytics System
          </p>
        </div>

        <Card className="shadow-2xl border-0" style={{ background: 'oklch(1 0 0 / 0.97)' }}>
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
                  style={{ background: 'oklch(0.97 0.03 25)', border: '1px solid oklch(0.88 0.08 25)', color: 'oklch(0.45 0.18 25)' }}>
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-10 mt-2" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </div>
                ) : 'Sign In'}
              </Button>
            </form>

            <div className="mt-5 p-3 rounded-lg text-xs space-y-1" style={{ background: 'oklch(0.97 0.008 240)' }}>
              <div className="font-semibold text-muted-foreground mb-1.5">Default Credentials:</div>
              <div className="font-mono-data grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                <span>admin / admin123</span>
                <span className="text-xs opacity-70">Super Admin</span>
                <span>dataentry / data123</span>
                <span className="text-xs opacity-70">Data Entry</span>
                <span>viewer / view123</span>
                <span className="text-xs opacity-70">Viewer</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs mt-4 text-white">
          © 2026. Built with ❤️ using{' '}
          <a href="https://caffeine.ai" className="underline opacity-80 hover:opacity-100">caffeine.ai</a>
        </p>
      </div>
    </div>
  );
}
