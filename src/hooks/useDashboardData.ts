import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Bill = Database['public']['Tables']['bills']['Row'];
type BillItem = Database['public']['Tables']['bill_items']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];
type Bed = Database['public']['Tables']['beds']['Row'];
type LabTest = Database['public']['Tables']['lab_tests']['Row'];
type Medicine = Database['public']['Tables']['medicines']['Row'];
type Prescription = Database['public']['Tables']['prescriptions']['Row'];
type PrescriptionItem = Database['public']['Tables']['prescription_items']['Row'];
type Admission = Database['public']['Tables']['admissions']['Row'];
type Doctor = Database['public']['Tables']['doctors']['Row'];
type Vital = Database['public']['Tables']['vitals']['Row'];

// Extended types with joined data
export interface AppointmentWithDetails extends Appointment {
  patients?: Patient | null;
  doctors?: Doctor | null;
}

export interface BillWithDetails extends Bill {
  patients?: Patient | null;
  bill_items?: BillItem[];
}

export interface LabTestWithDetails extends LabTest {
  patients?: Patient | null;
  doctors?: Doctor | null;
}

export interface PrescriptionWithDetails extends Prescription {
  patients?: Patient | null;
  doctors?: Doctor | null;
  prescription_items?: PrescriptionItem[];
}

export interface AdmissionWithDetails extends Admission {
  patients?: Patient | null;
  beds?: Bed | null;
}

// Appointments hook
export function useAppointments(patientId?: string) {
  return useQuery({
    queryKey: ['appointments', patientId],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patients (*),
          doctors (*)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true });
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AppointmentWithDetails[];
    },
  });
}

// Today's appointments hook
export function useTodayAppointments() {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (*),
          doctors (*)
        `)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });
      
      if (error) throw error;
      return data as AppointmentWithDetails[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time feel
  });
}

// Patients hook
export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Patient[];
    },
  });
}

// Alerts hook
export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Alert[];
    },
    refetchInterval: 15000, // Refresh every 15 seconds for critical alerts
  });
}

// Beds hook
export function useBeds() {
  return useQuery({
    queryKey: ['beds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beds')
        .select('*')
        .order('bed_number', { ascending: true });
      
      if (error) throw error;
      return data as Bed[];
    },
    refetchInterval: 30000,
  });
}

// Lab tests hook
export function useLabTests(patientId?: string) {
  return useQuery({
    queryKey: ['lab_tests', patientId],
    queryFn: async () => {
      let query = supabase
        .from('lab_tests')
        .select(`
          *,
          patients (*),
          doctors:ordered_by_doctor_id (*)
        `)
        .order('ordered_at', { ascending: false });
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as LabTestWithDetails[];
    },
  });
}

// Medicines hook
export function useMedicines() {
  return useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Medicine[];
    },
  });
}

// Prescriptions hook
export function usePrescriptions(patientId?: string) {
  return useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: async () => {
      let query = supabase
        .from('prescriptions')
        .select(`
          *,
          patients (*),
          doctors (*),
          prescription_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PrescriptionWithDetails[];
    },
  });
}

// Bills hook
export function useBills(patientId?: string) {
  return useQuery({
    queryKey: ['bills', patientId],
    queryFn: async () => {
      let query = supabase
        .from('bills')
        .select(`
          *,
          patients (*),
          bill_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as BillWithDetails[];
    },
  });
}

// Admissions hook
export function useAdmissions(status?: 'admitted' | 'discharged' | 'transferred') {
  return useQuery({
    queryKey: ['admissions', status],
    queryFn: async () => {
      let query = supabase
        .from('admissions')
        .select(`
          *,
          patients (*),
          beds (*)
        `)
        .order('admitted_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AdmissionWithDetails[];
    },
  });
}

// Doctors hook
export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_available', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Doctor[];
    },
  });
}

// Dashboard stats hook
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch all data in parallel
      const [
        patientsResult,
        appointmentsResult,
        bedsResult,
        labTestsResult,
        medicinesResult,
        billsResult,
        alertsResult,
      ] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact' }),
        supabase.from('appointments').select('id', { count: 'exact' }).eq('appointment_date', today),
        supabase.from('beds').select('*'),
        supabase.from('lab_tests').select('id', { count: 'exact' }).eq('sample_status', 'pending'),
        supabase.from('medicines').select('*'),
        supabase.from('bills').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('alerts').select('id, type', { count: 'exact' }).eq('type', 'emergency').eq('acknowledged', false),
      ]);

      const beds = bedsResult.data || [];
      const medicines = medicinesResult.data || [];
      
      const totalBeds = beds.length;
      const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
      const icuBeds = beds.filter(b => b.ward_type === 'icu');
      const occupiedIcu = icuBeds.filter(b => b.status === 'occupied').length;
      const lowStockMedicines = medicines.filter(m => m.stock <= m.reorder_level).length;

      return {
        totalPatients: patientsResult.count || 0,
        todayAppointments: appointmentsResult.count || 0,
        bedOccupancy: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        icuUtilization: icuBeds.length > 0 ? Math.round((occupiedIcu / icuBeds.length) * 100) : 0,
        emergencyLoad: alertsResult.count || 0,
        pendingLabTests: labTestsResult.count || 0,
        lowStockMedicines,
        pendingBills: billsResult.count || 0,
        availableBeds: beds.filter(b => b.status === 'available').length,
        availableIcuBeds: icuBeds.filter(b => b.status === 'available').length,
      };
    },
    refetchInterval: 30000,
  });
}

// Vitals hook
export function useVitals(patientId?: string, admissionId?: string) {
  return useQuery({
    queryKey: ['vitals', patientId, admissionId],
    queryFn: async () => {
      let query = supabase
        .from('vitals')
        .select('*')
        .order('recorded_at', { ascending: false });
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      if (admissionId) {
        query = query.eq('admission_id', admissionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Vital[];
    },
  });
}
