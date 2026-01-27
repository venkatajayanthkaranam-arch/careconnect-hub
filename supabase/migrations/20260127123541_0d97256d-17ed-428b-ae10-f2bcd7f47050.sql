-- =============================================
-- HOSPITAL MANAGEMENT SYSTEM DATABASE SCHEMA
-- =============================================

-- 1. Create Enums
CREATE TYPE public.employee_role AS ENUM ('admin', 'reception', 'doctor', 'nurse', 'lab_technician', 'pharmacist', 'billing_staff');
CREATE TYPE public.gender AS ENUM ('male', 'female', 'other');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'partial', 'refunded');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.appointment_type AS ENUM ('op', 'follow_up', 'emergency');
CREATE TYPE public.booking_type AS ENUM ('user', 'reception');
CREATE TYPE public.department AS ENUM ('general_medicine', 'cardiology', 'orthopedics', 'neurology', 'pediatrics', 'gynecology', 'dermatology', 'ophthalmology', 'ent', 'emergency');
CREATE TYPE public.prescription_status AS ENUM ('pending', 'issued', 'partially_issued', 'cancelled');
CREATE TYPE public.prescription_type AS ENUM ('op', 'ip', 'icu');
CREATE TYPE public.sample_status AS ENUM ('pending', 'collected', 'processing', 'completed', 'cancelled');
CREATE TYPE public.bed_status AS ENUM ('available', 'occupied', 'maintenance', 'reserved');
CREATE TYPE public.ward_type AS ENUM ('general', 'semi_private', 'private', 'icu', 'emergency');
CREATE TYPE public.admission_status AS ENUM ('admitted', 'discharged', 'transferred');
CREATE TYPE public.admission_type AS ENUM ('regular', 'emergency', 'transfer');
CREATE TYPE public.insurance_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');
CREATE TYPE public.bill_status AS ENUM ('pending', 'paid', 'partial', 'cancelled');
CREATE TYPE public.bill_type AS ENUM ('op', 'ip', 'emergency');
CREATE TYPE public.alert_type AS ENUM ('emergency', 'low_stock', 'icu_overload', 'critical_result', 'expiry');
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical');

-- 2. Profiles table (for all users - both patients and employees)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User Roles table (for employees only)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role employee_role NOT NULL,
  employee_id TEXT UNIQUE, -- e.g., EMP-001
  department department,
  specialization TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4. Patients table
CREATE TABLE public.patients (
  id TEXT PRIMARY KEY, -- HMS-PAT-YYYY-XXXXXX format
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- null for offline registrations
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender gender NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  blood_group TEXT,
  emergency_contact TEXT,
  registration_type TEXT NOT NULL DEFAULT 'offline',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Doctors table (extended employee info for doctors)
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  department department NOT NULL,
  specialization TEXT NOT NULL,
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 500,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Doctor Availability
CREATE TABLE public.doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL, -- monday, tuesday, etc.
  time_slots TEXT[] NOT NULL, -- ['09:00', '09:30', '10:00']
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  department department NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  type appointment_type NOT NULL DEFAULT 'op',
  risk_level risk_level NOT NULL DEFAULT 'low',
  booking_type booking_type NOT NULL DEFAULT 'reception',
  symptoms TEXT[],
  symptom_duration TEXT,
  symptom_severity TEXT,
  additional_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Consultations (Doctor notes for appointments)
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  diagnosis TEXT,
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  admission_id UUID, -- will reference admissions
  notes TEXT,
  status prescription_status NOT NULL DEFAULT 'pending',
  type prescription_type NOT NULL DEFAULT 'op',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Prescription Items
CREATE TABLE public.prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID, -- will reference medicines
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  instructions TEXT,
  is_issued BOOLEAN DEFAULT false,
  issued_at TIMESTAMPTZ
);

-- 11. Medicines table
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  store TEXT NOT NULL DEFAULT 'op', -- op, ip, icu
  expiry_date DATE,
  reorder_level INTEGER NOT NULL DEFAULT 50,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Lab Tests table
CREATE TABLE public.lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  test_name TEXT NOT NULL,
  ordered_by_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  sample_status sample_status NOT NULL DEFAULT 'pending',
  result TEXT,
  normal_range TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  result_notes TEXT,
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 13. Beds table
CREATE TABLE public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_type ward_type NOT NULL,
  bed_number TEXT NOT NULL UNIQUE,
  status bed_status NOT NULL DEFAULT 'available',
  current_patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Admissions table
