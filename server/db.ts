import fs from 'fs';
import path from 'path';
import {
  Employee,
  StudioEvent,
  Lead,
  StudioPackage,
  PaymentRecord,
  ConflictCheckResult
} from '../src/types.ts';
import {
  SEED_EMPLOYEES,
  SEED_EVENTS,
  SEED_LEADS,
  SEED_PACKAGES,
  SEED_PAYMENTS
} from '../src/data/seedData.ts';

interface DatabaseSchema {
  employees: Employee[];
  events: StudioEvent[];
  leads: Lead[];
  packages: StudioPackage[];
  payments: PaymentRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.employees && parsed.events) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed reading db.json, falling back to seed data:', err);
    }

    const initial: DatabaseSchema = {
      employees: JSON.parse(JSON.stringify(SEED_EMPLOYEES)),
      events: JSON.parse(JSON.stringify(SEED_EVENTS)),
      leads: JSON.parse(JSON.stringify(SEED_LEADS)),
      packages: JSON.parse(JSON.stringify(SEED_PACKAGES)),
      payments: JSON.parse(JSON.stringify(SEED_PAYMENTS)),
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(state: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to db.json:', err);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- Employees ---
  public getEmployees(search?: string, role?: string, status?: string): Employee[] {
    let list = this.data.employees;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.role.toLowerCase().includes(q));
    }
    if (role && role !== 'All') {
      list = list.filter(e => e.role === role);
    }
    if (status && status !== 'All') {
      list = list.filter(e => e.status === status);
    }
    return list;
  }

  public getEmployeeById(id: string): Employee | undefined {
    return this.data.employees.find(e => e.id === id);
  }

  public createEmployee(emp: Omit<Employee, 'id'>): Employee {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
      eventsCount: 0,
      rating: 5.0
    };
    this.data.employees.push(newEmp);
    this.persist();
    return newEmp;
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const idx = this.data.employees.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.employees[idx] = { ...this.data.employees[idx], ...updates };
    this.persist();
    return this.data.employees[idx];
  }

  public deleteEmployee(id: string): boolean {
    const prevLen = this.data.employees.length;
    this.data.employees = this.data.employees.filter(e => e.id !== id);
    // Also remove from any assigned events
    this.data.events.forEach(ev => {
      ev.assignedEmployeeIds = ev.assignedEmployeeIds.filter(empId => empId !== id);
    });
    if (this.data.employees.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Events & Scheduling ---
  public getEvents(filters?: { date?: string; employeeId?: string; eventType?: string; status?: string }): StudioEvent[] {
    let list = this.data.events;
    if (filters?.date) {
      list = list.filter(ev => ev.date === filters.date);
    }
    if (filters?.employeeId) {
      list = list.filter(ev => ev.assignedEmployeeIds.includes(filters.employeeId!));
    }
    if (filters?.eventType && filters.eventType !== 'All') {
      list = list.filter(ev => ev.eventType === filters.eventType);
    }
    if (filters?.status && filters.status !== 'All') {
      list = list.filter(ev => ev.status === filters.status);
    }
    // Sort by date ascending, then startTime ascending
    return list.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  public getEventById(id: string): StudioEvent | undefined {
    return this.data.events.find(ev => ev.id === id);
  }

  /**
   * Conflict Detection:
   * Checks if any assigned employee is double-booked on the same date with overlapping start/end time.
   */
  public checkConflicts(
    date: string,
    startTime: string,
    endTime: string,
    assignedEmployeeIds: string[],
    excludeEventId?: string
  ): ConflictCheckResult {
    const conflicts: ConflictCheckResult['conflictingEmployees'] = [];

    if (!assignedEmployeeIds || assignedEmployeeIds.length === 0) {
      return { hasConflict: false, conflictingEmployees: [] };
    }

    const sameDayEvents = this.data.events.filter(ev => 
      ev.date === date && 
      ev.id !== excludeEventId && 
      ev.status !== 'Cancelled'
    );

    for (const empId of assignedEmployeeIds) {
      const emp = this.getEmployeeById(empId);
      const empName = emp ? emp.name : empId;

      for (const otherEv of sameDayEvents) {
        if (otherEv.assignedEmployeeIds.includes(empId)) {
          // Check interval overlap: startA < endB && endA > startB
          const startA = startTime;
          const endA = endTime;
          const startB = otherEv.startTime;
          const endB = otherEv.endTime;

          if (startA < endB && endA > startB) {
            conflicts.push({
              employeeId: empId,
              employeeName: empName,
              conflictingEventTitle: otherEv.title,
              startTime: otherEv.startTime,
              endTime: otherEv.endTime
            });
            break; // Stop checking this employee once conflict found
          }
        }
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflictingEmployees: conflicts
    };
  }

  public createEvent(evData: Omit<StudioEvent, 'id' | 'createdAt'>): { event?: StudioEvent; conflict?: ConflictCheckResult } {
    // Conflict check
    const conflict = this.checkConflicts(
      evData.date,
      evData.startTime,
      evData.endTime,
      evData.assignedEmployeeIds
    );

    const newEvent: StudioEvent = {
      ...evData,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.data.events.push(newEvent);

    // If paid amount > 0, also create a payment record
    if (newEvent.paidAmount > 0) {
      this.data.payments.push({
        id: `pay-${Date.now()}`,
        eventId: newEvent.id,
        eventTitle: newEvent.title,
        clientName: newEvent.clientName,
        amount: newEvent.paidAmount,
        totalPrice: newEvent.price,
        method: 'Credit Card',
        date: newEvent.date,
        status: 'Completed',
        transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`
      });
    }

    // Update employee eventsCount
    newEvent.assignedEmployeeIds.forEach(empId => {
      const emp = this.getEmployeeById(empId);
      if (emp) {
        emp.eventsCount = (emp.eventsCount || 0) + 1;
      }
    });

    this.persist();
    return { event: newEvent, conflict: conflict.hasConflict ? conflict : undefined };
  }

  public updateEvent(id: string, updates: Partial<StudioEvent>): { event: StudioEvent | null; conflict?: ConflictCheckResult } {
    const idx = this.data.events.findIndex(e => e.id === id);
    if (idx === -1) return { event: null };

    const current = this.data.events[idx];
    const merged = { ...current, ...updates };

    const conflict = this.checkConflicts(
      merged.date,
      merged.startTime,
      merged.endTime,
      merged.assignedEmployeeIds,
      id
    );

    this.data.events[idx] = merged;
    this.persist();
    return { event: merged, conflict: conflict.hasConflict ? conflict : undefined };
  }

  public deleteEvent(id: string): boolean {
    const prev = this.data.events.length;
    this.data.events = this.data.events.filter(e => e.id !== id);
    if (this.data.events.length !== prev) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Leads ---
  public getLeads(): Lead[] {
    return [...this.data.leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: 'New',
      createdAt: new Date().toISOString()
    };
    this.data.leads.unshift(newLead);
    this.persist();
    return newLead;
  }

  public updateLeadStatus(id: string, status: Lead['status']): Lead | null {
    const lead = this.data.leads.find(l => l.id === id);
    if (!lead) return null;
    lead.status = status;
    this.persist();
    return lead;
  }

  public deleteLead(id: string): boolean {
    const prev = this.data.leads.length;
    this.data.leads = this.data.leads.filter(l => l.id !== id);
    if (this.data.leads.length !== prev) {
      this.persist();
      return true;
    }
    return false;
  }

  public convertLeadToEvent(leadId: string, assignedEmployeeIds: string[] = []): { lead: Lead; event: StudioEvent } | null {
    const lead = this.data.leads.find(l => l.id === leadId);
    if (!lead) return null;

    const pkg = this.data.packages.find(p => p.id === lead.packageId) || this.data.packages[0];

    const { event } = this.createEvent({
      title: `${lead.clientName} - ${lead.eventType} Photography`,
      date: lead.preferredDate,
      startTime: '10:00',
      endTime: '15:00',
      location: lead.location || 'Studio Main Stage',
      clientName: lead.clientName,
      clientEmail: lead.email,
      clientPhone: lead.phone,
      eventType: lead.eventType,
      packageId: pkg.id,
      packageName: pkg.name,
      price: lead.budget || pkg.price,
      paidAmount: 0,
      paymentStatus: 'Pending',
      status: 'Confirmed',
      assignedEmployeeIds,
      notes: `Converted from public inquiry lead: ${lead.message}`,
      leadId: lead.id
    });

    lead.status = 'Converted';
    this.persist();

    return { lead, event: event! };
  }

  // --- Packages ---
  public getPackages(): StudioPackage[] {
    return this.data.packages;
  }

  public createPackage(pkg: Omit<StudioPackage, 'id'>): StudioPackage {
    const newPkg: StudioPackage = {
      ...pkg,
      id: `pkg-${Date.now()}`
    };
    this.data.packages.push(newPkg);
    this.persist();
    return newPkg;
  }

  public updatePackage(id: string, updates: Partial<StudioPackage>): StudioPackage | null {
    const idx = this.data.packages.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.packages[idx] = { ...this.data.packages[idx], ...updates };
    this.persist();
    return this.data.packages[idx];
  }

  public deletePackage(id: string): boolean {
    const prev = this.data.packages.length;
    this.data.packages = this.data.packages.filter(p => p.id !== id);
    if (this.data.packages.length !== prev) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Payments ---
  public getPayments(): PaymentRecord[] {
    return [...this.data.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public recordPayment(record: Omit<PaymentRecord, 'id' | 'transactionRef'>): PaymentRecord {
    const newPay: PaymentRecord = {
      ...record,
      id: `pay-${Date.now()}`,
      transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`
    };
    this.data.payments.unshift(newPay);

    // Also update event paid amount
    const ev = this.getEventById(record.eventId);
    if (ev) {
      ev.paidAmount = (ev.paidAmount || 0) + record.amount;
      if (ev.paidAmount >= ev.price) {
        ev.paymentStatus = 'Paid';
      } else if (ev.paidAmount > 0) {
        ev.paymentStatus = 'Partial';
      }
    }

    this.persist();
    return newPay;
  }

  // --- Analytics Calculation ---
  public getAnalytics(filters?: { dateRange?: string; eventType?: string; employeeId?: string; packageId?: string }) {
    let events = this.data.events.filter(e => e.status !== 'Cancelled');

    if (filters?.eventType && filters.eventType !== 'All') {
      events = events.filter(e => e.eventType === filters.eventType);
    }
    if (filters?.employeeId && filters.employeeId !== 'All') {
      events = events.filter(e => e.assignedEmployeeIds.includes(filters.employeeId!));
    }
    if (filters?.packageId && filters.packageId !== 'All') {
      events = events.filter(e => e.packageId === filters.packageId);
    }

    // Date range filter
    const now = new Date('2026-09-22T05:46:00Z');
    if (filters?.dateRange === 'thisMonth') {
      const yearMonth = '2026-09';
      events = events.filter(e => e.date.startsWith(yearMonth));
    } else if (filters?.dateRange === 'last6Months') {
      events = events.filter(e => e.date >= '2026-04-01');
    }

    const totalRevenue = events.reduce((sum, e) => sum + e.price, 0);
    const totalCollected = events.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
    const pendingPayments = totalRevenue - totalCollected;
    const totalBookings = events.length;

    const currentYearMonth = '2026-09';
    const thisMonthEvents = events.filter(e => e.date.startsWith(currentYearMonth)).length;
    const upcomingEvents = events.filter(e => e.date >= '2026-09-22').length;

    // Monthly revenue bar chart data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, { month: string; revenue: number; bookings: number; target: number }> = {};

    monthNames.forEach((m, idx) => {
      const pad = String(idx + 1).padStart(2, '0');
      const key = `2026-${pad}`;
      monthlyMap[key] = {
        month: m,
        revenue: 0,
        bookings: 0,
        target: 5000 + (idx * 400)
      };
    });

    // Populate actuals
    events.forEach(e => {
      const yyyymm = e.date.substring(0, 7);
      if (monthlyMap[yyyymm]) {
        monthlyMap[yyyymm].revenue += e.price;
        monthlyMap[yyyymm].bookings += 1;
      }
    });

    const monthlyRevenue = Object.values(monthlyMap);

    // Histogram: Price Distribution (Histogram of bookings per price range)
    const priceBuckets = [
      { range: '$500 - $1,500', min: 500, max: 1500, count: 0, revenue: 0 },
      { range: '$1,501 - $2,500', min: 1501, max: 2500, count: 0, revenue: 0 },
      { range: '$2,501 - $3,500', min: 2501, max: 3500, count: 0, revenue: 0 },
      { range: '$3,501 - $5,000', min: 3501, max: 5000, count: 0, revenue: 0 },
      { range: '$5,000+', min: 5001, max: Infinity, count: 0, revenue: 0 }
    ];

    events.forEach(e => {
      const p = e.price;
      const b = priceBuckets.find(bucket => p >= bucket.min && p <= bucket.max);
      if (b) {
        b.count += 1;
        b.revenue += p;
      }
    });

    // Revenue by Category (Pie / Donut chart)
    const categoryMap: Record<string, { name: string; value: number; count: number; color: string }> = {
      Wedding: { name: 'Wedding', value: 0, count: 0, color: '#f59e0b' },
      Corporate: { name: 'Corporate', value: 0, count: 0, color: '#3b82f6' },
      Product: { name: '3D Product', value: 0, count: 0, color: '#10b981' },
      Fashion: { name: 'Fashion & Lookbook', value: 0, count: 0, color: '#ec4899' },
      Portrait: { name: 'Fine Art Portrait', value: 0, count: 0, color: '#8b5cf6' },
      Birthday: { name: 'Private Celebrations', value: 0, count: 0, color: '#06b6d4' },
      Architectural: { name: 'Architectural & Spatial', value: 0, count: 0, color: '#14b8a6' },
    };

    events.forEach(e => {
      const key = e.eventType;
      if (categoryMap[key]) {
        categoryMap[key].value += e.price;
        categoryMap[key].count += 1;
      }
    });

    const categoryBreakdown = Object.values(categoryMap).filter(c => c.value > 0);

    // Revenue by Package Bar Chart
    const packageMap: Record<string, { packageName: string; revenue: number; bookings: number }> = {};
    events.forEach(e => {
      const name = e.packageName || 'Custom Package';
      if (!packageMap[name]) {
        packageMap[name] = { packageName: name, revenue: 0, bookings: 0 };
      }
      packageMap[name].revenue += e.price;
      packageMap[name].bookings += 1;
    });
    const packageBreakdown = Object.values(packageMap);

    return {
      metrics: {
        totalRevenue,
        totalCollected,
        pendingPayments,
        totalBookings,
        thisMonthEvents,
        upcomingEvents
      },
      monthlyRevenue,
      priceHistogram: priceBuckets,
      categoryBreakdown,
      packageBreakdown
    };
  }

  // --- Reset to seed data ---
  public resetToSeed(): void {
    this.data = {
      employees: JSON.parse(JSON.stringify(SEED_EMPLOYEES)),
      events: JSON.parse(JSON.stringify(SEED_EVENTS)),
      leads: JSON.parse(JSON.stringify(SEED_LEADS)),
      packages: JSON.parse(JSON.stringify(SEED_PACKAGES)),
      payments: JSON.parse(JSON.stringify(SEED_PAYMENTS)),
    };
    this.persist();
  }
}

export const db = new DatabaseStore();
