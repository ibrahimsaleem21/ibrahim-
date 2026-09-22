import React from 'react';
import { StudioPackage } from '../../types.ts';
import { Check, Sparkles, Clock, Image, ArrowRight } from 'lucide-react';

interface ServicesProps {
  packages: StudioPackage[];
  onSelectPackage: (pkg: StudioPackage) => void;
}

export const Services: React.FC<ServicesProps> = ({ packages, onSelectPackage }) => {
  return (
    <section id="services-section" className="py-20 bg-neutral-900/50 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Studio Packages</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transparent Tiered Investment
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            Every session includes stereoscopic calibration, 4K digital deliverables, and private cloud archive access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                pkg.isPopular
                  ? 'bg-neutral-900 border-2 border-amber-500 shadow-2xl shadow-amber-500/10'
                  : 'bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-[10px] uppercase tracking-wider shadow-md">
                  Most Requested
                </div>
              )}

              <div>
                <div className="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
                  {pkg.category}
                </div>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  {pkg.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-2 min-h-[36px] line-clamp-2">
                  {pkg.description}
                </p>

                {/* Price Display */}
                <div className="my-6 pb-6 border-b border-neutral-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                      ${pkg.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">/ event</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs font-mono text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {pkg.durationHours} Hours
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Image className="w-3.5 h-3.5 text-neutral-500" />
                      {pkg.photosDelivered}+ Deliverables
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 text-xs text-neutral-300">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  id={`select-pkg-${pkg.id}`}
                  onClick={() => onSelectPackage(pkg)}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    pkg.isPopular
                      ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/25 active:scale-95'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                  }`}
                >
                  <span>Select {pkg.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
