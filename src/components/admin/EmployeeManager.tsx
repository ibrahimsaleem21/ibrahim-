import React, { useState } from 'react';
import { Employee, EmployeeRole, AvailabilityStatus } from '../../types.ts';
import { api } from '../../services/api.ts';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  DollarSign,
  Star,
  Check,
  X,
  Sparkles,
  Camera,
  Calendar
} from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  onEmployeesUpdated: () => void;
  onViewEmployeeSchedule?: (emp: Employee) => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees,
  onEmployeesUpdated,
  onViewEmployeeSchedule,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<EmployeeRole>('Lead Photographer');
  const [avatar, setAvatar] = useState('');
  const [status, setStatus] = useState<AvailabilityStatus>('Available');
  const [hourlyRate, setHourlyRate] = useState(150);
  const [bio, setBio] = useState('');

  const filtered = employees.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || e.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setName('');
    setEmail('');
    setPhone('+1 (555) 000-0000');
    setRole('Lead Photographer');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setStatus('Available');
    setHourlyRate(140);
    setBio('Professional 3D spatial photographer.');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone);
    setRole(emp.role);
    setAvatar(emp.avatar);
    setStatus(emp.status);
    setHourlyRate(emp.hourlyRate);
    setBio(emp.bio);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email,
        phone,
        role,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        status,
        hourlyRate: Number(hourlyRate),
        bio,
        rating: editingEmp?.rating || 5.0,
      };

      if (editingEmp) {
        await api.updateEmployee(editingEmp.id, payload);
      } else {
        await api.createEmployee(payload);
      }

      setIsModalOpen(false);
      onEmployeesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to save staff member');
    }
  };

  const handleDelete = async (id: string, empName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${empName} from the roster?`)) return;
    try {
      await api.deleteEmployee(id);
      onEmployeesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  const handleQuickStatusChange = async (emp: Employee, newStatus: AvailabilityStatus) => {
    try {
      await api.updateEmployee(emp.id, { status: newStatus });
      onEmployeesUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Employee & Artist Management
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Manage photography roster, roles, hourly compensation rates, and real-time availability statuses.
          </p>
        </div>

        <button
          type="button"
          id="add-employee-btn"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Staff Member</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, role, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 outline-none focus:border-amber-500"
          >
            <option value="All">All Roles</option>
            <option value="Lead Photographer">Lead Photographer</option>
            <option value="3D Drone & Videographer">3D Drone & Videographer</option>
            <option value="Senior Retoucher & Editor">Senior Retoucher & Editor</option>
            <option value="Portrait & Studio Specialist">Portrait Specialist</option>
            <option value="Lighting Director">Lighting Director</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Event">On Event</option>
            <option value="Busy">Busy</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
          >
            <div>
              {/* Top row: Avatar, Name, Status Badge */}
              <div className="flex items-start gap-4">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-neutral-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-display text-base font-bold text-white truncate">
                      {emp.name}
                    </h3>
                    <div className="flex items-center text-amber-400 text-xs font-mono shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                      {emp.rating}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-amber-400 truncate mt-0.5">
                    {emp.role}
                  </div>

                  {/* Status Dropdown Pill */}
                  <div className="mt-2">
                    <select
                      value={emp.status}
                      onChange={(e) => handleQuickStatusChange(emp, e.target.value as any)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border outline-none cursor-pointer ${
                        emp.status === 'Available'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : emp.status === 'On Event'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : emp.status === 'Busy'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      <option value="Available">🟢 Available</option>
                      <option value="On Event">🔵 On Event</option>
                      <option value="Busy">🟡 Busy</option>
                      <option value="On Leave">⚪ On Leave</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-neutral-400 mt-4 line-clamp-2">
                {emp.bio}
              </p>

              {/* Contact info & Rate */}
              <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1.5 text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span>{emp.phone}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Rate: <span className="text-white font-bold">${emp.hourlyRate}/hr</span></span>
                  <span>Assigned Events: <span className="text-amber-400 font-bold">{emp.eventsCount || 0}</span></span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
              {onViewEmployeeSchedule && (
                <button
                  type="button"
                  onClick={() => onViewEmployeeSchedule(emp)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-mono flex items-center gap-1 transition-colors"
                >
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>View Schedule</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  id={`edit-emp-${emp.id}`}
                  onClick={() => handleOpenEdit(emp)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  title="Edit details"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                </button>
                <button
                  type="button"
                  id={`delete-emp-${emp.id}`}
                  onClick={() => handleDelete(emp.id, emp.name)}
                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                  title="Delete from roster"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <button
              type="button"
              id="close-emp-modal-btn"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display text-2xl font-bold text-white">
                {editingEmp ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Configure profile details, specialized role, and rate.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Raza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Email Address <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ali@lumen3d.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Staff Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                  >
                    <option value="Lead Photographer">Lead Photographer</option>
                    <option value="3D Drone & Videographer">3D Drone & Videographer</option>
                    <option value="Senior Retoucher & Editor">Senior Retoucher & Editor</option>
                    <option value="Portrait & Studio Specialist">Portrait Specialist</option>
                    <option value="Lighting Director">Lighting Director</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Availability Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="On Event">On Event</option>
                    <option value="Busy">Busy</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Hourly Compensation ($/hr)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Profile Avatar URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none truncate"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Biography & Specialties
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Mastery in stereoscopic lighting, bridal portraits..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
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
                  Save Staff Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
