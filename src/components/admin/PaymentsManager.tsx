import React, { useState } from 'react';
import { StudioEvent, PaymentRecord } from '../../types.ts';
import { api } from '../../services/api.ts';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Calendar,
  X,
  ArrowUpRight
} from 'lucide-react';

interface PaymentsManagerProps {
  events: StudioEvent[];
  onEventsUpdated: () => void;
}

export const PaymentsManager: React.FC<PaymentsManagerProps> = ({
  events,
  onEventsUpdated,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Pending'>('All');
  const [selectedEvent, setSelectedEvent] = useState<StudioEvent | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Wire Transfer' | 'Stripe' | 'Cash'>('Wire Transfer');
  const [isRecording, setIsRecording] = useState(false);

  const totalContracted = events.reduce((acc, ev) => acc + (ev.price || 0), 0);
  const totalCollected = events.reduce((acc, ev) => acc + (ev.paidAmount || 0), 0);
  const pendingBalance = totalContracted - totalCollected;

  const filteredEvents = events.filter(e => {
    if (statusFilter === 'All') return true;
    return e.paymentStatus === statusFilter;
  });

  const handleOpenRecordPayment = (ev: StudioEvent) => {
    setSelectedEvent(ev);
    const balance = ev.price - (ev.paidAmount || 0);
    setPaymentAmount(balance > 0 ? balance : 500);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      setIsRecording(true);
      const newPaidTotal = (selectedEvent.paidAmount || 0) + Number(paymentAmount);
      const newStatus = newPaidTotal >= selectedEvent.price ? 'Paid' : newPaidTotal > 0 ? 'Partial' : 'Pending';

      await api.updateEvent(selectedEvent.id, {
        paidAmount: newPaidTotal,
        paymentStatus: newStatus as any,
      });

      setSelectedEvent(null);
      onEventsUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Studio Financials & Payment Ledgers
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Tracking invoice states, deposits, balances, and multi-tier booking settlements.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
          {(['All', 'Paid', 'Partial', 'Pending'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all ${
                statusFilter === tab
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="text-xs font-mono text-neutral-400">Total Contract Value</div>
          <div className="font-display text-2xl font-bold text-white mt-1">
            ${totalContracted.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-2">Across all booked events</div>
        </div>

        <div className="p-5 rounded-3xl bg-neutral-900 border border-emerald-500/30 shadow-sm">
          <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Total Collected</span>
          </div>
          <div className="font-display text-2xl font-bold text-emerald-400 mt-1">
            ${totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono mt-2">
            {((totalCollected / (totalContracted || 1)) * 100).toFixed(1)}% Realized
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-neutral-900 border border-amber-500/30 shadow-sm">
          <div className="text-xs font-mono text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Outstanding Receivables</span>
          </div>
          <div className="font-display text-2xl font-bold text-amber-400 mt-1">
            ${pendingBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono mt-2">Due on shoot delivery</div>
        </div>
      </div>

      {/* Events Payment Ledger Table */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white">
            Client Invoicing & Payment Records ({filteredEvents.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 font-semibold">Event / Client</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Contract</th>
                <th className="pb-3 font-semibold">Collected</th>
                <th className="pb-3 font-semibold">Balance Due</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredEvents.map(ev => {
                const balance = ev.price - (ev.paidAmount || 0);

                return (
                  <tr key={ev.id} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-sans font-bold text-white text-sm">{ev.title}</div>
                      <div className="text-neutral-400 text-xs font-mono">{ev.clientName}</div>
                    </td>
                    <td className="py-3.5 text-neutral-300">
                      {ev.date}
                    </td>
                    <td className="py-3.5 text-white font-bold">
                      ${ev.price.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-emerald-400 font-bold">
                      ${(ev.paidAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-amber-400 font-bold">
                      ${balance.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.paymentStatus === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ev.paymentStatus === 'Partial'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {ev.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {balance > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleOpenRecordPayment(ev)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-neutral-950 border border-amber-500/40 text-[11px] font-medium transition-all"
                        >
                          + Record Payment
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-[11px]">Paid in Full</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display text-2xl font-bold text-white">
                Record Payment
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Logging payment for <span className="text-white font-bold">{selectedEvent.title}</span>.
              </p>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Total Fee:</span>
                  <span>${selectedEvent.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Already Paid:</span>
                  <span>${(selectedEvent.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold border-t border-neutral-800 pt-1">
                  <span>Current Outstanding Balance:</span>
                  <span>${(selectedEvent.price - (selectedEvent.paidAmount || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Payment Amount Received ($)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:border-amber-500 outline-none"
                >
                  <option value="Wire Transfer">Wire Transfer (FedNow / SWIFT)</option>
                  <option value="Credit Card">Credit Card (Stripe Checkout)</option>
                  <option value="Stripe">ACH Direct Debit</option>
                  <option value="Cash">Cash / Escrow</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecording}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
                >
                  {isRecording ? 'Logging...' : 'Confirm & Post Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
