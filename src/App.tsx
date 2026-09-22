import React, { useState, useEffect } from 'react';
import { Employee, StudioEvent, Lead, StudioPackage, AdminUser } from './types.ts';
import { api } from './services/api.ts';

// Public Components
import { Navbar } from './components/public/Navbar.tsx';
import { Hero } from './components/public/Hero.tsx';
import { Gallery } from './components/public/Gallery.tsx';
import { Services } from './components/public/Services.tsx';
import { About } from './components/public/About.tsx';
import { BookingForm } from './components/public/BookingForm.tsx';
import { Footer } from './components/public/Footer.tsx';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';

import { Shield, Sparkles, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function App() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [publicTab, setPublicTab] = useState<string>('home');
  const [preselectedPackage, setPreselectedPackage] = useState<StudioPackage | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>({
    id: 'usr-admin',
    name: 'Sarah Jenkins',
    email: 'admin@lumen3d.com',
    role: 'SuperAdmin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Data Collections
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [packages, setPackages] = useState<StudioPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch
  const loadStudioData = async () => {
    try {
      setIsLoading(true);
      const [empsData, eventsData, leadsData, pkgsData] = await Promise.all([
        api.getEmployees(),
        api.getEvents(),
        api.getLeads(),
        api.getPackages(),
      ]);
      setEmployees(empsData);
      setEvents(eventsData);
      setLeads(leadsData);
      setPackages(pkgsData);
    } catch (err) {
      console.error('Failed to load studio data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudioData();
  }, []);

  const handleOpenAdmin = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
    } else {
      setViewMode('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectPackage = (pkg: StudioPackage) => {
    setPreselectedPackage(pkg);
    setPublicTab('booking');
    const elem = document.getElementById('booking-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLeadCreated = (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      
      {/* View Switcher: Public Website vs. Admin Operations Panel */}
      {viewMode === 'admin' ? (
        <AdminLayout
          user={currentUser || {
            id: 'usr-admin',
            name: 'Sarah Jenkins',
            email: 'admin@lumen3d.com',
            role: 'SuperAdmin',
          }}
          employees={employees}
          events={events}
          leads={leads}
          packages={packages}
          onRefreshAll={loadStudioData}
          onLogout={() => {
            setCurrentUser(null);
            setViewMode('public');
          }}
          onReturnToPublic={() => setViewMode('public')}
          onSwitchUser={(newUser) => setCurrentUser(newUser)}
        />
      ) : (
        <>
          {/* Public Top Navbar */}
          <Navbar
            currentTab={publicTab}
            onNavigate={(tab) => {
              setPublicTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAdmin={handleOpenAdmin}
            currentUser={currentUser}
          />

          {/* Public Dynamic Content */}
          <main className="flex-1">
            {publicTab === 'home' && (
              <>
                <Hero
                  onNavigate={(tab) => {
                    setPublicTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenAdmin={handleOpenAdmin}
                />
                <Gallery />
                <Services
                  packages={packages}
                  onSelectPackage={handleSelectPackage}
                />
                <About employees={employees} />
                <BookingForm
                  packages={packages}
                  preselectedPackage={preselectedPackage}
                  onLeadCreated={handleLeadCreated}
                  onOpenAdmin={handleOpenAdmin}
                />
              </>
            )}

            {publicTab === 'portfolio' && (
              <div className="pt-8">
                <Gallery />
              </div>
            )}

            {publicTab === 'services' && (
              <div className="pt-8">
                <Services
                  packages={packages}
                  onSelectPackage={handleSelectPackage}
                />
                <BookingForm
                  packages={packages}
                  preselectedPackage={preselectedPackage}
                  onLeadCreated={handleLeadCreated}
                  onOpenAdmin={handleOpenAdmin}
                />
              </div>
            )}

            {publicTab === 'about' && (
              <div className="pt-8">
                <About employees={employees} />
              </div>
            )}

            {publicTab === 'booking' && (
              <div className="pt-8">
                <BookingForm
                  packages={packages}
                  preselectedPackage={preselectedPackage}
                  onLeadCreated={handleLeadCreated}
                  onOpenAdmin={handleOpenAdmin}
                />
              </div>
            )}
          </main>

          {/* Public Footer */}
          <Footer
            onNavigate={(tab) => {
              setPublicTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAdmin={handleOpenAdmin}
          />

          {/* Floating Admin Portal Launcher Badge */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              type="button"
              id="floating-admin-launcher-btn"
              onClick={handleOpenAdmin}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-900/95 hover:bg-neutral-850 text-white border border-amber-500/40 shadow-2xl backdrop-blur-lg hover:border-amber-400 group transition-all active:scale-95"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/20">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Admin Panel</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-neutral-400">
                  {events.length} Events • {leads.filter(l => l.status === 'New').length} New Leads
                </div>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Admin Login Modal (Triggered if logged out) */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setViewMode('admin');
        }}
        employees={employees}
      />

    </div>
  );
}
