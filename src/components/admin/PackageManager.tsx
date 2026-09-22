import React, { useState } from 'react';
import { StudioPackage } from '../../types.ts';
import { api } from '../../services/api.ts';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  DollarSign,
  Clock,
  Sparkles,
  X
} from 'lucide-react';

interface PackageManagerProps {
  packages: StudioPackage[];
  onPackagesUpdated: () => void;
}

export const PackageManager: React.FC<PackageManagerProps> = ({
  packages,
  onPackagesUpdated,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<StudioPackage | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<StudioPackage['category']>('Wedding');
  const [price, setPrice] = useState(2500);
  const [durationHours, setDurationHours] = useState(6);
  const [featuresText, setFeaturesText] = useState('');
  const [deliverablesText, setDeliverablesText] = useState('');
  const [popular, setPopular] = useState(false);

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setName('');
    setCategory('Wedding');
    setPrice(2500);
    setDurationHours(6);
    setFeaturesText('Dual stereoscopic 3D cameras\nLead photographer + lighting assistant\n100 spatial captures');
    setDeliverablesText('Apple Vision Pro spatial format\nOnline 3D interactive gallery\nLenticular fine art print');
    setPopular(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: StudioPackage) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setCategory(pkg.category);
    setPrice(pkg.price);
    setDurationHours(pkg.durationHours);
    setFeaturesText(pkg.features.join('\n'));
    setDeliverablesText(pkg.deliverables ? pkg.deliverables.join('\n') : 'Apple Vision Pro spatial files\nHigh-res print files');
    setPopular(Boolean(pkg.isPopular || pkg.popular));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        category,
        price: Number(price),
        durationHours: Number(durationHours),
        photosDelivered: editingPkg?.photosDelivered || 150,
        features: featuresText.split('\n').map(s => s.trim()).filter(Boolean),
        deliverables: deliverablesText.split('\n').map(s => s.trim()).filter(Boolean),
        isPopular: popular,
        popular: popular,
        description: editingPkg?.description || `${name} specialized 3D spatial coverage`,
      };

      if (editingPkg) {
        await api.updatePackage(editingPkg.id, payload);
      } else {
        await api.createPackage(payload);
      }

      setIsModalOpen(false);
      onPackagesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to save package');
    }
  };

  const handleDelete = async (id: string, pkgName: string) => {
    if (!window.confirm(`Delete package: "${pkgName}"?`)) return;
    try {
      await api.deletePackage(id);
      onPackagesUpdated();
    } catch (e: any) {
      alert(e.message || 'Failed to delete package');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Studio Packages & Pricing Tiers
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Configure rates, included shoot duration, stereoscopic deliverables, and public showcase badges.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Tier</span>
        </button>
      </div>

      {/* Grid of Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => {
          const isFlagship = Boolean(pkg.isPopular || pkg.popular);
          return (
            <div
              key={pkg.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-xl ${
                isFlagship
                  ? 'bg-neutral-900 border-amber-500/60 shadow-amber-500/5'
                  : 'bg-neutral-900/80 border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-400 font-bold">
                    {pkg.category}
                  </span>
                  {isFlagship && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                      ★ Studio Flagship
                    </span>
                  )}
                </div>

              <h3 className="font-display text-xl font-bold text-white mt-3">
                {pkg.name}
              </h3>

              <div className="mt-3 flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-white">${pkg.price.toLocaleString()}</span>
                <span className="text-xs text-neutral-500">/ {pkg.durationHours} hrs coverage</span>
              </div>

              {/* Features list */}
              <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2 text-xs text-neutral-300">
                <div className="text-[11px] font-mono text-neutral-400 font-semibold">Included Features:</div>
                {pkg.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(pkg)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3 h-3 text-amber-400" />
                <span>Edit Tier</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(pkg.id, pkg.name)}
                className="p-1.5 rounded-lg bg-neutral-950 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                title="Delete package"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display text-2xl font-bold text-white">
                {editingPkg ? 'Edit Package' : 'Create Package Tier'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Package Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prestige 3D Wedding"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Events">Events</option>
                    <option value="Portrait">Portrait</option>
                    <option value="Product">Product</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Duration (Hours of Coverage)</label>
                <input
                  type="number"
                  required
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Features (one per line)</label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none resize-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pkg-popular"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-neutral-950 border-neutral-800"
                />
                <label htmlFor="pkg-popular" className="text-xs text-neutral-300 font-medium">
                  Feature as "Studio Flagship" on public website
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
