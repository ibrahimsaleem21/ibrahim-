import React, { useState } from 'react';
import { AdminUser, Employee } from '../../types.ts';
import { api } from '../../services/api.ts';
import { Shield, Key, Mail, Lock, UserCheck, ArrowRight, X, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AdminUser) => void;
  employees: Employee[];
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employees,
}) => {
  const [email, setEmail] = useState('admin@lumen3d.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = async () => {
    setLoading(true);
    try {
      const res = await api.login({ email: 'admin@lumen3d.com', password: 'admin123' });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickEmployee = async (emp: Employee) => {
    setLoading(true);
    try {
      const res = await api.login({
        asRole: 'Employee',
        employeeId: emp.id,
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError('Employee login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6">
        
        <button
          type="button"
          id="close-login-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-display text-2xl font-bold text-white">
            Studio Operations Access
          </h3>
          <p className="text-xs text-neutral-400">
            Sign in to access event scheduling, multi-booking calendars, staff assignments, and financial analytics.
          </p>
        </div>

        {/* 1-Click Quick Demo Sign-ins */}
        <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2.5">
          <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-3 h-3" />
              1-Click Demo Access:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="demo-admin-login-btn"
              onClick={handleQuickAdmin}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Studio Admin</span>
            </button>

            <button
              type="button"
              id="demo-employee-login-btn"
              onClick={() => handleQuickEmployee(employees[0] || { id: 'emp-1', name: 'Ali Raza' } as any)}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Staff: Ali Raza</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                placeholder="admin@lumen3d.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300" htmlFor="login-pwd">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                id="login-pwd"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
