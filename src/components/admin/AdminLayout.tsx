import React, { useState } from 'react';
import { AdminUser, Employee, StudioEvent, Lead, StudioPackage } from '../../types.ts';
import { api } from '../../services/api.ts';
import { AnalyticsDashboard } from './AnalyticsDashboard.tsx';
import { EventScheduler } from './EventScheduler.tsx';
import { EmployeeManager } from './EmployeeManager.tsx';
import { LeadsManager } from './LeadsManager.tsx';
import { PackageManager } from './PackageManager.tsx';
import { PaymentsManager } from './PaymentsManager.tsx';
import { SchemaDocs } from './SchemaDocs.tsx';
import {
  BarChart2,
  Calendar,
  Users,
  Inbox,
  Package,
  CreditCard,
  Database,
  ArrowLeft,
  LogOut,
  RotateCcw,
  Shield,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface AdminLayoutProps {
  user: AdminUser;
  employees: Employee[];
  events: StudioEvent[];
  leads: Lead[];
  packages: StudioPackage[];
  onRefreshAll: () => void;
  onLogout: () => void;
  onReturnToPublic: () => void;
  onSwitchUser: (newUser: AdminUser) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  employees,
  events,
  leads,
  packages,
  onRefreshAll,
  onLogout,
  onReturnToPublic,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'events' | 'employees' | 'leads' | 'packages' | 'payments' | 'schema'>('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const newLeadsCount = leads.filter(l => l.status === 'New').length;

  const handleResetData = async () => {
    if (!window.confirm('Reset all events, leads, and staff back to original studio seed data?')) return;
    try {
      setIsResetting(true);
      await api.resetData();
      onRefreshAll();
    } catch (e: any) {
      alert(e.message || 'Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSwitchToEmployee = (emp: Employee) => {
    onSwitchUser({
      id: `usr-${emp.id}`,
      name: emp.name,
      email: emp.email,
      role: 'Employee',
      employeeId: emp.id,
      avatar: emp.avatar,
    });
    setIsRoleMenuOpen(false);
  };

  const handleSwitchToAdmin = () => {
    onSwitchUser({
      id: 'usr-admin',
      name: 'Sarah Jenkins',
      email: 'admin@lumen3d.com',
      role: 'SuperAdmin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    });
    setIsRoleMenuOpen(false);
  };

  interface NavItem {
    id: 'analytics' | 'events' | 'employees' | 'leads' | 'packages' | 'payments' | 'schema';
    label: string;
    icon: any;
    badge?: string | number;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart2 },
    { id: 'events', label: 'Event Scheduling', icon: Calendar, badge: events.length },
    { id: 'employees', label: 'Staff Management', icon: Users, badge: employees.length },
    { id: 'leads', label: 'Booking Leads', icon: Inbox, badge: newLeadsCount > 0 ? `${newLeadsCount} New` : undefined, badgeColor: 'bg-amber-500 text-neutral-950 font-bold' },
    { id: 'packages', label: 'Packages & Tiers', icon: Package },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
    { id: 'schema', label: 'Database Schema', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      
      {/* Top Universal Admin Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Mobile hamburger & Studio Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="mobile-admin-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-neutral-800 text-neutral-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={onReturnToPublic}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-bold font-mono text-sm shadow-md shadow-amber-500/20">
                3D
              </div>
              <div>
                <span className="font-display font-bold text-white text-base tracking-tight block">
                  LUMEN <span className="text-amber-400">ADMIN</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400 block group-hover:text-amber-400 transition-colors">
                  ← Return to Public Website
                </span>
              </div>
            </button>
          </div>

          {/* Right: Active Role Selector, Seed Data Reset, Logout */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                id="role-switch-dropdown-btn"
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-xs font-mono text-neutral-200 transition-all"
              >
                <div className={`w-2 h-2 rounded-full ${user.role === 'SuperAdmin' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                <span className="hidden sm:inline font-bold">
                  {user.role === 'SuperAdmin' ? 'Super Admin' : `Staff: ${user.name}`}
                </span>
                <span className="sm:hidden font-bold">
                  {user.role === 'SuperAdmin' ? 'Admin' : 'Staff'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Switch Active Persona:
                  </div>

                  {/* Super Admin */}
                  <button
                    type="button"
                    onClick={handleSwitchToAdmin}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      user.role === 'SuperAdmin'
                        ? 'bg-amber-500/15 text-amber-300 font-bold'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Super Admin (Full Ops)</span>
                    </div>
                    {user.role === 'SuperAdmin' && <span className="text-amber-400 text-xs">✓</span>}
                  </button>

                  <div className="border-t border-neutral-800 my-1" />

                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Employee Schedule Views:
                  </div>

                  {employees.slice(0, 3).map(emp => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => handleSwitchToEmployee(emp)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        user.employeeId === emp.id
                          ? 'bg-blue-500/15 text-blue-300 font-bold'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={emp.avatar} alt={emp.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                        <span className="truncate">{emp.name}</span>
                      </div>
                      {user.employeeId === emp.id && <span className="text-blue-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Seed Data */}
            <button
              type="button"
              id="reset-db-btn"
              onClick={handleResetData}
              disabled={isResetting}
              title="Reset Demo Data"
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            </button>

            {/* Return to Public Website */}
            <button
              type="button"
              id="return-to-site-btn"
              onClick={onReturnToPublic}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Public Site</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              id="admin-logout-btn"
              onClick={onLogout}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar Navigation */}
        <aside className={`lg:w-64 shrink-0 space-y-2 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
              Management Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-950 stroke-[2.5]' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                      item.badgeColor || (isActive ? 'bg-neutral-950/20 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-300')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Employee mode notice banner */}
          {user.role === 'Employee' && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-300">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Employee Mode Active</span>
              </div>
              <p className="text-[11px] text-blue-300/80 leading-relaxed">
                Viewing schedule and assignments specifically for <strong className="text-white">{user.name}</strong>.
              </p>
              <button
                type="button"
                onClick={handleSwitchToAdmin}
                className="text-[11px] font-mono text-blue-400 hover:text-white underline pt-1 block"
              >
                Switch back to Super Admin →
              </button>
            </div>
          )}

          {/* Quick Studio Health Badge */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Database Engine:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                JSON / Mongo Ready
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Conflict Engine:</span>
              <span className="text-amber-400">Interval Algebra Active</span>
            </div>
          </div>
        </aside>

        {/* Right Dynamic Tab Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              employees={employees}
              packages={packages}
            />
          )}

          {activeTab === 'events' && (
            <EventScheduler
              employees={employees}
              packages={packages}
              events={events}
              onEventsUpdated={onRefreshAll}
              activeEmployeeId={user.role === 'Employee' ? user.employeeId : undefined}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeManager
              employees={employees}
              onEmployeesUpdated={onRefreshAll}
              onViewEmployeeSchedule={(emp) => {
                handleSwitchToEmployee(emp);
                setActiveTab('events');
              }}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsManager
              leads={leads}
              employees={employees}
              onLeadsUpdated={onRefreshAll}
              onLeadConvertedToEvent={(newEv) => {
                onRefreshAll();
                setActiveTab('events');
              }}
            />
          )}

          {activeTab === 'packages' && (
            <PackageManager
              packages={packages}
              onPackagesUpdated={onRefreshAll}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsManager
              events={events}
              onEventsUpdated={onRefreshAll}
            />
          )}

          {activeTab === 'schema' && (
            <SchemaDocs />
          )}
        </main>

      </div>

    </div>
  );
};
