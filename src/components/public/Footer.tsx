import React from 'react';
import { Camera, Mail, Phone, MapPin, ArrowUpRight, Heart, Sparkles, LayoutDashboard } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 pt-16 pb-12 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-900">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-950 font-bold shadow-lg shadow-amber-500/20">
                <Camera className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">
                LUMEN <span className="text-amber-400">3D</span> STUDIO
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Fine art stereoscopic 3D and medium-format photography atelier. Crafting high-dynamic-range spatial memories and photogrammetry assets for discerning clients worldwide.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                id="footer-open-admin-link"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-mono text-[11px] transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Operations Portal</span>
                <ArrowUpRight className="w-3 h-3 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
              Studio Index
            </div>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => onNavigate('home')} className="hover:text-amber-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('portfolio')} className="hover:text-amber-400 transition-colors">
                  3D Spatial Gallery
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services')} className="hover:text-amber-400 transition-colors">
                  Packages & Pricing
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('about')} className="hover:text-amber-400 transition-colors">
                  Creative Directors & Crew
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('booking')} className="hover:text-amber-400 transition-colors">
                  Reserve Experience
                </button>
              </li>
            </ul>
          </div>

          {/* Specialties */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
              Capabilities
            </div>
            <ul className="space-y-2">
              <li className="hover:text-neutral-300">Stereoscopic Wedding Parallax</li>
              <li className="hover:text-neutral-300">Apple Vision Pro Spatial Mastering</li>
              <li className="hover:text-neutral-300">Medium Format 100MP Headshots</li>
              <li className="hover:text-neutral-300">360° Photogrammetry Scans</li>
              <li className="hover:text-neutral-300">LiDAR Aerial Drone Mapping</li>
            </ul>
          </div>

          {/* Studios */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
              Atelier Locations
            </div>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>SoHo Loft Studio: 482 Broome St, New York</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>West Coast Rig: 924 N La Cienega, Los Angeles</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>concierge@lumen3d.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} Lumen 3D Spatial Photography Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-neutral-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Three.js WebGL & React 19 Architecture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
