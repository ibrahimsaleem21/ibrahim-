import React, { useState, useEffect } from 'react';
import { StudioEvent, Employee, StudioPackage, ConflictCheckResult } from '../../types.ts';
import { api } from '../../services/api.ts';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Users,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface EventSchedulerProps {
  employees: Employee[];
  packages: StudioPackage[];
  events: StudioEvent[];
  onEventsUpdated: () => void;
  activeEmployeeId?: string; // If in employee-only view
}

export const EventScheduler: React.FC<EventSchedulerProps> = ({
  employees,
  packages,
  events,
  onEventsUpdated,
  activeEmployeeId,
}) => {
  // Calendar navigation state (defaults to September 2026 based on seed data)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed, 8 = September
  const [selectedDate, setSelectedDate] = useState('2026-09-24'); // Selected date with multiple events

  // Filter state for list view
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<StudioEvent | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formStartTime, setFormStartTime] = useState('10:00');
  const [formEndTime, setFormEndTime] = useState('14:00');
  const [formLocation, setFormLocation] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formEventType, setFormEventType] = useState<StudioEvent['eventType']>('Wedding');
  const [formPackageId, setFormPackageId] = useState(packages[0]?.id || 'pkg-2');
  const [formPrice, setFormPrice] = useState(3400);
  const [formPaidAmount, setFormPaidAmount] = useState(0);
  const [formStatus, setFormStatus] = useState<StudioEvent['status']>('Confirmed');
  const [formAssignedEmployees, setFormAssignedEmployees] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState('');

  // Conflict state
  const [conflictWarning, setConflictWarning] = useState<ConflictCheckResult | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filter events if activeEmployeeId is provided (employee-only view)
  const displayEvents = activeEmployeeId
    ? events.filter(e => e.assignedEmployeeIds.includes(activeEmployeeId))
    : events;

  // Real-time conflict detection on form change
  useEffect(() => {
    if (!isModalOpen) return;

    const check = async () => {
      if (!formDate || !formStartTime || !formEndTime || formAssignedEmployees.length === 0) {
        setConflictWarning(null);
        return;
      }
      try {
        setIsCheckingConflict(true);
        const result = await api.checkConflict({
          date: formDate,
          startTime: formStartTime,
          endTime: formEndTime,
          assignedEmployeeIds: formAssignedEmployees,
          excludeEventId: editingEvent ? editingEvent.id : undefined,
        });
        if (result.hasConflict) {
          setConflictWarning(result);
        } else {
          setConflictWarning(null);
        }
      } catch (e) {
        console.error('Conflict check error:', e);
      } finally {
        setIsCheckingConflict(false);
      }
    };

    const timer = setTimeout(check, 300);
    return () => clearTimeout(timer);
  }, [formDate, formStartTime, formEndTime, formAssignedEmployees, editingEvent, isModalOpen]);

  // Open Create Modal
  const handleOpenCreate = (date?: string) => {
    setEditingEvent(null);
    const targetDate = date || selectedDate;
    setFormDate(targetDate);
    setFormTitle('');
    setFormStartTime('10:00');
    setFormEndTime('15:00');
    setFormLocation('Greystone Mansion or Studio A');
    setFormClientName('');
    setFormClientEmail('');
    setFormClientPhone('');
    setFormEventType('Wedding');
    setFormPackageId(packages[1]?.id || packages[0]?.id || 'pkg-2');
    const p = packages[1] || packages[0];
    setFormPrice(p ? p.price : 3400);
    setFormPaidAmount(0);
    setFormStatus('Confirmed');
    setFormAssignedEmployees([]);
    setFormNotes('');
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (ev: StudioEvent) => {
    setEditingEvent(ev);
    setFormDate(ev.date);
    setFormTitle(ev.title);
    setFormStartTime(ev.startTime);
    setFormEndTime(ev.endTime);
    setFormLocation(ev.location);
    setFormClientName(ev.clientName);
    setFormClientEmail(ev.clientEmail);
    setFormClientPhone(ev.clientPhone);
    setFormEventType(ev.eventType);
    setFormPackageId(ev.packageId);
    setFormPrice(ev.price);
    setFormPaidAmount(ev.paidAmount || 0);
    setFormStatus(ev.status);
    setFormAssignedEmployees([...ev.assignedEmployeeIds]);
    setFormNotes(ev.notes || '');
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  // Toggle Employee Assignment
  const handleToggleEmployee = (empId: string) => {
    setFormAssignedEmployees(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  // Save Event
  const handleSaveEvent = async (forceOverride = false) => {
    if (!formTitle || !formDate || !formStartTime || !formEndTime) {
      alert('Please fill in event title, date, and start/end times.');
      return;
    }

    try {
      setIsSaving(true);
      const chosenPkg = packages.find(p => p.id === formPackageId);

      const payload = {
        title: formTitle,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        location: formLocation || 'Studio Main Stage',
        clientName: formClientName || 'Private Client',
        clientEmail: formClientEmail || 'client@example.com',
        clientPhone: formClientPhone || '',
        eventType: formEventType,
        packageId: formPackageId,
        packageName: chosenPkg?.name || 'Custom Package',
        price: Number(formPrice),
        paidAmount: Number(formPaidAmount),
        paymentStatus: (Number(formPaidAmount) >= Number(formPrice) ? 'Paid' : Number(formPaidAmount) > 0 ? 'Partial' : 'Pending') as any,
        status: formStatus,
        assignedEmployeeIds: formAssignedEmployees,
        notes: formNotes,
      };

      if (editingEvent) {
        await api.updateEvent(editingEvent.id, {
          ...payload,
          forceUpdate: forceOverride,
        });
      } else {
        await api.createEvent({
          ...payload,
          forceCreate: forceOverride,
        });
      }

      setIsModalOpen(false);
      onEventsUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to cancel and delete the event: "${title}"?`)) {
      return;
    }
    try {
      await api.deleteEvent(id);
      onEventsUpdated();
    } catch (e: any) {
      alert(e.message || 'Failed to delete event');
    }
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Events on the selected day
  const eventsOnSelectedDate = displayEvents.filter(e => e.date === selectedDate);

  return (
    <div className="space-y-8">
      
      {/* Top Header & Quick Schedule Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Event & Multi-Event Scheduling System
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Multiple concurrent events per date with individual employee assignments and real-time conflict detection.
          </p>
        </div>

        <button
          type="button"
          id="admin-create-event-top-btn"
          onClick={() => handleOpenCreate(selectedDate)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Event Booking</span>
        </button>
      </div>

      {/* Main Grid: Calendar Month Grid (Left) + Day's Multi-Event Schedule Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Month Calendar */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="font-display text-lg font-bold text-white">
              {monthNames[currentMonth]} {currentYear}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="cal-prev-month-btn"
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="cal-next-month-btn"
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-neutral-400 font-semibold py-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty prefix cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-14 rounded-xl bg-neutral-950/30" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = displayEvents.filter(e => e.date === dateStr);
              const isSelected = selectedDate === dateStr;
              const hasMultiEvents = dayEvents.length > 1;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-14 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white font-bold ring-1 ring-amber-500/50'
                      : dayEvents.length > 0
                      ? 'bg-neutral-800/80 border-neutral-700 text-neutral-200 hover:border-neutral-500'
                      : 'bg-neutral-950/60 border-neutral-850 text-neutral-400 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={isSelected ? 'text-amber-400' : ''}>{dayNum}</span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono px-1 rounded bg-neutral-900 text-neutral-300 font-bold">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Visual Event Pills */}
                  {dayEvents.length > 0 && (
                    <div className="flex items-center gap-1 overflow-hidden">
                      {hasMultiEvents ? (
                        <div className="text-[9px] font-mono font-bold text-amber-300 truncate bg-amber-500/20 px-1 py-0.5 rounded w-full text-center">
                          {dayEvents.length} Events!
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] font-mono text-neutral-400 flex items-center justify-between border-t border-neutral-800">
            <span>Dates with multiple events highlight concurrent bookings.</span>
            <span className="text-amber-400 font-bold">Selected: {selectedDate}</span>
          </div>
        </div>

        {/* Right: Day's Schedule Timeline (Multi-Event Mini Scheduler) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <span>Day Schedule Timeline</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                  {selectedDate}
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {eventsOnSelectedDate.length === 0
                  ? 'No events scheduled for this day.'
                  : `${eventsOnSelectedDate.length} separate event${eventsOnSelectedDate.length > 1 ? 's' : ''} running on this date`}
              </p>
            </div>

            <button
              type="button"
              id="add-event-to-selected-date-btn"
              onClick={() => handleOpenCreate(selectedDate)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add to This Date</span>
            </button>
          </div>

          {/* Cards for each event on this date */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {eventsOnSelectedDate.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-neutral-950/50 border border-neutral-850 space-y-3">
                <CalendarIcon className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400">
                  No photography sessions booked for {selectedDate}.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenCreate(selectedDate)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold shadow-md hover:bg-amber-400 transition-all"
                >
                  Create Booking for {selectedDate}
                </button>
              </div>
            ) : (
              eventsOnSelectedDate.map((ev, index) => {
                const assignedEmps = employees.filter(e => ev.assignedEmployeeIds.includes(e.id));

                return (
                  <div
                    key={ev.id}
                    className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all space-y-3 relative group"
                  >
                    {/* Top Row: Event Number Badge, Time, and Status */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center border border-amber-500/30">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-1 font-mono text-amber-400 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{ev.startTime} – {ev.endTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                          {ev.eventType}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          ev.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}>
                          {ev.status}
                        </span>
                      </div>
                    </div>

                    {/* Title & Location */}
                    <div>
                      <h4 className="font-display text-base font-bold text-white">
                        {ev.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </div>

                    {/* Client & Pricing */}
                    <div className="flex items-center justify-between text-xs py-2 border-y border-neutral-900 text-neutral-400">
                      <div>
                        Client: <span className="text-neutral-200 font-medium">{ev.clientName}</span>
                      </div>
                      <div className="font-mono">
                        ${ev.price.toLocaleString()} • <span className={ev.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>{ev.paymentStatus}</span>
                      </div>
                    </div>

                    {/* Assigned Employees (Core requirement!) */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-neutral-300">
                          <Users className="w-3 h-3 text-amber-400" />
                          Assigned Staff ({assignedEmps.length}):
                        </span>
                        <span className="text-neutral-500 text-[10px]">Specific to this Event</span>
                      </div>

                      {assignedEmps.length === 0 ? (
                        <div className="text-xs text-rose-400/90 font-mono italic">
                          ⚠️ No crew assigned yet! Click Edit to assign.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {assignedEmps.map(emp => (
                            <div
                              key={emp.id}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
                            >
                              <img
                                src={emp.avatar}
                                alt={emp.name}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                              <span className="font-medium">{emp.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">({emp.role.split(' ')[0]})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        id={`edit-event-${ev.id}`}
                        onClick={() => handleOpenEdit(ev)}
                        className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-amber-400" />
                        <span>Edit / Reassign</span>
                      </button>

                      <button
                        type="button"
                        id={`delete-event-${ev.id}`}
                        onClick={() => handleDeleteEvent(ev.id, ev.title)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 text-xs transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6">
            
            <button
              type="button"
              id="close-event-modal-btn"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display text-2xl font-bold text-white">
                {editingEvent ? 'Edit Scheduled Event & Crew' : 'Schedule New Event'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Configure event timing, venue details, and assign specific photographers. Double-booking checks run automatically.
              </p>
            </div>

            {/* REAL-TIME DOUBLE-BOOKING CONFLICT ALERT BANNER */}
            {conflictWarning && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Double-Booking Conflict Detected!</span>
                </div>
                <p className="text-neutral-200">
                  The following staff member(s) are already booked for another event with overlapping times on <span className="font-mono text-amber-300 font-bold">{formDate}</span>:
                </p>
                <div className="space-y-1.5 pl-2">
                  {conflictWarning.conflictingEmployees.map((conf, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-neutral-950/80 border border-amber-500/40 text-[11px] font-mono">
                      <span className="text-amber-400 font-bold">{conf.employeeName}</span> is assigned to <span className="text-white">"{conf.conflictingEventTitle}"</span> ({conf.startTime} – {conf.endTime})
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-neutral-300 pt-1">
                  Adjust event start/end times, remove the conflicting staff, or check "Force Override" below if this double-assignment is intentional.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event Title */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Event Title / Headline <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vance-Rothschild Estate Wedding"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Date <span className="text-amber-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              {/* Event Type */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Event Type
                </label>
                <select
                  value={formEventType}
                  onChange={(e) => setFormEventType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Portrait">Portrait</option>
                  <option value="Product">Product 3D</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Architectural">Architectural</option>
                </select>
              </div>

              {/* Start Time */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Start Time <span className="text-amber-400">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              {/* End Time */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  End Time <span className="text-amber-400">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              {/* Venue / Location */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Venue / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Greystone Mansion, Beverly Hills"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Client Info */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Client Full Name
                </label>
                <input
                  type="text"
                  placeholder="Alexander Vance"
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Client Email
                </label>
                <input
                  type="email"
                  placeholder="alex@vance.com"
                  value={formClientEmail}
                  onChange={(e) => setFormClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Package & Pricing */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Service Package
                </label>
                <select
                  value={formPackageId}
                  onChange={(e) => {
                    setFormPackageId(e.target.value);
                    const chosen = packages.find(p => p.id === e.target.value);
                    if (chosen) setFormPrice(chosen.price);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                >
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Total Event Fee ($)
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Amount Paid So Far ($)
                </label>
                <input
                  type="number"
                  value={formPaidAmount}
                  onChange={(e) => setFormPaidAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Event Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* MULTI-EMPLOYEE ASSIGNMENT SECTION (Core requirement!) */}
            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Assign Staff / Artists to this Specific Event</span>
                  </label>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Select one or more employees. An employee can be assigned to different events throughout the day as long as timings do not conflict.
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {formAssignedEmployees.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {employees.map(emp => {
                  const isAssigned = formAssignedEmployees.includes(emp.id);
                  const isConflicting = conflictWarning?.conflictingEmployees.some(c => c.employeeId === emp.id);

                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleToggleEmployee(emp.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isAssigned
                          ? isConflicting
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-neutral-800 border-amber-500/60 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-8 h-8 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                            <span>{emp.name}</span>
                            {isConflicting && (
                              <span className="text-[10px] text-amber-400 font-mono font-bold">⚠️ Busy</span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono truncate">
                            {emp.role}
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        isAssigned
                          ? 'bg-amber-500 border-amber-500 text-neutral-950'
                          : 'border-neutral-700'
                      }`}>
                        {isAssigned && <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1 pt-2 border-t border-neutral-800">
              <label className="text-xs font-medium text-neutral-300">
                Special Shoot Directives & Production Notes
              </label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Equipment requirements, drone permits, client moodboard..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-neutral-800">
              <div className="text-xs font-mono text-neutral-400">
                {isCheckingConflict ? (
                  <span className="text-amber-400">Checking schedule availability...</span>
                ) : conflictWarning ? (
                  <span className="text-amber-400 font-bold">Overlapping booking detected!</span>
                ) : (
                  <span className="text-emerald-400">✓ No timing conflicts</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="cancel-event-modal-btn"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>

                {conflictWarning ? (
                  <button
                    type="button"
                    id="save-event-override-btn"
                    disabled={isSaving}
                    onClick={() => handleSaveEvent(true)}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-bold shadow-lg transition-all"
                  >
                    Force Override & Save
                  </button>
                ) : (
                  <button
                    type="button"
                    id="save-event-btn"
                    disabled={isSaving}
                    onClick={() => handleSaveEvent(false)}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
                  >
                    {isSaving ? 'Saving...' : editingEvent ? 'Save Changes' : 'Confirm & Schedule'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
