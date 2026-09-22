import React, { useState } from 'react';
import { Lead, Employee, StudioEvent } from '../../types.ts';
import { api } from '../../services/api.ts';
import {
  Inbox,
  Calendar,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Clock,
  MapPin,
  Sparkles,
  Users,
  X
} from 'lucide-react';

interface LeadsManagerProps {
  leads: Lead[];
  employees: Employee[];
  onLeadsUpdated: () => void;
  onLeadConvertedToEvent?: (event: StudioEvent) => void;
}

export const LeadsManager: React.FC<LeadsManagerProps> = ({
  leads,
  employees,
  onLeadsUpdated,
  onLeadConvertedToEvent,
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await api.updateLeadStatus(leadId, newStatus);
      onLeadsUpdated();
    } catch (e: any) {
      alert(e.message || 'Failed to update lead');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await api.deleteLead(leadId);
      onLeadsUpdated();
    } catch (e: any) {
      alert(e.message || 'Failed to delete lead');
    }
  };

  const handleOpenConvertModal = (lead: Lead) => {
    setSelectedLead(lead);
    setAssignedEmployeeIds([employees[0]?.id || 'emp-1']);
  };

  const handleToggleEmployee = (id: string) => {
    setAssignedEmployeeIds(prev =>
      prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
    );
  };

  const handleConfirmConvert = async () => {
    if (!selectedLead) return;
    try {
      setIsConverting(true);
      const res = await api.convertLeadToEvent(selectedLead.id, assignedEmployeeIds);
      setSelectedLead(null);
      onLeadsUpdated();
      if (onLeadConvertedToEvent) {
        onLeadConvertedToEvent(res.event);
      }
      alert(`Success! Lead converted to confirmed scheduled event: "${res.event.title}" on ${res.event.date}`);
    } catch (err: any) {
      alert(err.message || 'Failed to convert lead');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Client Leads & Booking Inquiries
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Inquiries captured through the public 3D website. Convert inquiries directly to scheduled events with crew assignments.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Total Inquiries: <strong className="text-white">{leads.length}</strong></span>
        </div>
      </div>

      {/* Leads Table / Cards */}
      <div className="space-y-4">
        {leads.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-neutral-900/60 border border-neutral-800 text-neutral-400 text-xs">
            No booking inquiries received yet. Submit an inquiry from the public website booking section!
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className={`p-6 rounded-3xl border transition-all space-y-4 ${
                lead.status === 'New'
                  ? 'bg-neutral-900 border-amber-500/50 shadow-lg shadow-amber-500/5'
                  : 'bg-neutral-900/60 border-neutral-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold ${
                    lead.status === 'New'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : lead.status === 'Converted'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : lead.status === 'Contacted'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {lead.status} Lead
                  </span>
                  <span className="font-mono text-neutral-500 text-[11px]">
                    ID: {lead.id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 outline-none"
                  >
                    <option value="New">Status: New</option>
                    <option value="Contacted">Status: Contacted</option>
                    <option value="Converted">Status: Converted</option>
                    <option value="Archived">Status: Archived</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDeleteLead(lead.id)}
                    className="p-1.5 rounded-lg bg-neutral-950 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                    title="Delete lead"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Lead Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-8 space-y-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">
                      {lead.clientName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 mt-1">
                      <span className="flex items-center gap-1.5 text-neutral-300">
                        <Mail className="w-3.5 h-3.5 text-neutral-500" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-1.5 text-neutral-300">
                          <Phone className="w-3.5 h-3.5 text-neutral-500" />
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes / Message */}
                  <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300">
                    <span className="text-[10px] font-mono text-amber-400 block mb-1">Client Message:</span>
                    "{lead.message}"
                  </div>
                </div>

                <div className="md:col-span-4 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Event Category:</span>
                    <span className="text-white font-bold">{lead.eventType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Target Date:</span>
                    <span className="text-amber-400 font-bold">{lead.preferredDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Package:</span>
                    <span className="text-neutral-200 truncate max-w-[130px]">{lead.packageName}</span>
                  </div>
                  {lead.budget && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Budget:</span>
                      <span className="text-emerald-400 font-bold">${lead.budget.toLocaleString()}</span>
                    </div>
                  )}

                  {/* 1-Click Convert Button */}
                  <div className="pt-3 border-t border-neutral-800">
                    {lead.status === 'Converted' ? (
                      <div className="py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Converted to Calendar Event</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenConvertModal(lead)}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Convert to Scheduled Event</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CONVERT LEAD MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <button
              type="button"
              onClick={() => setSelectedLead(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display text-2xl font-bold text-white">
                Convert Inquiry to Event
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Scheduling event for <span className="text-white font-bold">{selectedLead.clientName}</span> on <span className="text-amber-400 font-mono">{selectedLead.preferredDate}</span>.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Assign Staff Member(s) to this Event:</span>
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {employees.map((emp) => {
                  const isChecked = assignedEmployeeIds.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleToggleEmployee(emp.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-neutral-800 border-amber-500 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-7 h-7 rounded-xl object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{emp.name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{emp.role}</div>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isChecked ? 'bg-amber-500 border-amber-500 text-neutral-950' : 'border-neutral-700'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isConverting}
                onClick={handleConfirmConvert}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
              >
                {isConverting ? 'Scheduling...' : 'Confirm & Add to Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
