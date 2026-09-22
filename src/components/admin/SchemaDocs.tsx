import React, { useState } from 'react';
import { Database, FileCode, CheckCircle2, AlertTriangle, Layers, ShieldCheck, Copy, Check } from 'lucide-react';

export const SchemaDocs: React.FC = () => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const mongoCode = `// MongoDB / Mongoose Production Schema
// 1. Events Collection (supports multi-event per day)
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  startTime: { type: String, required: true },        // Format: HH:mm (24hr)
  endTime: { type: String, required: true },          // Format: HH:mm (24hr)
  location: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String },
  eventType: {
    type: String,
    enum: ['Wedding', 'Birthday', 'Corporate', 'Portrait', 'Product', 'Fashion', 'Architectural'],
    required: true
  },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  packageName: { type: String },
  price: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Paid', 'Partial', 'Pending'], default: 'Pending' },
  status: { type: String, enum: ['Confirmed', 'In Progress', 'Completed', 'Cancelled'], default: 'Confirmed' },
  assignedEmployeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }], // Many-to-many
  notes: { type: String },
}, { timestamps: true });

// Compound Index for High-Velocity Date & Multi-Event Lookups
EventSchema.index({ date: 1, startTime: 1 });
EventSchema.index({ assignedEmployeeIds: 1, date: 1 });`;

  const conflictMath = `// Conflict Resolution Interval Rule:
// Overlap condition between Event A and Event B on the same date:
// const hasOverlap = (startA < endB) && (endA > startB);
//
// In our backend implementation (server/db.ts):
const toMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const hasOverlap = (s1: string, e1: string, s2: string, e2: string) => {
  const startA = toMinutes(s1);
  const endA = toMinutes(e1);
  const startB = toMinutes(s2);
  const endB = toMinutes(e2);
  return startA < endB && endA > startB;
};`;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Database Schema & Multi-Event Architecture
          </h2>
        </div>
        <p className="text-xs text-neutral-400 max-w-3xl">
          Specification for relational and document-oriented databases supporting multiple events per single calendar date, granular employee assignment, and automated double-booking prevention.
        </p>
      </div>

      {/* Core Architectural Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
            <Layers className="w-4 h-4" />
            <span>1. Multi-Event per Day</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            The calendar date is treated as an indexed attribute rather than a primary key. Multiple distinct events (e.g. Morning Wedding + Evening Gala) exist as separate records sharing the same date with different time windows.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>2. Granular Event Assignment</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Employees are attached directly to specific event IDs through <code className="text-amber-400 font-mono text-[11px]">assignedEmployeeIds[]</code>. An artist can shoot Event 1 in the morning and Event 2 in the evening safely.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Mathematical Conflict Detection</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Overlaps are evaluated using interval intersection algebra: <code className="text-amber-400 font-mono text-[11px]">(startA &lt; endB) &amp;&amp; (endA &gt; startB)</code>. Double-booking warnings trigger instantly in the UI.
          </p>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mongo Schema */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-white font-bold">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>MongoDB / Mongoose Model</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(mongoCode, 'mongo')}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition-colors"
            >
              {copiedTab === 'mongo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
            {mongoCode}
          </pre>
        </div>

        {/* Conflict Detection Math */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-white font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Conflict Resolution Logic</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(conflictMath, 'math')}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition-colors"
            >
              {copiedTab === 'math' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 text-[11px] font-mono text-amber-300 overflow-x-auto leading-relaxed">
            {conflictMath}
          </pre>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 text-xs text-neutral-400 space-y-2">
            <div className="font-bold text-white text-xs font-mono">Backend API Endpoints:</div>
            <div className="grid grid-cols-1 gap-1 text-[11px] font-mono">
              <div><span className="text-emerald-400 font-bold">POST</span> /api/events/check-conflict — Real-time overlap validator</div>
              <div><span className="text-emerald-400 font-bold">GET</span> /api/events?date=YYYY-MM-DD — Day schedule filter</div>
              <div><span className="text-emerald-400 font-bold">GET</span> /api/events?employeeId=emp-1 — Employee-only schedule</div>
              <div><span className="text-emerald-400 font-bold">GET</span> /api/analytics — Filterable aggregates</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
