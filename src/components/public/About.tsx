import React from 'react';
import { Employee } from '../../types.ts';
import { Star, Award, Sparkles, Layers, Box, Cpu } from 'lucide-react';

interface AboutProps {
  employees: Employee[];
}

export const About: React.FC<AboutProps> = ({ employees }) => {
  return (
    <section id="about-section" className="py-20 bg-neutral-950 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Story Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pioneering Spatial Imaging</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Where Medium Format Optics Meet Stereoscopic 3D Depth
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Founded in 2021 by visual artists and spatial computing engineers, Lumen 3D Studio was created on a single belief: photography should not merely be viewed flat — it should be stepped into.
            </p>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              We pair medium-format sensors with custom multi-lens parallax rigs and LiDAR elevation scanning. Whether preserving the delicate emotional nuance of a family wedding or creating spatial 3D interactive assets for international luxury brands, our team delivers uncompromising visual mastery.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <Box className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-xs font-bold text-white">Spatial Depth</div>
                <div className="text-[11px] text-neutral-400 mt-1">Multi-angle parallax mapping</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <Layers className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-xs font-bold text-white">100MP Resolving</div>
                <div className="text-[11px] text-neutral-400 mt-1">Hasselblad & Phase One sensors</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <Cpu className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-xs font-bold text-white">Vision Pro Ready</div>
                <div className="text-[11px] text-neutral-400 mt-1">Lenticular & spatial exports</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl aspect-[4/3] bg-neutral-900">
              <img
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=85"
                alt="Lumen 3D Studio Gear and Set"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-neutral-900/85 backdrop-blur-md border border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                  <Award className="w-4 h-4" />
                  <span>Master Studio Production Crew</span>
                </div>
                <p className="text-xs text-neutral-300 mt-1">
                  On-site multi-camera calibration, wireless DMX strobe controls, and real-time color grading.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Crew Showcase */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Meet the Creative Leads
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Directly assignable to your events through our precision scheduling engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="rounded-3xl p-5 bg-neutral-900/50 border border-neutral-800 hover:border-amber-500/30 transition-all flex items-start gap-4"
              >
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-neutral-700 shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-base font-bold text-white truncate">
                      {emp.name}
                    </h4>
                    <span className="flex items-center text-amber-400 text-xs font-mono shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                      {emp.rating}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-amber-400/90 truncate">
                    {emp.role}
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    {emp.bio}
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                    <span>{emp.eventsCount || 30}+ Events</span>
                    <span>•</span>
                    <span className="text-emerald-400">{emp.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
