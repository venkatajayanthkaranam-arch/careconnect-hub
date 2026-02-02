export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admissions: {
        Row: {
          admitted_at: string
          advance_amount: number | null
          bed_id: string | null
          discharge_notes: string | null
          discharged_at: string | null
          id: string
          insurance_provider: string | null
          insurance_status:
            | Database["public"]["Enums"]["insurance_status"]
            | null
          patient_id: string
          policy_number: string | null
          status: Database["public"]["Enums"]["admission_status"]
          type: Database["public"]["Enums"]["admission_type"]
          ward_type: Database["public"]["Enums"]["ward_type"]
        }
        Insert: {
          admitted_at?: string
          advance_amount?: number | null
          bed_id?: string | null
          discharge_notes?: string | null
          discharged_at?: string | null
          id?: string
          insurance_provider?: string | null
          insurance_status?:
            | Database["public"]["Enums"]["insurance_status"]
            | null
          patient_id: string
          policy_number?: string | null
          status?: Database["public"]["Enums"]["admission_status"]
          type?: Database["public"]["Enums"]["admission_type"]
          ward_type: Database["public"]["Enums"]["ward_type"]
        }
        Update: {
          admitted_at?: string
          advance_amount?: number | null
          bed_id?: string | null
          discharge_notes?: string | null
          discharged_at?: string | null
          id?: string
          insurance_provider?: string | null
          insurance_status?:
            | Database["public"]["Enums"]["insurance_status"]
            | null
          patient_id?: string
          policy_number?: string | null
          status?: Database["public"]["Enums"]["admission_status"]
          type?: Database["public"]["Enums"]["admission_type"]
          ward_type?: Database["public"]["Enums"]["ward_type"]
        }
        Relationships: [
          {
            foreignKeyName: "admissions_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_by: string | null
          created_at: string
          id: string
          message: string
          severity: Database["public"]["Enums"]["alert_severity"]
          type: Database["public"]["Enums"]["alert_type"]
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          message: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          type: Database["public"]["Enums"]["alert_type"]
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          message?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          type?: Database["public"]["Enums"]["alert_type"]
        }
        Relationships: []
      }
      appointments: {
        Row: {
          additional_notes: string | null
          appointment_date: string
          appointment_time: string
          booking_type: Database["public"]["Enums"]["booking_type"]
          created_at: string
          department: Database["public"]["Enums"]["department"]
          doctor_id: string | null
          id: string
          patient_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          risk_level: Database["public"]["Enums"]["risk_level"]
          status: Database["public"]["Enums"]["appointment_status"]
          symptom_duration: string | null
          symptom_severity: string | null
          symptoms: string[] | null
          type: Database["public"]["Enums"]["appointment_type"]
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          appointment_date: string
          appointment_time: string
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          department: Database["public"]["Enums"]["department"]
          doctor_id?: string | null
          id?: string
          patient_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          risk_level?: Database["public"]["Enums"]["risk_level"]
          status?: Database["public"]["Enums"]["appointment_status"]
          symptom_duration?: string | null
          symptom_severity?: string | null
          symptoms?: string[] | null
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          appointment_date?: string
          appointment_time?: string
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          doctor_id?: string | null
          id?: string
          patient_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          risk_level?: Database["public"]["Enums"]["risk_level"]
          status?: Database["public"]["Enums"]["appointment_status"]
          symptom_duration?: string | null
          symptom_severity?: string | null
          symptoms?: string[] | null
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          created_at: string
          current_patient_id: string | null
          id: string
          status: Database["public"]["Enums"]["bed_status"]
          ward_type: Database["public"]["Enums"]["ward_type"]
        }
        Insert: {
          bed_number: string
          created_at?: string
          current_patient_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["bed_status"]
          ward_type: Database["public"]["Enums"]["ward_type"]
        }
        Update: {
          bed_number?: string
          created_at?: string
          current_patient_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["bed_status"]
          ward_type?: Database["public"]["Enums"]["ward_type"]
        }
        Relationships: [
          {
            foreignKeyName: "beds_current_patient_id_fkey"
            columns: ["current_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_items: {
        Row: {
          bill_id: string
          category: string
          id: string
          quantity: number
          service_name: string
          total: number
          unit_price: number
        }
        Insert: {
          bill_id: string
          category: string
          id?: string
          quantity?: number
          service_name: string
          total: number
          unit_price: number
        }
        Update: {
          bill_id?: string
          category?: string
          id?: string
          quantity?: number
          service_name?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          admission_id: string | null
          appointment_id: string | null
          created_at: string
          id: string
          insurance_claim_amount: number | null
          insurance_claim_status:
            | Database["public"]["Enums"]["insurance_status"]
            | null
          paid_amount: number
          paid_at: string | null
          patient_id: string
          payment_mode: string | null
          status: Database["public"]["Enums"]["bill_status"]
          total_amount: number
          type: Database["public"]["Enums"]["bill_type"]
        }
        Insert: {
          admission_id?: string | null
          appointment_id?: string | null
          created_at?: string
          id?: string
          insurance_claim_amount?: number | null
          insurance_claim_status?:
            | Database["public"]["Enums"]["insurance_status"]
            | null
          paid_amount?: number
          paid_at?: string | null
          patient_id: string
          payment_mode?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          total_amount?: number
          type: Database["public"]["Enums"]["bill_type"]
        }
        Update: {
          admission_id?: string | null
          appointment_id?: string | null
          created_at?: string
          id?: string
          insurance_claim_amount?: number | null
          insurance_claim_status?:
            | Database["public"]["Enums"]["insurance_status"]
            | null
          paid_amount?: number
          paid_at?: string | null
          patient_id?: string
          payment_mode?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          total_amount?: number
          type?: Database["public"]["Enums"]["bill_type"]
        }
        Relationships: [
          {
            foreignKeyName: "bills_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          appointment_id: string
          created_at: string
          diagnosis: string | null
          doctor_id: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          patient_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_availability: {
        Row: {
          created_at: string
          day_of_week: string
          doctor_id: string
          id: string
          time_slots: string[]
        }
        Insert: {
          created_at?: string
          day_of_week: string
          doctor_id: string
          id?: string
          time_slots: string[]
        }
        Update: {
          created_at?: string
          day_of_week?: string
          doctor_id?: string
          id?: string
          time_slots?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          consultation_fee: number
          created_at: string
          department: Database["public"]["Enums"]["department"]
          id: string
          is_available: boolean | null
          name: string
          specialization: string
          user_id: string
        }
        Insert: {
          consultation_fee?: number
          created_at?: string
          department: Database["public"]["Enums"]["department"]
          id?: string
          is_available?: boolean | null
          name: string
          specialization: string
          user_id: string
        }
        Update: {
          consultation_fee?: number
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          id?: string
          is_available?: boolean | null
          name?: string
          specialization?: string
          user_id?: string
        }
        Relationships: []
      }
      lab_tests: {
        Row: {
          appointment_id: string | null
          completed_at: string | null
          id: string
          is_abnormal: boolean | null
          normal_range: string | null
          ordered_at: string
          ordered_by_doctor_id: string | null
          patient_id: string
          result: string | null
          result_notes: string | null
          sample_status: Database["public"]["Enums"]["sample_status"]
          test_name: string
        }
        Insert: {
          appointment_id?: string | null
          completed_at?: string | null
          id?: string
          is_abnormal?: boolean | null
          normal_range?: string | null
          ordered_at?: string
          ordered_by_doctor_id?: string | null
          patient_id: string
          result?: string | null
          result_notes?: string | null
          sample_status?: Database["public"]["Enums"]["sample_status"]
          test_name: string
        }
        Update: {
          appointment_id?: string | null
          completed_at?: string | null
          id?: string
          is_abnormal?: boolean | null
          normal_range?: string | null
          ordered_at?: string
          ordered_by_doctor_id?: string | null
          patient_id?: string
          result?: string | null
          result_notes?: string | null
          sample_status?: Database["public"]["Enums"]["sample_status"]
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_tests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_tests_ordered_by_doctor_id_fkey"
            columns: ["ordered_by_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_tests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          category: string
          created_at: string
          expiry_date: string | null
          id: string
          name: string
          price: number
          reorder_level: number
          stock: number
          store: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          name: string
          price: number
          reorder_level?: number
          stock?: number
          store?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          name?: string
          price?: number
          reorder_level?: number
          stock?: number
          store?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          age: number
          blood_group: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          gender: Database["public"]["Enums"]["gender"]
          id: string
          name: string
          phone: string
          registration_type: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          age: number
          blood_group?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          gender: Database["public"]["Enums"]["gender"]
          id: string
          name: string
          phone: string
          registration_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          age?: number
          blood_group?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          name?: string
          phone?: string
          registration_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      prescription_items: {
        Row: {
          dosage: string
          id: string
          instructions: string | null
          is_issued: boolean | null
          issued_at: string | null
          medicine_id: string | null
          medicine_name: string
          prescription_id: string
          quantity: number
        }
        Insert: {
          dosage: string
          id?: string
          instructions?: string | null
          is_issued?: boolean | null
          issued_at?: string | null
          medicine_id?: string | null
          medicine_name: string
          prescription_id: string
          quantity: number
        }
        Update: {
          dosage?: string
          id?: string
          instructions?: string | null
          is_issued?: boolean | null
          issued_at?: string | null
          medicine_id?: string | null
          medicine_name?: string
          prescription_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          admission_id: string | null
          appointment_id: string | null
          created_at: string
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["prescription_status"]
          type: Database["public"]["Enums"]["prescription_type"]
        }
        Insert: {
          admission_id?: string | null
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["prescription_status"]
          type?: Database["public"]["Enums"]["prescription_type"]
        }
        Update: {
          admission_id?: string | null
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["prescription_status"]
          type?: Database["public"]["Enums"]["prescription_type"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_admission"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["department"] | null
          employee_id: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["employee_role"]
          specialization: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["employee_role"]
          specialization?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["employee_role"]
          specialization?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vitals: {
        Row: {
          admission_id: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          patient_id: string
          pulse: number | null
          recorded_at: string
          recorded_by: string | null
          respiratory_rate: number | null
          temperature: number | null
        }
        Insert: {
          admission_id?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          pulse?: number | null
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
        }
        Update: {
          admission_id?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          pulse?: number | null
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_role: { Args: { admin_email: string }; Returns: undefined }
      generate_patient_id: { Args: never; Returns: string }
      get_patient_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["employee_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_employee: { Args: { _user_id: string }; Returns: boolean }
      is_patient: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      admission_status: "admitted" | "discharged" | "transferred"
      admission_type: "regular" | "emergency" | "transfer"
      alert_severity: "info" | "warning" | "critical"
      alert_type:
        | "emergency"
        | "low_stock"
        | "icu_overload"
        | "critical_result"
        | "expiry"
      appointment_status:
        | "scheduled"
        | "waiting"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      appointment_type: "op" | "follow_up" | "emergency"
      bed_status: "available" | "occupied" | "maintenance" | "reserved"
      bill_status: "pending" | "paid" | "partial" | "cancelled"
      bill_type: "op" | "ip" | "emergency"
      booking_type: "user" | "reception"
      department:
        | "general_medicine"
        | "cardiology"
        | "orthopedics"
        | "neurology"
        | "pediatrics"
        | "gynecology"
        | "dermatology"
        | "ophthalmology"
        | "ent"
        | "emergency"
      employee_role:
        | "admin"
        | "reception"
        | "doctor"
        | "nurse"
        | "lab_technician"
        | "pharmacist"
        | "billing_staff"
      gender: "male" | "female" | "other"
      insurance_status: "pending" | "approved" | "rejected" | "under_review"
      payment_status: "pending" | "paid" | "partial" | "refunded"
      prescription_status:
        | "pending"
        | "issued"
        | "partially_issued"
        | "cancelled"
      prescription_type: "op" | "ip" | "icu"
      risk_level: "low" | "medium" | "high"
      sample_status:
        | "pending"
        | "collected"
        | "processing"
        | "completed"
        | "cancelled"
      ward_type: "general" | "semi_private" | "private" | "icu" | "emergency"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admission_status: ["admitted", "discharged", "transferred"],
      admission_type: ["regular", "emergency", "transfer"],
      alert_severity: ["info", "warning", "critical"],
      alert_type: [
        "emergency",
        "low_stock",
        "icu_overload",
        "critical_result",
        "expiry",
      ],
      appointment_status: [
        "scheduled",
        "waiting",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      appointment_type: ["op", "follow_up", "emergency"],
      bed_status: ["available", "occupied", "maintenance", "reserved"],
      bill_status: ["pending", "paid", "partial", "cancelled"],
      bill_type: ["op", "ip", "emergency"],
      booking_type: ["user", "reception"],
      department: [
        "general_medicine",
        "cardiology",
        "orthopedics",
        "neurology",
        "pediatrics",
        "gynecology",
        "dermatology",
        "ophthalmology",
        "ent",
        "emergency",
      ],
      employee_role: [
        "admin",
        "reception",
        "doctor",
        "nurse",
        "lab_technician",
        "pharmacist",
        "billing_staff",
      ],
      gender: ["male", "female", "other"],
      insurance_status: ["pending", "approved", "rejected", "under_review"],
      payment_status: ["pending", "paid", "partial", "refunded"],
      prescription_status: [
        "pending",
        "issued",
        "partially_issued",
        "cancelled",
      ],
      prescription_type: ["op", "ip", "icu"],
      risk_level: ["low", "medium", "high"],
      sample_status: [
        "pending",
        "collected",
        "processing",
        "completed",
        "cancelled",
      ],
      ward_type: ["general", "semi_private", "private", "icu", "emergency"],
    },
  },
} as const
