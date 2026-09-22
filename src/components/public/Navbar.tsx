import React from 'react';
import { Camera, LayoutDashboard, Calendar, Sparkles, UserCheck } from 'lucide-react';
import { AdminUser } from '../../types.ts';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
  currentUser: AdminUser | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenAdmin,
  currentUser,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-neutral-950/80 border-b border-neutral-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
          id="nav-logo-btn"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight text-white">
              <span>LUMEN</span>
              <span className="text-amber-400 text-xs px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                3D
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 tracking-wider uppercase">
              Spatial Photography Studio
            </p>
          </div>
        </div>

        {/* Center Public Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-900/60 p-1.5 rounded-full border border-neutral-800/80">
          {[
            { id: 'home', label: 'Home' },
            { id: 'portfolio', label: '3D Portfolio' },
            { id: 'services', label: 'Services & Rates' },
            { id: 'about', label: 'Studio Crew' },
            { id: 'booking', label: 'Book Event' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              id={`nav-${item.id}-btn`}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                currentTab === item.id
                  ? 'bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action: Admin Access & Book CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="open-admin-portal-btn"
            onClick={onOpenAdmin}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-750 hover:border-amber-500/40 transition-all shadow-sm"
          >
            {currentUser ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline font-mono">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {currentUser.role}
                </span>
              </>
            ) : (
              <>
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Panel</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono hidden sm:inline">
                  Demo
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            id="nav-quick-book-btn"
            onClick={() => onNavigate('booking')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            Reserve Shoot
          </button>
        </div>
      </div>
    </header>
  );
};
