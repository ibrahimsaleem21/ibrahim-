import React, { useState } from 'react';
import { Sparkles, Eye, Maximize2, X, Camera, Aperture, Sliders } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: 'Wedding' | 'Events' | 'Portrait' | 'Product' | 'Fashion' | 'Architectural';
  imageUrl: string;
  depthMapUrl?: string;
  location: string;
  camera: string;
  lens: string;
  shutter: string;
  photographer: string;
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'The Golden Hour Vow Exchange',
    category: 'Wedding',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    location: 'Napa Valley Reserve',
    camera: 'Hasselblad X2D 100C',
    lens: 'XCD 55mm f/2.5 V',
    shutter: '1/1250s at f/2.5, ISO 64',
    photographer: 'Ali Raza & Sara Chen',
    description: 'Captured with dual stereoscopic parallax capture, preserving the translucent veil and ambient dust rays in full dimensional space.'
  },
  {
    id: 'gal-2',
    title: 'CyberTech Global Innovation Keynote',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85',
    location: 'San Francisco Convention Hall',
    camera: 'Sony Alpha 1 Spatial Rig',
    lens: 'FE 70-200mm f/2.8 GM II',
    shutter: '1/800s at f/2.8, ISO 800',
    photographer: 'Marcus Vance',
    description: 'High-speed event lighting tracking keynote speaker with instant cloud media distribution.'
  },
  {
    id: 'gal-3',
    title: 'Ethereal Studio Monolith',
    category: 'Portrait',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    location: 'Lumen Studio A, Manhattan',
    camera: 'Phase One IQ4 150MP',
    lens: 'Schneider Kreuznach 80mm LS',
    shutter: '1/250s at f/5.6, ISO 50',
    photographer: 'Elena Rostova',
    description: 'Fine art monochrome with sculpted broncolor parabolic reflector lighting.'
  },
  {
    id: 'gal-4',
    title: 'Aura Tourbillon Chronograph 3D Scan',
    category: 'Product',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
    location: 'Studio Macro Stage',
    camera: 'Hasselblad H6D-100c Multi-Shot',
    lens: 'HC 120mm Macro II',
    shutter: '1/160s at f/11, ISO 100',
    photographer: 'Maya Lin',
    description: '96-angle photogrammetry capture converted into USDZ and interactive 3D WebGL asset.'
  },
  {
    id: 'gal-5',
    title: 'Prism Haute Couture Autumn Walk',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    location: 'Tribeca Glasshouse Studio',
    camera: 'Fujifilm GFX 100 II',
    lens: 'GF 110mm f/2 R LM WR',
    shutter: '1/1000s at f/2.0, ISO 100',
    photographer: 'Ali Raza',
    description: 'High-fashion editorial utilizing dynamic cyan-amber split color gel lighting.'
  },
  {
    id: 'gal-6',
    title: 'Modernist Cantilever Villa',
    category: 'Architectural',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    location: 'Bel Air Estates, Los Angeles',
    camera: 'DJI Inspire 3 CineCore 8K',
    lens: 'DL 24mm F2.8 LS ASPH',
    shutter: '1/500s at f/4.0, ISO 100',
    photographer: 'Sara Chen',
    description: 'LiDAR elevation mesh overlayed with 8K RAW aerial twilight photogrammetry.'
  }
];

export const Gallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [depthIntensity, setDepthIntensity] = useState<number>(50);

  const categories = ['All', 'Wedding', 'Events', 'Portrait', 'Product', 'Fashion', 'Architectural'];

  const filteredItems = activeCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  return (
    <section id="portfolio-section" className="py-20 bg-neutral-950 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-amber-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spatial 3D Archive</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured 3D & Fine Art Portfolio
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-xl">
              Immerse yourself in high-resolution captures optimized for stereoscopic depth and medium-format dynamic range.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-neutral-900/90 border border-neutral-800">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                id={`filter-cat-${cat.toLowerCase()}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid with 3D Card Hover Depth */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative rounded-3xl overflow-hidden bg-neutral-900/60 border border-neutral-800/80 hover:border-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-neutral-900/80 backdrop-blur-md text-amber-300 border border-neutral-700/60">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-900/80 backdrop-blur-md text-emerald-400 border border-neutral-700/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    3D Depth
                  </span>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-neutral-900/90 text-white flex items-center justify-center border border-neutral-700 shadow-lg">
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{item.camera.split(' ')[0]}</span>
                  </div>
                  <div className="text-neutral-400">
                    {item.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox 3D Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-xl">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-8">
            <button
              type="button"
              id="close-lightbox-btn"
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div
                  className="relative rounded-2xl overflow-hidden border border-neutral-750 shadow-2xl aspect-[4/3] bg-black"
                  style={{
                    perspective: '1000px',
                  }}
                >
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover transition-transform duration-300"
                    style={{
                      transform: `rotateY(${(depthIntensity - 50) * 0.25}deg) scale(1.03)`
                    }}
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-neutral-950/80 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-neutral-800">
                    Interactive Parallax: {depthIntensity}%
                  </div>
                </div>

                {/* Parallax Slider */}
                <div className="mt-4 flex items-center gap-3 bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800">
                  <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-mono text-neutral-400 shrink-0">Parallax Tilt</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={depthIntensity}
                    onChange={(e) => setDepthIntensity(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-amber-400 shrink-0 font-bold">{depthIntensity}%</span>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300">
                  <span>{selectedItem.category} Capture</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white">
                  {selectedItem.title}
                </h3>

                <p className="text-sm text-neutral-300 leading-relaxed">
                  {selectedItem.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-neutral-800 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Master Photographer:</span>
                    <span className="text-white font-medium">{selectedItem.photographer}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Camera Body:</span>
                    <span className="text-amber-400">{selectedItem.camera}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Focal Lens:</span>
                    <span className="text-neutral-200">{selectedItem.lens}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Exposure Profile:</span>
                    <span className="text-neutral-200">{selectedItem.shutter}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-400">Location:</span>
                    <span className="text-neutral-200">{selectedItem.location}</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="lightbox-inquire-btn"
                  onClick={() => {
                    setSelectedItem(null);
                    const el = document.getElementById('booking-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full mt-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition-all"
                >
                  Book Session with Similar Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
