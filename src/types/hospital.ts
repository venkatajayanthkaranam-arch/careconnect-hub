// Login Types
export type LoginType = 'user' | 'employee';

// Employee Roles (Internal Staff)
export type EmployeeRole = 
  | 'admin' 
  | 'reception' 
  | 'doctor' 
  | 'nurse' 
  | 'lab_technician' 
  | 'pharmacist' 
  | 'billing_staff';

// User Role is now either patient or employee role
export type UserRole = 'patient' | EmployeeRole;

// Risk Level for appointments
export type RiskLevel = 'low' | 'medium' | 'high';

// Symptom severity
export type SeverityLevel = 'low' | 'medium' | 'high';

// Department Types
export type Department = 
  | 'general_medicine'
  | 'cardiology'
  | 'orthopedics'
  | 'neurology'
  | 'pediatrics'
  | 'gynecology'
  | 'dermatology'
  | 'ophthalmology'
  | 'ent'
  | 'emergency';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatar?: string;
  loginType: LoginType;
}

export interface PatientUser extends User {
  role: 'patient';
  patientId: string; // Format: HMS-PAT-YYYY-XXXXXX
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: string;
}

export interface Employee extends User {
  role: EmployeeRole;
  employeeId: string;
  department?: Department;
  specialization?: string;
}

// Patient ID Generator utility
export const generatePatientId = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `HMS-PAT-${year}-${randomNum}`;
};

export interface Patient {
  id: string; // Patient ID: HMS-PAT-YYYY-XXXXXX
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: string;
  registrationType: 'online' | 'offline';
  registeredAt: Date;
  status: 'active' | 'admitted' | 'discharged';
  userId?: string; // Link to PatientUser if registered online
}

export interface SymptomInfo {
  symptoms: string[];
  duration: string;
  severity: SeverityLevel;
  additionalNotes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: Department;
  date: Date;
  time: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  type: 'op' | 'follow_up' | 'emergency';
  // New fields for smart booking
  symptomInfo?: SymptomInfo;
  riskLevel: RiskLevel;
  bookingType: 'user' | 'reception'; // Who booked
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
  billId?: string; // Linked to billing
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
  type: 'op' | 'ip' | 'emergency' | 'lab' | 'pharmacy';
  services: BillService[];
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
  paymentMode?: 'cash' | 'card' | 'upi' | 'insurance';
  insuranceClaim?: InsuranceClaim;
  createdAt: Date;
  appointmentId?: string;
}

export interface BillService {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: 'consultation' | 'lab' | 'pharmacy' | 'room' | 'procedure' | 'other';
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

export interface Doctor {
  id: string;
  name: string;
  department: Department;
  specialization: string;
  availability: DoctorAvailability[];
  consultationFee: number;
}

export interface DoctorAvailability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  slots: string[];
}

// Symptom to Department mapping for smart suggestions
export const symptomDepartmentMap: Record<string, Department[]> = {
  'chest pain': ['cardiology', 'emergency'],
  'heart palpitations': ['cardiology'],
  'headache': ['neurology', 'general_medicine'],
  'migraine': ['neurology'],
  'bone fracture': ['orthopedics', 'emergency'],
  'joint pain': ['orthopedics'],
  'fever': ['general_medicine', 'pediatrics'],
  'cold': ['general_medicine', 'ent'],
  'cough': ['general_medicine', 'ent'],
  'skin rash': ['dermatology'],
  'eye pain': ['ophthalmology'],
  'ear pain': ['ent'],
  'pregnancy': ['gynecology'],
  'child health': ['pediatrics'],
};
