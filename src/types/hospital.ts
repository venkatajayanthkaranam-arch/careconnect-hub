export type UserRole = 
  | 'admin' 
  | 'reception' 
  | 'doctor' 
  | 'nurse' 
  | 'lab_technician' 
  | 'pharmacist' 
  | 'billing_staff';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  address: string;
  registrationType: 'online' | 'offline';
  registeredAt: Date;
  status: 'active' | 'admitted' | 'discharged';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  type: 'op' | 'follow_up' | 'emergency';
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medicines: PrescriptionMedicine[];
  notes: string;
  createdAt: Date;
  status: 'pending' | 'issued' | 'partial';
  type: 'op' | 'ip' | 'icu';
}

export interface PrescriptionMedicine {
  medicineId: string;
  name: string;
  dosage: string;
  quantity: number;
  instructions: string;
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  orderedBy: string;
  orderedAt: Date;
  sampleStatus: 'pending' | 'collected' | 'processing' | 'completed';
  result?: string;
  normalRange?: string;
  isAbnormal?: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  store: 'op' | 'ip' | 'icu';
  expiryDate: Date;
  reorderLevel: number;
  price: number;
}

export interface Bed {
  id: string;
  wardType: 'general' | 'semi_private' | 'private' | 'icu' | 'emergency';
  bedNumber: string;
  status: 'available' | 'occupied' | 'maintenance';
  patientId?: string;
  patientName?: string;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  bedId: string;
  wardType: string;
  admittedAt: Date;
  type: 'regular' | 'emergency' | 'icu';
  insuranceStatus: 'none' | 'pending' | 'approved' | 'rejected';
  advanceAmount: number;
  status: 'admitted' | 'discharged';
}

export interface VitalSign {
  id: string;
  patientId: string;
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  oxygenLevel: number;
  recordedAt: Date;
  recordedBy: string;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  type: 'op' | 'ip' | 'emergency';
  services: BillService[];
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
  paymentMode?: 'cash' | 'card' | 'upi' | 'insurance';
  insuranceClaim?: InsuranceClaim;
  createdAt: Date;
}

export interface BillService {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InsuranceClaim {
  provider: string;
  policyNumber: string;
  claimAmount: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  bedOccupancy: number;
  icuUtilization: number;
  emergencyLoad: number;
  pendingLabTests: number;
  lowStockMedicines: number;
  pendingBills: number;
}

export interface Alert {
  id: string;
  type: 'emergency' | 'low_stock' | 'icu_overload' | 'critical_result' | 'expiry';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: Date;
  acknowledged: boolean;
}
