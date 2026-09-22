import {
  Employee,
  StudioEvent,
  Lead,
  StudioPackage,
  PaymentRecord,
  ConflictCheckResult,
  AdminUser
} from '../types.ts';

export const api = {
  // Auth
  async login(payload: { email?: string; password?: string; asRole?: string; employeeId?: string }): Promise<{ user: AdminUser }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  // Employees
  async getEmployees(params?: { search?: string; role?: string; status?: string }): Promise<Employee[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    const res = await fetch(`/api/employees?${query.toString()}`);
    return res.json();
  },

  async createEmployee(data: Omit<Employee, 'id'>): Promise<Employee> {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create employee');
    return res.json();
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update employee');
    return res.json();
  },

  async deleteEmployee(id: string): Promise<void> {
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete employee');
  },

  // Events & Scheduling
  async getEvents(filters?: { date?: string; employeeId?: string; eventType?: string; status?: string }): Promise<StudioEvent[]> {
    const query = new URLSearchParams();
    if (filters?.date) query.set('date', filters.date);
    if (filters?.employeeId) query.set('employeeId', filters.employeeId);
    if (filters?.eventType) query.set('eventType', filters.eventType);
    if (filters?.status) query.set('status', filters.status);
    const res = await fetch(`/api/events?${query.toString()}`);
    return res.json();
  },

  async checkConflict(params: {
    date: string;
    startTime: string;
    endTime: string;
    assignedEmployeeIds: string[];
    excludeEventId?: string;
  }): Promise<ConflictCheckResult> {
    const res = await fetch('/api/events/check-conflict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async createEvent(data: Omit<StudioEvent, 'id' | 'createdAt'> & { forceCreate?: boolean }): Promise<{ event: StudioEvent; conflict?: ConflictCheckResult }> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok && res.status !== 409) {
      throw new Error(json.error || 'Failed to create event');
    }
    return json;
  },

  async updateEvent(id: string, data: Partial<StudioEvent> & { forceUpdate?: boolean }): Promise<{ event: StudioEvent; conflict?: ConflictCheckResult }> {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok && res.status !== 409) {
      throw new Error(json.error || 'Failed to update event');
    }
    return json;
  },

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete event');
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    const res = await fetch('/api/leads');
    return res.json();
  },

  async createLead(data: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit booking inquiry');
    return res.json();
  },

  async updateLeadStatus(id: string, status: Lead['status']): Promise<Lead> {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update lead');
    return res.json();
  },

  async deleteLead(id: string): Promise<void> {
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete lead');
  },

  async convertLeadToEvent(leadId: string, assignedEmployeeIds: string[]): Promise<{ lead: Lead; event: StudioEvent }> {
    const res = await fetch(`/api/leads/${leadId}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedEmployeeIds })
    });
    if (!res.ok) throw new Error('Failed to convert lead to event');
    return res.json();
  },

  // Packages
  async getPackages(): Promise<StudioPackage[]> {
    const res = await fetch('/api/packages');
    return res.json();
  },

  async createPackage(data: Omit<StudioPackage, 'id'>): Promise<StudioPackage> {
    const res = await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updatePackage(id: string, data: Partial<StudioPackage>): Promise<StudioPackage> {
    const res = await fetch(`/api/packages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deletePackage(id: string): Promise<void> {
    const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete package');
  },

  // Payments
  async getPayments(): Promise<PaymentRecord[]> {
    const res = await fetch('/api/payments');
    return res.json();
  },

  async recordPayment(data: Omit<PaymentRecord, 'id' | 'transactionRef'>): Promise<PaymentRecord> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(filters?: { dateRange?: string; eventType?: string; employeeId?: string; packageId?: string }) {
    const query = new URLSearchParams();
    if (filters?.dateRange) query.set('dateRange', filters.dateRange);
    if (filters?.eventType) query.set('eventType', filters.eventType);
    if (filters?.employeeId) query.set('employeeId', filters.employeeId);
    if (filters?.packageId) query.set('packageId', filters.packageId);
    const res = await fetch(`/api/analytics?${query.toString()}`);
    return res.json();
  },

  // Schema Info
  async getSchemaInfo() {
    const res = await fetch('/api/schema-info');
    return res.json();
  },

  // Reset database
  async resetDatabase() {
    const res = await fetch('/api/reset', { method: 'POST' });
    return res.json();
  },

  async resetData() {
    return this.resetDatabase();
  }
};
