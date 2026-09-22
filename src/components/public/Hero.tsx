import React from 'react';
import { HeroScene } from '../3d/HeroScene.tsx';
import { ArrowRight, Sparkles, ShieldCheck, Film, Calendar, LayoutDashboard } from 'lucide-react';

interface HeroProps {
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <section className="relative pt-8 pb-20 overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Three.js Spatial Studio Engine</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Sculpting Light Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Spatial 3D</span> Dimensions
            </h1>

            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl">
              From grand architectural weddings to volumetric commercial lookbooks, Lumen 3D fuses medium-format optics with stereoscopic depth modeling for unforgettable spatial captures.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                id="hero-reserve-btn"
                onClick={() => onNavigate('booking')}
                className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all active:scale-95 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve Shoot</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                id="hero-portfolio-btn"
                onClick={() => onNavigate('portfolio')}
                className="px-5 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-750 font-semibold text-sm transition-all flex items-center gap-2"
              >
                <Film className="w-4 h-4 text-amber-400" />
                <span>Explore 3D Gallery</span>
              </button>
            </div>

            {/* Quick Link to Admin Panel */}
            <div className="pt-2">
              <button
                type="button"
                id="hero-admin-launch-btn"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 text-xs font-mono text-neutral-300 transition-colors group"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>Studio Operations & Scheduler Admin Panel</span>
                <span className="text-amber-400 text-[10px] ml-1">→</span>
              </button>
            </div>

            {/* Credibility metric pills */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/80">
              <div>
                <div className="font-display text-2xl font-bold text-white">450+</div>
                <div className="text-xs text-neutral-400 mt-0.5 font-mono">Events Captured</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-amber-400">100%</div>
                <div className="text-xs text-neutral-400 mt-0.5 font-mono">Spatial Depth</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-white">4.96★</div>
                <div className="text-xs text-neutral-400 mt-0.5 font-mono">Client Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column: Three.js Interactive 3D Viewport */}
          <div className="lg:col-span-7">
            <HeroScene />
          </div>

        </div>
      </div>
    </section>
  );
};
