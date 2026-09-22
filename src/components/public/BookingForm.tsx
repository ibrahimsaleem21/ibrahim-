import React, { useState, useEffect } from 'react';
import { StudioPackage, EventType, Lead } from '../../types.ts';
import { api } from '../../services/api.ts';
import { Calendar, CheckCircle2, Send, Sparkles, AlertCircle, Clock, MapPin, DollarSign } from 'lucide-react';

interface BookingFormProps {
  packages: StudioPackage[];
  preselectedPackage: StudioPackage | null;
  onLeadCreated: (lead: Lead) => void;
  onOpenAdmin: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  packages,
  preselectedPackage,
  onLeadCreated,
  onOpenAdmin,
}) => {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState<EventType>('Wedding');
  const [preferredDate, setPreferredDate] = useState('2026-10-18');
  const [packageId, setPackageId] = useState(preselectedPackage?.id || packages[0]?.id || 'pkg-2');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [budget, setBudget] = useState<number>(3400);
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedPackage) {
      setPackageId(preselectedPackage.id);
      setBudget(preselectedPackage.price);
    }
  }, [preselectedPackage]);

  const handlePackageChange = (id: string) => {
    setPackageId(id);
    const chosen = packages.find(p => p.id === id);
    if (chosen) {
      setBudget(chosen.price);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clientName || !email || !preferredDate) {
      setErrorMsg('Please fill in your name, email, and preferred event date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const chosenPackage = packages.find(p => p.id === packageId);
      const lead = await api.createLead({
        clientName,
        email,
        phone,
        eventType,
        preferredDate,
        packageId,
        packageName: chosenPackage?.name || 'Custom Package',
        location: location || 'Client Venue',
        guestCount: Number(guestCount) || undefined,
        budget: Number(budget) || undefined,
        message: message || `Client requested ${eventType} photography on ${preferredDate}.`
      });

      setSubmittedLead(lead);
      onLeadCreated(lead);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit booking inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedLead(null);
    setClientName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setMessage('');
  };

  return (
    <section id="booking-section" className="py-20 bg-neutral-950 border-t border-neutral-900 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-amber-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Direct Studio Inquiries</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Reserve Your 3D Session
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
            Submit your event details below. Submissions instantly create an active lead in our studio admin schedule for artist assignment.
          </p>
        </div>

        {/* Success Confirmation Card */}
        {submittedLead ? (
          <div className="p-8 rounded-3xl bg-neutral-900 border border-emerald-500/40 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-white">
                Inquiry Received, {submittedLead.clientName}!
              </h3>
              <p className="text-neutral-300 text-sm max-w-md mx-auto">
                Your reservation request for <span className="text-amber-400 font-semibold">{submittedLead.eventType}</span> on <span className="text-amber-400 font-mono">{submittedLead.preferredDate}</span> has been logged to the studio dispatch desk.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
              <span>Lead Reference:</span>
              <span className="text-amber-400 font-bold">{submittedLead.id}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Status: New Lead</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                id="view-lead-in-admin-btn"
                onClick={onOpenAdmin}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-lg transition-all"
              >
                View this Lead in Admin Panel →
              </button>
              <button
                type="button"
                id="submit-another-inquiry-btn"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-10 rounded-3xl bg-neutral-900/70 border border-neutral-800 shadow-2xl space-y-6"
          >
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Client Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300" htmlFor="booking-name">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  id="booking-name"
                  type="text"
                  required
                  placeholder="e.g. Victoria Hastings"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300" htmlFor="booking-email">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <input
                  id="booking-email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300" htmlFor="booking-phone">
                  Phone Number
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>

              {/* Event Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300" htmlFor="booking-event-type">
                  Event Category
                </label>
                <select
                  id="booking-event-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white outline-none transition-all"
                >
                  <option value="Wedding">Wedding & Ceremony</option>
                  <option value="Corporate">Corporate Summit & Gala</option>
                  <option value="Birthday">Private Celebration / Birthday</option>
                  <option value="Portrait">Fine Art Studio Portrait</option>
                  <option value="Product">Commercial 3D Product Capture</option>
                  <option value="Fashion">Fashion & Haute Couture</option>
                  <option value="Architectural">Architectural & Spatial</option>
                </select>
              </div>

              {/* Preferred Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300" htmlFor="booking-date">
                  Target Event Date <span className="text-amber-400">*</span>
                </label>
                <input
                  id="booking-date"
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white outline-none transition-all font-mono"
                />
              </div>

              {/* Package Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300" htmlFor="booking-pkg">
                  Preferred Service Tier
                </label>
                <select
                  id="booking-pkg"
                  value={packageId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white outline-none transition-all"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.price.toLocaleString()} ({p.durationHours} hrs)
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300" htmlFor="booking-location">
                  Venue / Location
                </label>
                <input
                  id="booking-location"
                  type="text"
                  placeholder="e.g. Greystone Mansion or Studio A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>

              {/* Estimated Budget */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300" htmlFor="booking-budget">
                  Budget (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-neutral-500 text-sm">$</span>
                  <input
                    id="booking-budget"
                    type="number"
                    min="500"
                    step="100"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Message / Creative Vision */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300" htmlFor="booking-message">
                Creative Vision & Specific Requirements
              </label>
              <textarea
                id="booking-message"
                rows={3}
                placeholder="Tell us about the atmosphere, special guest requests, lighting preferences, or 3D lenticular needs..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-neutral-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant confirmation & admin schedule dispatch</span>
              </div>

              <button
                type="submit"
                id="submit-booking-form-btn"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Dispatching to Admin Desk...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Booking Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </section>
  );
};