CREATE TABLE public.admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  bed_id UUID REFERENCES public.beds(id) ON DELETE SET NULL,
  ward_type ward_type NOT NULL,
  admitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  discharged_at TIMESTAMPTZ,
  type admission_type NOT NULL DEFAULT 'regular',
  insurance_status insurance_status,
  insurance_provider TEXT,
  policy_number TEXT,
  advance_amount DECIMAL(10,2) DEFAULT 0,
  status admission_status NOT NULL DEFAULT 'admitted',
  discharge_notes TEXT
);

-- Update prescription admission reference
ALTER TABLE public.prescriptions 
ADD CONSTRAINT fk_admission 
FOREIGN KEY (admission_id) REFERENCES public.admissions(id) ON DELETE SET NULL;

-- 15. Vitals table
CREATE TABLE public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  admission_id UUID REFERENCES public.admissions(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  temperature DECIMAL(4,1),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  pulse INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation INTEGER,
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Bills table
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  admission_id UUID REFERENCES public.admissions(id) ON DELETE SET NULL,
  type bill_type NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status bill_status NOT NULL DEFAULT 'pending',
  payment_mode TEXT,
  insurance_claim_amount DECIMAL(10,2),
  insurance_claim_status insurance_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- 17. Bill Items table
CREATE TABLE public.bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL, -- consultation, lab, pharmacy, room, procedure, other
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

-- 18. Alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type alert_type NOT NULL,
  message TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Patient ID Sequence (for generating unique IDs)
CREATE SEQUENCE IF NOT EXISTS patient_id_seq START 1;

-- Function to generate patient ID
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  year_part TEXT;
  seq_part TEXT;
BEGIN
  year_part := to_char(now(), 'YYYY');
  seq_part := lpad(nextval('patient_id_seq')::TEXT, 6, '0');
  new_id := 'HMS-PAT-' || year_part || '-' || seq_part;
  RETURN new_id;
END;
$$;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Security Definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role employee_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Check if user is any employee
CREATE OR REPLACE FUNCTION public.is_employee(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND is_active = true
  )
$$;

-- Check if user is a patient (has a patient record linked)
CREATE OR REPLACE FUNCTION public.is_patient(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patients
    WHERE user_id = _user_id
  )
$$;

-- Get patient ID for user
CREATE OR REPLACE FUNCTION public.get_patient_id(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.patients WHERE user_id = _user_id LIMIT 1
$$;

-- =============================================
-- PROFILES POLICIES
-- =============================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Employees can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_employee(auth.uid()));

-- =============================================
-- USER ROLES POLICIES
-- =============================================
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- PATIENTS POLICIES
-- =============================================
CREATE POLICY "Patients can view own record"
  ON public.patients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Patients can update own record"
  ON public.patients FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Employees can view all patients"
  ON public.patients FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Reception and Admin can manage patients"
  ON public.patients FOR ALL
  USING (
    public.has_role(auth.uid(), 'reception') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- =============================================
-- DOCTORS POLICIES
-- =============================================
CREATE POLICY "Anyone authenticated can view doctors"
  ON public.doctors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage doctors"
  ON public.doctors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- DOCTOR AVAILABILITY POLICIES
-- =============================================
CREATE POLICY "Anyone authenticated can view availability"
  ON public.doctor_availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can manage own availability"
  ON public.doctor_availability FOR ALL
  USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all availability"
  ON public.doctor_availability FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- APPOINTMENTS POLICIES
-- =============================================
CREATE POLICY "Patients can view own appointments"
  ON public.appointments FOR SELECT
  USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Patients can create own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Employees can view all appointments"
  ON public.appointments FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Reception can manage appointments"
  ON public.appointments FOR ALL
  USING (
    public.has_role(auth.uid(), 'reception') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Doctors can update their appointments"
  ON public.appointments FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'doctor') AND
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
  );

-- =============================================
-- CONSULTATIONS POLICIES
-- =============================================
CREATE POLICY "Patients can view own consultations"
  ON public.consultations FOR SELECT
  USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Employees can view all consultations"
  ON public.consultations FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Doctors can create consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can update their consultations"
  ON public.consultations FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'doctor') AND
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
  );

