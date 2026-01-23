import type { 
  Patient, 
  Appointment, 
  Prescription, 
  LabTest, 
  Medicine, 
  Bed, 
  Admission, 
  Bill, 
  Alert, 
  DashboardStats,
  User,
  PatientUser,
  Employee,
  Doctor,
  Department
} from '@/types/hospital';

// Employee Users (Hospital Staff)
export const mockEmployees: Employee[] = [
  { id: 'E001', name: 'Dr. Admin', role: 'admin', email: 'admin@hospital.com', employeeId: 'EMP-001', loginType: 'employee' },
  { id: 'E002', name: 'Sarah Johnson', role: 'reception', email: 'reception@hospital.com', employeeId: 'EMP-002', loginType: 'employee' },
  { id: 'E003', name: 'Dr. James Wilson', role: 'doctor', email: 'doctor@hospital.com', employeeId: 'EMP-003', department: 'cardiology', specialization: 'Cardiologist', loginType: 'employee' },
  { id: 'E004', name: 'Emily Davis', role: 'nurse', email: 'nurse@hospital.com', employeeId: 'EMP-004', loginType: 'employee' },
  { id: 'E005', name: 'Mike Chen', role: 'lab_technician', email: 'lab@hospital.com', employeeId: 'EMP-005', loginType: 'employee' },
  { id: 'E006', name: 'Lisa Anderson', role: 'pharmacist', email: 'pharmacy@hospital.com', employeeId: 'EMP-006', loginType: 'employee' },
  { id: 'E007', name: 'Robert Brown', role: 'billing_staff', email: 'billing@hospital.com', employeeId: 'EMP-007', loginType: 'employee' },
];

// Patient Users (External Users who created accounts)
export const mockPatientUsers: PatientUser[] = [
  { id: 'U001', name: 'John Smith', role: 'patient', email: 'john.smith@email.com', phone: '+1-555-0101', patientId: 'HMS-PAT-2024-000001', loginType: 'user', gender: 'male', address: '123 Main St' },
  { id: 'U002', name: 'Mary Johnson', role: 'patient', email: 'mary.j@email.com', phone: '+1-555-0102', patientId: 'HMS-PAT-2024-000002', loginType: 'user', gender: 'female', address: '456 Oak Ave' },
  { id: 'U003', name: 'Sarah Brown', role: 'patient', email: 'sarah.b@email.com', phone: '+1-555-0104', patientId: 'HMS-PAT-2024-000004', loginType: 'user', gender: 'female', address: '321 Elm St' },
];

// Combined users for legacy compatibility
export const mockUsers: User[] = [
  ...mockEmployees,
  ...mockPatientUsers,
];

