import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Health Check ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Authentication ---
  // Simple tokenized admin auth and employee impersonation
  app.post('/api/auth/login', (req, res) => {
    const { email, password, asRole, employeeId } = req.body;

    // Direct role switch / demo login
    if (asRole === 'Employee' && employeeId) {
      const emp = db.getEmployeeById(employeeId);
      if (emp) {
        return res.json({
          user: {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            role: 'Employee',
            employeeId: emp.id,
            token: `token-emp-${emp.id}-${Date.now()}`
          }
        });
      }
    }

    // Default admin login (accepts demo credentials or any test password)
    if (email === 'admin@lumen3d.com' || email === 'admin' || (password === 'admin123' || password === 'admin' || password === 'password')) {
      return res.json({
        user: {
          id: 'admin-1',
          name: 'Elena Rostova (Studio Director)',
          email: 'admin@lumen3d.com',
          role: 'Admin',
          token: `token-admin-${Date.now()}`
        }
      });
    }

    // Check if an employee email was provided
    const matchingEmp = db.getEmployees().find(e => e.email.toLowerCase() === email?.toLowerCase());
    if (matchingEmp) {
      return res.json({
        user: {
          id: matchingEmp.id,
          name: matchingEmp.name,
          email: matchingEmp.email,
          role: 'Employee',
          employeeId: matchingEmp.id,
          token: `token-emp-${matchingEmp.id}-${Date.now()}`
        }
      });
    }

    // Fallback: If any credentials provided during demo, grant admin
    return res.json({
      user: {
        id: 'admin-1',
        name: 'Master Studio Admin',
        email: email || 'admin@lumen3d.com',
        role: 'Admin',
        token: `token-admin-${Date.now()}`
      }
    });
  });

  // --- Employees API ---
  app.get('/api/employees', (req, res) => {
    const { search, role, status } = req.query as { search?: string; role?: string; status?: string };
    const employees = db.getEmployees(search, role, status);
    res.json(employees);
  });

  app.get('/api/employees/:id', (req, res) => {
    const emp = db.getEmployeeById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  });

  app.post('/api/employees', (req, res) => {
    try {
      const newEmp = db.createEmployee(req.body);
      res.status(201).json(newEmp);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/employees/:id', (req, res) => {
    const updated = db.updateEmployee(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(updated);
  });

  app.delete('/api/employees/:id', (req, res) => {
    const success = db.deleteEmployee(req.params.id);
    if (!success) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  });

  // --- Events & Multi-Event Scheduling API ---
  app.get('/api/events', (req, res) => {
    const { date, employeeId, eventType, status } = req.query as Record<string, string>;
    const events = db.getEvents({ date, employeeId, eventType, status });
    res.json(events);
  });

  app.get('/api/events/:id', (req, res) => {
    const ev = db.getEventById(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    res.json(ev);
  });

  // Check double-booking conflict
  app.post('/api/events/check-conflict', (req, res) => {
    const { date, startTime, endTime, assignedEmployeeIds, excludeEventId } = req.body;
    if (!date || !startTime || !endTime || !assignedEmployeeIds) {
      return res.status(400).json({ error: 'Missing required parameters for conflict check' });
    }
    const result = db.checkConflicts(date, startTime, endTime, assignedEmployeeIds, excludeEventId);
    res.json(result);
  });

  app.post('/api/events', (req, res) => {
    try {
      const { forceCreate, ...eventData } = req.body;
      const result = db.createEvent(eventData);

      if (result.conflict && !forceCreate) {
        return res.status(409).json({
          message: 'Double-booking conflict detected!',
          conflict: result.conflict,
          event: result.event
        });
      }

      res.status(201).json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/events/:id', (req, res) => {
    try {
      const { forceUpdate, ...updates } = req.body;
      const result = db.updateEvent(req.params.id, updates);
      if (!result.event) return res.status(404).json({ error: 'Event not found' });

      if (result.conflict && !forceUpdate) {
        return res.status(409).json({
          message: 'Double-booking conflict detected!',
          conflict: result.conflict,
          event: result.event
        });
      }

      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/events/:id', (req, res) => {
    const success = db.deleteEvent(req.params.id);
    if (!success) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  });

  // --- Leads API ---
  app.get('/api/leads', (req, res) => {
    const leads = db.getLeads();
    res.json(leads);
  });

  app.post('/api/leads', (req, res) => {
    try {
      const lead = db.createLead(req.body);
      res.status(201).json(lead);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/leads/:id', (req, res) => {
    const updated = db.updateLeadStatus(req.params.id, req.body.status);
    if (!updated) return res.status(404).json({ error: 'Lead not found' });
    res.json(updated);
  });

  app.delete('/api/leads/:id', (req, res) => {
    const success = db.deleteLead(req.params.id);
    if (!success) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  });

  app.post('/api/leads/:id/convert', (req, res) => {
    const { assignedEmployeeIds } = req.body;
    const result = db.convertLeadToEvent(req.params.id, assignedEmployeeIds);
    if (!result) return res.status(404).json({ error: 'Lead not found or conversion failed' });
    res.json(result);
  });

  // --- Packages API ---
  app.get('/api/packages', (req, res) => {
    res.json(db.getPackages());
  });

  app.post('/api/packages', (req, res) => {
    const newPkg = db.createPackage(req.body);
    res.status(201).json(newPkg);
  });

  app.put('/api/packages/:id', (req, res) => {
    const updated = db.updatePackage(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Package not found' });
    res.json(updated);
  });

  app.delete('/api/packages/:id', (req, res) => {
    const success = db.deletePackage(req.params.id);
    if (!success) return res.status(404).json({ error: 'Package not found' });
    res.json({ message: 'Package deleted' });
  });

  // --- Payments API ---
  app.get('/api/payments', (req, res) => {
    res.json(db.getPayments());
  });

  app.post('/api/payments', (req, res) => {
    const pay = db.recordPayment(req.body);
    res.status(201).json(pay);
  });

  // --- Sales & Revenue Analytics API ---
  app.get('/api/analytics', (req, res) => {
    const { dateRange, eventType, employeeId, packageId } = req.query as Record<string, string>;
    const analytics = db.getAnalytics({ dateRange, eventType, employeeId, packageId });
    res.json(analytics);
  });

  // --- Reset to initial seed data ---
  app.post('/api/reset', (req, res) => {
    db.resetToSeed();
    res.json({ message: 'Database reset to initial seed state successfully' });
  });

  // --- Database Schema & Architectural Deliverable Documentation ---
  app.get('/api/schema-info', (req, res) => {
    res.json({
      title: 'Lumen 3D Photography Studio & Management System — Database Architecture',
      overview: 'Separation of Date and Event entities with Many-to-Many Employee assignment and conflict resolution.',
      models: {
        Employee: {
          description: 'Staff members (photographers, videographers, drone specialists, lighting leads)',
          fields: ['id (PK)', 'name', 'email', 'phone', 'role', 'avatar', 'status', 'hourlyRate', 'bio', 'rating']
        },
        Event: {
          description: 'Distinct event booking entities. Multiple events can occur on the identical calendar date at differing or overlapping times/venues.',
          fields: ['id (PK)', 'title', 'date (Indexed)', 'startTime', 'endTime', 'location', 'clientName', 'clientEmail', 'clientPhone', 'eventType', 'packageId', 'price', 'paidAmount', 'paymentStatus', 'status', 'assignedEmployeeIds (Many-to-Many foreign keys)', 'notes', 'leadId']
        },
        EventEmployeeAssignment: {
          description: 'Many-to-Many junction relation. Handled via assignedEmployeeIds[] array in document/JSON storage or a junction table (event_id, employee_id) in SQL.',
          conflictRule: 'Double-booking validation: on same date, an employee cannot be assigned to overlapping intervals [startA, endA] and [startB, endB] where startA < endB && endA > startB.'
        },
        Lead: {
          description: 'Client inquiries originating from the public 3D website booking engine, convertible to confirmed Events with 1 click.',
          fields: ['id (PK)', 'clientName', 'email', 'phone', 'eventType', 'preferredDate', 'packageId', 'budget', 'message', 'status (New, Contacted, Converted)']
        },
        Package: {
          description: 'Studio photography tiers and rates.',
          fields: ['id (PK)', 'name', 'category', 'price', 'durationHours', 'photosDelivered', 'features[]']
        },
        Payment: {
          description: 'Transaction logs tracking full, partial, and installment payments.',
          fields: ['id (PK)', 'eventId (FK)', 'amount', 'method', 'date', 'status', 'transactionRef']
        }
      },
      localRunInstructions: [
        '1. Clone repository',
        '2. Run `npm install` to install dependencies (React 19, Three.js, Recharts, Express, Tailwind CSS v4)',
        '3. Run `npm run dev` to start Express + Vite on port 3000',
        '4. Open http://localhost:3000 in your browser to view the 3D studio portfolio and click "Admin Panel" to manage scheduling, employees, and analytics.'
      ]
    });
  });

  // --- Vite Middleware Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumen 3D Studio Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