-- =============================================
-- PRESCRIPTIONS POLICIES
-- =============================================
CREATE POLICY "Patients can view own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Employees can view all prescriptions"
  ON public.prescriptions FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Doctors can create prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Pharmacists can update prescription status"
  ON public.prescriptions FOR UPDATE
  USING (public.has_role(auth.uid(), 'pharmacist'));

-- =============================================
-- PRESCRIPTION ITEMS POLICIES
-- =============================================
CREATE POLICY "Users can view prescription items via prescription"
  ON public.prescription_items FOR SELECT
  USING (
    prescription_id IN (
      SELECT id FROM public.prescriptions 
      WHERE patient_id = public.get_patient_id(auth.uid())
    )
  );

CREATE POLICY "Employees can view all prescription items"
  ON public.prescription_items FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Doctors can manage prescription items"
  ON public.prescription_items FOR ALL
  USING (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Pharmacists can update prescription items"
  ON public.prescription_items FOR UPDATE
  USING (public.has_role(auth.uid(), 'pharmacist'));

-- =============================================
-- MEDICINES POLICIES
-- =============================================
CREATE POLICY "Employees can view medicines"
  ON public.medicines FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Pharmacists and Admin can manage medicines"
  ON public.medicines FOR ALL
  USING (
    public.has_role(auth.uid(), 'pharmacist') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- =============================================
-- LAB TESTS POLICIES
-- =============================================
CREATE POLICY "Patients can view own lab tests"
  ON public.lab_tests FOR SELECT
  USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Employees can view all lab tests"
  ON public.lab_tests FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Doctors can create lab tests"
  ON public.lab_tests FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Lab technicians can update lab tests"
  ON public.lab_tests FOR UPDATE
  USING (public.has_role(auth.uid(), 'lab_technician'));

-- =============================================
-- BEDS POLICIES
-- =============================================
CREATE POLICY "Employees can view all beds"
  ON public.beds FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Reception and Admin can manage beds"
  ON public.beds FOR ALL
  USING (
    public.has_role(auth.uid(), 'reception') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- =============================================
-- ADMISSIONS POLICIES
-- =============================================
CREATE POLICY "Patients can view own admissions"
  ON public.admissions FOR SELECT
  USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Employees can view all admissions"
  ON public.admissions FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Reception and Admin can manage admissions"
  ON public.admissions FOR ALL
  USING (
    public.has_role(auth.uid(), 'reception') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- =============================================
-- VITALS POLICIES
-- =============================================
CREATE POLICY "Patients can view own vitals"
  ON public.vitals FOR SELECT
  USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Employees can view all vitals"
  ON public.vitals FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Nurses can manage vitals"
  ON public.vitals FOR ALL
  USING (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Doctors can view and add vitals"
  ON public.vitals FOR ALL
  USING (public.has_role(auth.uid(), 'doctor'));

-- =============================================
-- BILLS POLICIES
-- =============================================
CREATE POLICY "Patients can view own bills"
  ON public.bills FOR SELECT
  USING (patient_id = public.get_patient_id(auth.uid()));

CREATE POLICY "Employees can view all bills"
  ON public.bills FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Billing staff can manage bills"
  ON public.bills FOR ALL
  USING (
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- =============================================
-- BILL ITEMS POLICIES
-- =============================================
CREATE POLICY "Users can view bill items via bill"
  ON public.bill_items FOR SELECT
  USING (
    bill_id IN (
      SELECT id FROM public.bills 
      WHERE patient_id = public.get_patient_id(auth.uid())
    )
  );

CREATE POLICY "Employees can view all bill items"
  ON public.bill_items FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Billing staff can manage bill items"
  ON public.bill_items FOR ALL
  USING (
    public.has_role(auth.uid(), 'billing_staff') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- =============================================
-- ALERTS POLICIES
-- =============================================
CREATE POLICY "Employees can view all alerts"
  ON public.alerts FOR SELECT
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Employees can acknowledge alerts"
  ON public.alerts FOR UPDATE
  USING (public.is_employee(auth.uid()));

CREATE POLICY "System can create alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (public.is_employee(auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at
  BEFORE UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_tests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.beds;