// Doctors with availability
export const mockDoctors: Doctor[] = [
  { 
    id: 'D001', 
    name: 'Dr. James Wilson', 
    department: 'cardiology', 
    specialization: 'Cardiologist',
    consultationFee: 500,
    availability: [
      { day: 'monday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'] },
      { day: 'wednesday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'] },
      { day: 'friday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00'] },
    ]
  },
  { 
    id: 'D002', 
    name: 'Dr. Emma Clark', 
    department: 'general_medicine', 
    specialization: 'General Physician',
    consultationFee: 400,
    availability: [
      { day: 'monday', slots: ['10:00', '10:30', '11:00', '11:30', '15:00', '15:30', '16:00'] },
      { day: 'tuesday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30'] },
      { day: 'thursday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'] },
    ]
  },
  { 
    id: 'D003', 
    name: 'Dr. Robert Lee', 
    department: 'orthopedics', 
    specialization: 'Orthopedic Surgeon',
    consultationFee: 600,
    availability: [
      { day: 'tuesday', slots: ['09:00', '09:30', '10:00', '14:00', '14:30', '15:00'] },
      { day: 'thursday', slots: ['10:00', '10:30', '11:00', '15:00', '15:30'] },
      { day: 'saturday', slots: ['09:00', '09:30', '10:00', '10:30'] },
    ]
  },
  { 
    id: 'D004', 
    name: 'Dr. Sarah Miller', 
    department: 'neurology', 
    specialization: 'Neurologist',
    consultationFee: 700,
    availability: [
      { day: 'monday', slots: ['11:00', '11:30', '14:00', '14:30', '15:00'] },
      { day: 'wednesday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00'] },
      { day: 'friday', slots: ['14:00', '14:30', '15:00', '15:30', '16:00'] },
    ]
  },
  { 
    id: 'D005', 
    name: 'Dr. Michael Chen', 
    department: 'pediatrics', 
    specialization: 'Pediatrician',
    consultationFee: 450,
    availability: [
      { day: 'monday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
      { day: 'tuesday', slots: ['14:00', '14:30', '15:00', '15:30', '16:00'] },
      { day: 'wednesday', slots: ['09:00', '09:30', '10:00', '10:30'] },
      { day: 'friday', slots: ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30'] },
    ]
  },
];

export const mockPatients: Patient[] = [
  { id: 'HMS-PAT-2024-000001', name: 'John Smith', age: 45, gender: 'male', phone: '+1-555-0101', email: 'john.smith@email.com', address: '123 Main St', registrationType: 'online', registeredAt: new Date('2024-01-15'), status: 'active', userId: 'U001' },
  { id: 'HMS-PAT-2024-000002', name: 'Mary Johnson', age: 32, gender: 'female', phone: '+1-555-0102', email: 'mary.j@email.com', address: '456 Oak Ave', registrationType: 'online', registeredAt: new Date('2024-01-16'), status: 'admitted', userId: 'U002' },
  { id: 'HMS-PAT-2024-000003', name: 'David Williams', age: 58, gender: 'male', phone: '+1-555-0103', address: '789 Pine Rd', registrationType: 'offline', registeredAt: new Date('2024-01-17'), status: 'active' },
  { id: 'HMS-PAT-2024-000004', name: 'Sarah Brown', age: 28, gender: 'female', phone: '+1-555-0104', email: 'sarah.b@email.com', address: '321 Elm St', registrationType: 'online', registeredAt: new Date('2024-01-18'), status: 'active', userId: 'U003' },
  { id: 'HMS-PAT-2024-000005', name: 'Michael Davis', age: 67, gender: 'male', phone: '+1-555-0105', address: '654 Maple Dr', registrationType: 'offline', registeredAt: new Date('2024-01-19'), status: 'admitted' },
];

export const mockAppointments: Appointment[] = [
  { 
    id: 'A001', 
    patientId: 'HMS-PAT-2024-000001', 
    patientName: 'John Smith', 
    doctorId: 'D001', 
    doctorName: 'Dr. James Wilson', 
    department: 'cardiology',
    date: new Date(), 
    time: '09:00', 
    status: 'waiting', 
    paymentStatus: 'paid', 
    type: 'op',
    riskLevel: 'high',
    bookingType: 'user',
    symptomInfo: {
      symptoms: ['chest pain', 'shortness of breath'],
      duration: '2 days',
      severity: 'high',
      additionalNotes: 'Pain worsens with physical activity'
    }
  },
  { 
    id: 'A002', 
    patientId: 'HMS-PAT-2024-000003', 
    patientName: 'David Williams', 
    doctorId: 'D001', 
    doctorName: 'Dr. James Wilson', 
    department: 'cardiology',
    date: new Date(), 
    time: '09:30', 
    status: 'scheduled', 
    paymentStatus: 'pending', 
    type: 'follow_up',
    riskLevel: 'low',
    bookingType: 'reception'
  },
  { 
    id: 'A003', 
    patientId: 'HMS-PAT-2024-000004', 
    patientName: 'Sarah Brown', 
    doctorId: 'D002', 
    doctorName: 'Dr. Emma Clark', 
    department: 'general_medicine',
    date: new Date(), 
    time: '10:00', 
    status: 'in_progress', 
    paymentStatus: 'paid', 
    type: 'op',
    riskLevel: 'medium',
    bookingType: 'user',
    symptomInfo: {
      symptoms: ['fever', 'cough'],
      duration: '3 days',
      severity: 'medium'
    }
  },
  { 
    id: 'A004', 
    patientId: 'HMS-PAT-2024-000001', 
    patientName: 'John Smith', 
    doctorId: 'D003', 
    doctorName: 'Dr. Robert Lee', 
    department: 'orthopedics',
    date: new Date(), 
    time: '10:30', 
    status: 'scheduled', 
    paymentStatus: 'paid', 
    type: 'op',
    riskLevel: 'medium',
    bookingType: 'user',
    symptomInfo: {
      symptoms: ['joint pain', 'swelling'],
      duration: '1 week',
      severity: 'medium'
    }
  },
  { 
    id: 'A005', 
    patientId: 'HMS-PAT-2024-000002', 
    patientName: 'Mary Johnson', 
    doctorId: 'D004', 
    doctorName: 'Dr. Sarah Miller', 
    department: 'neurology',
    date: new Date(), 
    time: '11:00', 
    status: 'completed', 
    paymentStatus: 'paid', 
    type: 'emergency',
    riskLevel: 'high',
    bookingType: 'reception',
    symptomInfo: {
      symptoms: ['severe headache', 'dizziness', 'vision problems'],
      duration: '6 hours',
      severity: 'high',
      additionalNotes: 'Sudden onset'
    }
  },
];

export const mockPrescriptions: Prescription[] = [
  { id: 'RX001', patientId: 'HMS-PAT-2024-000001', patientName: 'John Smith', doctorId: 'D001', doctorName: 'Dr. James Wilson', medicines: [{ medicineId: 'M001', name: 'Paracetamol', dosage: '500mg', quantity: 10, instructions: 'Take twice daily after meals' }], notes: 'Follow up in 1 week', createdAt: new Date(), status: 'pending', type: 'op' },
  { id: 'RX002', patientId: 'HMS-PAT-2024-000002', patientName: 'Mary Johnson', doctorId: 'D002', doctorName: 'Dr. Emma Clark', medicines: [{ medicineId: 'M002', name: 'Amoxicillin', dosage: '250mg', quantity: 21, instructions: 'Take three times daily' }, { medicineId: 'M003', name: 'Ibuprofen', dosage: '400mg', quantity: 14, instructions: 'Take as needed for pain' }], notes: 'Complete full course', createdAt: new Date(), status: 'pending', type: 'ip' },
  { id: 'RX003', patientId: 'HMS-PAT-2024-000005', patientName: 'Michael Davis', doctorId: 'D003', doctorName: 'Dr. Robert Lee', medicines: [{ medicineId: 'M004', name: 'Metformin', dosage: '500mg', quantity: 30, instructions: 'Take with breakfast' }], notes: 'Monitor blood sugar', createdAt: new Date(), status: 'issued', type: 'icu' },
];

export const mockLabTests: LabTest[] = [
  { id: 'L001', patientId: 'HMS-PAT-2024-000001', patientName: 'John Smith', testName: 'Complete Blood Count', orderedBy: 'Dr. James Wilson', orderedAt: new Date(), sampleStatus: 'processing', normalRange: '4.5-11.0 x10^9/L' },
  { id: 'L002', patientId: 'HMS-PAT-2024-000002', patientName: 'Mary Johnson', testName: 'Blood Glucose', orderedBy: 'Dr. Emma Clark', orderedAt: new Date(), sampleStatus: 'completed', result: '145 mg/dL', normalRange: '70-100 mg/dL', isAbnormal: true },
  { id: 'L003', patientId: 'HMS-PAT-2024-000003', patientName: 'David Williams', testName: 'Lipid Panel', orderedBy: 'Dr. James Wilson', orderedAt: new Date(), sampleStatus: 'pending' },
  { id: 'L004', patientId: 'HMS-PAT-2024-000004', patientName: 'Sarah Brown', testName: 'Thyroid Function', orderedBy: 'Dr. Robert Lee', orderedAt: new Date(), sampleStatus: 'collected' },
  { id: 'L005', patientId: 'HMS-PAT-2024-000005', patientName: 'Michael Davis', testName: 'Kidney Function', orderedBy: 'Dr. Emma Clark', orderedAt: new Date(), sampleStatus: 'completed', result: 'Normal', normalRange: 'Normal', isAbnormal: false },
];

export const mockMedicines: Medicine[] = [
  { id: 'M001', name: 'Paracetamol 500mg', category: 'Analgesic', stock: 500, store: 'op', expiryDate: new Date('2025-06-15'), reorderLevel: 100, price: 2.50 },
  { id: 'M002', name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 45, store: 'op', expiryDate: new Date('2025-03-20'), reorderLevel: 50, price: 8.00 },
  { id: 'M003', name: 'Ibuprofen 400mg', category: 'NSAID', stock: 200, store: 'ip', expiryDate: new Date('2025-08-10'), reorderLevel: 75, price: 5.00 },
  { id: 'M004', name: 'Metformin 500mg', category: 'Antidiabetic', stock: 300, store: 'op', expiryDate: new Date('2025-12-01'), reorderLevel: 100, price: 6.50 },
  { id: 'M005', name: 'Adrenaline Injection', category: 'Emergency', stock: 15, store: 'icu', expiryDate: new Date('2024-06-30'), reorderLevel: 20, price: 25.00 },
  { id: 'M006', name: 'Morphine 10mg', category: 'Opioid', stock: 8, store: 'icu', expiryDate: new Date('2025-01-15'), reorderLevel: 10, price: 45.00 },
];

export const mockBeds: Bed[] = [
  { id: 'B001', wardType: 'general', bedNumber: 'G-101', status: 'available' },
  { id: 'B002', wardType: 'general', bedNumber: 'G-102', status: 'occupied', patientId: 'HMS-PAT-2024-000002', patientName: 'Mary Johnson' },
  { id: 'B003', wardType: 'semi_private', bedNumber: 'SP-201', status: 'available' },
  { id: 'B004', wardType: 'private', bedNumber: 'PV-301', status: 'occupied', patientId: 'HMS-PAT-2024-000005', patientName: 'Michael Davis' },
  { id: 'B005', wardType: 'icu', bedNumber: 'ICU-01', status: 'occupied', patientId: 'P006', patientName: 'Critical Patient' },
  { id: 'B006', wardType: 'icu', bedNumber: 'ICU-02', status: 'available' },
  { id: 'B007', wardType: 'emergency', bedNumber: 'ER-01', status: 'maintenance' },
  { id: 'B008', wardType: 'emergency', bedNumber: 'ER-02', status: 'available' },
];

export const mockAdmissions: Admission[] = [
  { id: 'AD001', patientId: 'HMS-PAT-2024-000002', patientName: 'Mary Johnson', bedId: 'B002', wardType: 'general', admittedAt: new Date('2024-01-18'), type: 'regular', insuranceStatus: 'approved', advanceAmount: 5000, status: 'admitted' },
  { id: 'AD002', patientId: 'HMS-PAT-2024-000005', patientName: 'Michael Davis', bedId: 'B004', wardType: 'private', admittedAt: new Date('2024-01-17'), type: 'emergency', insuranceStatus: 'pending', advanceAmount: 10000, status: 'admitted' },
];

export const mockBills: Bill[] = [
  { 
    id: 'BL001', 
    patientId: 'HMS-PAT-2024-000001', 
    patientName: 'John Smith', 
    type: 'op', 
    services: [
      { name: 'Consultation - Cardiology', quantity: 1, unitPrice: 500, total: 500, category: 'consultation' }, 
      { name: 'ECG', quantity: 1, unitPrice: 300, total: 300, category: 'procedure' },
      { name: 'Blood Test', quantity: 2, unitPrice: 150, total: 300, category: 'lab' }
    ], 
    totalAmount: 1100, 
    paidAmount: 1100, 
    status: 'paid', 
    paymentMode: 'card', 
    createdAt: new Date(),
    appointmentId: 'A001'
  },
  { 
    id: 'BL002', 
    patientId: 'HMS-PAT-2024-000002', 
    patientName: 'Mary Johnson', 
    type: 'ip', 
    services: [
      { name: 'Room Charges - General Ward', quantity: 3, unitPrice: 2000, total: 6000, category: 'room' }, 
      { name: 'Medicines', quantity: 1, unitPrice: 1500, total: 1500, category: 'pharmacy' },
      { name: 'Nursing Care', quantity: 3, unitPrice: 500, total: 1500, category: 'other' }
    ], 
    totalAmount: 9000, 
    paidAmount: 5000, 
    status: 'partial', 
    insuranceClaim: { provider: 'HealthFirst', policyNumber: 'HF123456', claimAmount: 5000, status: 'under_review' }, 
    createdAt: new Date() 
  },
  { 
    id: 'BL003', 
    patientId: 'HMS-PAT-2024-000003', 
    patientName: 'David Williams', 
    type: 'op', 
    services: [
      { name: 'Consultation - General', quantity: 1, unitPrice: 400, total: 400, category: 'consultation' }
    ], 
    totalAmount: 400, 
    paidAmount: 0, 
    status: 'pending', 
    createdAt: new Date() 
  },
  { 
    id: 'BL004', 
    patientId: 'HMS-PAT-2024-000004', 
    patientName: 'Sarah Brown', 
    type: 'op', 
    services: [
      { name: 'Consultation - General', quantity: 1, unitPrice: 400, total: 400, category: 'consultation' },
      { name: 'X-Ray', quantity: 1, unitPrice: 500, total: 500, category: 'procedure' }
    ], 
    totalAmount: 900, 
    paidAmount: 900, 
    status: 'paid', 
    paymentMode: 'upi',
    createdAt: new Date(),
    appointmentId: 'A003'
  },
];

export const mockAlerts: Alert[] = [
  { id: 'AL001', type: 'emergency', message: 'New emergency patient arrived - ER Bay 2', severity: 'critical', createdAt: new Date(), acknowledged: false },
  { id: 'AL002', type: 'low_stock', message: 'Amoxicillin 250mg stock below reorder level', severity: 'warning', createdAt: new Date(), acknowledged: false },
  { id: 'AL003', type: 'icu_overload', message: 'ICU at 80% capacity - 1 bed available', severity: 'warning', createdAt: new Date(), acknowledged: true },
  { id: 'AL004', type: 'critical_result', message: 'Critical lab result for Patient HMS-PAT-2024-000002 - Blood Glucose elevated', severity: 'critical', createdAt: new Date(), acknowledged: false },
  { id: 'AL005', type: 'expiry', message: 'Adrenaline Injection batch expiring in 30 days', severity: 'info', createdAt: new Date(), acknowledged: false },
];

export const mockDashboardStats: DashboardStats = {
  totalPatients: 1247,
  todayAppointments: 42,
  bedOccupancy: 78,
  icuUtilization: 80,
  emergencyLoad: 3,
  pendingLabTests: 15,
  lowStockMedicines: 4,
  pendingBills: 23,
};

// Department labels for display
export const departmentLabels: Record<Department, string> = {
  general_medicine: 'General Medicine',
  cardiology: 'Cardiology',
  orthopedics: 'Orthopedics',
  neurology: 'Neurology',
  pediatrics: 'Pediatrics',
  gynecology: 'Gynecology',
  dermatology: 'Dermatology',
  ophthalmology: 'Ophthalmology',
  ent: 'ENT',
  emergency: 'Emergency',
};

// Common symptoms for quick selection
export const commonSymptoms = [
  'Fever',
  'Headache',
  'Cough',
  'Cold',
  'Body Pain',
  'Chest Pain',
  'Shortness of Breath',
  'Dizziness',
  'Nausea',
  'Fatigue',
  'Joint Pain',
  'Back Pain',
  'Skin Rash',
  'Sore Throat',
  'Stomach Pain',
];
