export type EmployeeRole =
  | 'Lead Photographer'
  | '3D Drone & Videographer'
  | 'Senior Retoucher & Editor'
  | 'Portrait & Studio Specialist'
  | 'Lighting Director';

export type AvailabilityStatus = 'Available' | 'On Event' | 'On Leave' | 'Busy';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  avatar: string;
  status: AvailabilityStatus;
  hourlyRate: number;
  bio: string;
  rating: number;
  eventsCount?: number;
}

export type EventType =
  | 'Wedding'
  | 'Corporate'
  | 'Birthday'
  | 'Portrait'
  | 'Product'
  | 'Fashion'
  | 'Architectural';

export type EventStatus = 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';

export interface StudioEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: EventType;
  packageId: string;
  packageName: string;
  price: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  status: EventStatus;
  assignedEmployeeIds: string[]; // Many-to-many relationship
  notes?: string;
  leadId?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  eventType: EventType;
  preferredDate: string; // YYYY-MM-DD
  packageId: string;
  packageName: string;
  location?: string;
  guestCount?: number;
  budget?: number;
  message: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Archived';
  createdAt: string;
}

export interface StudioPackage {
  id: string;
  name: string;
  category: string;
  price: number;
  durationHours: number;
  photosDelivered: number;
  features: string[];
  deliverables?: string[];
  isPopular?: boolean;
  popular?: boolean;
  description: string;
}

export interface PaymentRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  clientName: string;
  amount: number;
  totalPrice: number;
  method: 'Credit Card' | 'Bank Transfer' | 'Stripe' | 'Cash';
  date: string; // YYYY-MM-DD
  status: 'Completed' | 'Pending' | 'Refunded';
  transactionRef: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Employee' | 'SuperAdmin';
  employeeId?: string;
  avatar?: string;
  token?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingEmployees: {
    employeeId: string;
    employeeName: string;
    conflictingEventTitle: string;
    startTime: string;
    endTime: string;
  }[];
}
