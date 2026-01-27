import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type EmployeeRole = Database['public']['Enums']['employee_role'];
type Department = Database['public']['Enums']['department'];

export type LoginType = 'user' | 'employee';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

interface UserRole {
  id: string;
  role: EmployeeRole;
  employee_id: string | null;
  department: Department | null;
  specialization: string | null;
  is_active: boolean;
}

interface PatientRecord {
  id: string; // HMS-PAT-YYYY-XXXXXX
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string | null;
  address: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userRole: UserRole | null;
  patientRecord: PatientRecord | null;
  loginType: LoginType | null;
  isLoading: boolean;
  loginAsEmployee: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (name: string, email: string, phone: string, password: string, age: number, gender: 'male' | 'female' | 'other', address?: string) => Promise<{ success: boolean; patientId?: string; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isPatient: boolean;
  isEmployee: boolean;
  employeeRole: EmployeeRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null);
  const [loginType, setLoginType] = useState<LoginType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and roles
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Check if user is an employee (has a role)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (roleData) {
        setUserRole(roleData);
        setLoginType('employee');
        setPatientRecord(null);
        return;
      }

      // Check if user is a patient
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (patientData) {
        setPatientRecord(patientData);
        setLoginType('user');
        setUserRole(null);
        return;
      }

      // User exists but has no role or patient record yet
      setLoginType(null);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          // Use setTimeout to avoid race condition with Supabase
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setUser(null);
          setProfile(null);
          setUserRole(null);
          setPatientRecord(null);
          setLoginType(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const loginAsEmployee = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Verify user is an employee
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!roleData) {
          await supabase.auth.signOut();
          return { success: false, error: 'This account is not registered as a hospital employee' };
        }

        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const loginAsUser = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Verify user is a patient
        const { data: patientData } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!patientData) {
          await supabase.auth.signOut();
          return { success: false, error: 'No patient account found. Please register first.' };
        }

        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const registerUser = useCallback(async (
    name: string,
    email: string,
    phone: string,
    password: string,
    age: number,
    gender: 'male' | 'female' | 'other',
    address?: string
  ): Promise<{ success: boolean; patientId?: string; error?: string }> => {
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Registration failed' };
      }

      // Generate Patient ID using database function
      const { data: patientIdData, error: patientIdError } = await supabase
        .rpc('generate_patient_id');

      if (patientIdError || !patientIdData) {
        // Clean up - delete the user if patient creation fails
        await supabase.auth.signOut();
        return { success: false, error: 'Failed to generate patient ID' };
      }

      const patientId = patientIdData as string;

      // Create patient record
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          id: patientId,
          user_id: authData.user.id,
          name,
          age,
          gender,
          phone,
          email,
          address: address || null,
          registration_type: 'online',
          status: 'active'
        });

      if (patientError) {
        await supabase.auth.signOut();
        return { success: false, error: 'Failed to create patient record' };
      }

      // Update profile with phone
      await supabase
        .from('profiles')
        .update({ phone, name })
        .eq('id', authData.user.id);

      return { success: true, patientId };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred during registration' };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setUserRole(null);
    setPatientRecord(null);
    setLoginType(null);
  }, []);

  const isPatient = loginType === 'user' && patientRecord !== null;
  const isEmployee = loginType === 'employee' && userRole !== null;
  const employeeRole = userRole?.role || null;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      userRole,
      patientRecord,
      loginType,
      isLoading,
      loginAsEmployee,
      loginAsUser,
      registerUser,
      logout,
      isAuthenticated: !!user && (isPatient || isEmployee),
      isPatient,
      isEmployee,
      employeeRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
