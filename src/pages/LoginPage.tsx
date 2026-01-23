import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { EmployeeRole } from '@/types/hospital';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Loader2, Lock, User, Mail, Phone, UserPlus, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import hospitalHero from '@/assets/hospital-hero.jpg';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const employeeRoles: { value: EmployeeRole; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'reception', label: 'Reception' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'lab_technician', label: 'Lab Technician' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'billing_staff', label: 'Billing Staff' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { loginAsEmployee, loginAsUser, registerUser } = useAuth();
  
  // Employee login state
  const [employeeUsername, setEmployeeUsername] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [employeeRole, setEmployeeRole] = useState<EmployeeRole>('doctor');
  
  // User login state
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  
  // User registration state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeUsername || !employeePassword) {
      toast.error('Please enter Employee ID and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await loginAsEmployee(employeeUsername, employeePassword, employeeRole);
      if (success) {
        toast.success('Login successful');
        onLoginSuccess();
      } else {
        toast.error('Invalid credentials');
      }
    } catch {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail || !userPassword) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await loginAsUser(userEmail, userPassword);
      if (success) {
        toast.success('Welcome back!');
        onLoginSuccess();
      } else {
        toast.error('Invalid email or password');
      }
    } catch {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await registerUser(registerName, registerEmail, registerPhone, registerPassword);
      if (result.success) {
        toast.success(`Account created! Your Patient ID: ${result.patientId}`);
        onLoginSuccess();
      } else {
        toast.error('Email already registered');
      }
    } catch {
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={hospitalHero} 
          alt="Hospital Reception" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-info/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">MediCare</h1>
              <p className="text-white/80 text-lg">Hospital Management System</p>
            </div>
          </div>
          
          <div className="space-y-6 max-w-md">
            <h2 className="text-2xl font-semibold text-white">
              Your Health, Our Priority
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Book appointments, view your medical history, track your bills, 
              and manage your healthcare journey - all in one place.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-3xl font-bold text-white">1,247</p>
                <p className="text-white/70 text-sm">Active Patients</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-3xl font-bold text-white">15+</p>
                <p className="text-white/70 text-sm">Specialists</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-3xl font-bold text-white">98%</p>
                <p className="text-white/70 text-sm">Patient Satisfaction</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-white/70 text-sm">Emergency Care</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-medical flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MediCare</h1>
              <p className="text-muted-foreground text-sm">Hospital Management</p>
            </div>
          </div>

          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Patient
              </TabsTrigger>
              <TabsTrigger value="employee" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Staff
              </TabsTrigger>
            </TabsList>

            {/* Patient/User Login */}
            <TabsContent value="user">
              {!showRegister ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Patient Login</h2>
                    <p className="text-muted-foreground mt-1">Sign in to book appointments & view records</p>
                  </div>

                  <form onSubmit={handleUserLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email</Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="userEmail"
                          type="email"
                          placeholder="Enter your email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userPassword">Password</Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="userPassword"
                          type="password"
                          placeholder="Enter your password"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="medical" 
                      className="w-full h-11"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign in'
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      Don't have an account?{' '}
                      <button 
                        onClick={() => setShowRegister(true)}
                        className="text-primary font-medium hover:underline"
                      >
                        Create Account
                      </button>
                    </p>
                  </div>

                  <p className="text-center text-muted-foreground text-xs mt-4">
                    Demo: john.smith@email.com / any password
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
                    <p className="text-muted-foreground mt-1">Register to get your unique Patient ID</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="registerName">Full Name</Label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="registerName"
                          type="text"
                          placeholder="Enter your full name"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registerEmail">Email</Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="registerEmail"
                          type="email"
                          placeholder="Enter your email"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registerPhone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="registerPhone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="registerPassword">Password</Label>
                        <Input
                          id="registerPassword"
                          type="password"
                          placeholder="Password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="medical" 
                      className="w-full h-11"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      Already have an account?{' '}
                      <button 
                        onClick={() => setShowRegister(false)}
                        className="text-primary font-medium hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Employee/Staff Login */}
            <TabsContent value="employee">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Staff Login</h2>
                <p className="text-muted-foreground mt-1">Hospital employee access portal</p>
              </div>

              <form onSubmit={handleEmployeeLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="role">Select Role</Label>
                  <Select value={employeeRole} onValueChange={(v) => setEmployeeRole(v as EmployeeRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeRoles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="Enter your Employee ID"
                      value={employeeUsername}
                      onChange={(e) => setEmployeeUsername(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeePassword">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="employeePassword"
                      type="password"
                      placeholder="Enter your password"
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="medical" 
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <p className="text-center text-muted-foreground text-xs mt-6">
                Demo: Select any role & enter any ID/password
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
