import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole, LoginType, PatientUser, Employee, EmployeeRole } from '@/types/hospital';
import { mockEmployees, mockPatientUsers } from '@/data/mockData';
import { generatePatientId } from '@/types/hospital';

interface AuthContextType {
  user: User | null;
  loginType: LoginType | null;
  loginAsEmployee: (username: string, password: string, role: EmployeeRole) => Promise<boolean>;
  loginAsUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; patientId?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isPatient: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loginType, setLoginType] = useState<LoginType | null>(null);

  const loginAsEmployee = useCallback(async (username: string, password: string, role: EmployeeRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, any password works
    const matchedUser = mockEmployees.find(u => u.role === role);
    if (matchedUser && password.length > 0) {
      setUser(matchedUser);
      setLoginType('employee');
      return true;
    }
    return false;
  }, []);

  const loginAsUser = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, find by email and any password works
    const matchedUser = mockPatientUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser && password.length > 0) {
      setUser(matchedUser);
      setLoginType('user');
      return true;
    }
    return false;
  }, []);

  const registerUser = useCallback(async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; patientId?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if email already exists
    const existingUser = mockPatientUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { success: false };
    }

    // Generate unique Patient ID
    const patientId = generatePatientId();
    
    // Create new patient user (in real app, this would be saved to database)
    const newUser: PatientUser = {
      id: `U${Date.now()}`,
      name,
      email,
      phone,
      role: 'patient',
      patientId,
      loginType: 'user',
    };

    // Add to mock data (simulating database save)
    mockPatientUsers.push(newUser);
    
    // Auto-login after registration
    setUser(newUser);
    setLoginType('user');
    
    return { success: true, patientId };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setLoginType(null);
  }, []);

  const isPatient = user?.role === 'patient';
  const isEmployee = user !== null && user.role !== 'patient';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loginType,
      loginAsEmployee, 
      loginAsUser,
      registerUser,
      logout, 
      isAuthenticated: !!user,
      isPatient,
      isEmployee
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
