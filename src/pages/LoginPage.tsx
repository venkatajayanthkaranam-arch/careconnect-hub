import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Building2, User, Shield, Loader2, Heart, CheckCircle } from 'lucide-react';
import hospitalHero from '@/assets/hospital-hero.jpg';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { loginAsEmployee, loginAsUser, registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('patient');
  
  // Patient login state
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  
  // Patient registration state
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other'>('male');
  const [regAddress, setRegAddress] = useState('');
  
  // Employee login state
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientEmail || !patientPassword) {
      toast.error('Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    const result = await loginAsUser(patientEmail, patientPassword);
    
    if (result.success) {
      toast.success('Welcome back!');
      onLoginSuccess?.();
    } else {
      toast.error(result.error || 'Invalid credentials');
    }
    setIsLoading(false);
  };

  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regName || !regEmail || !regPhone || !regPassword || !regAge) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const age = parseInt(regAge);
    if (isNaN(age) || age < 0 || age > 150) {
      toast.error('Please enter a valid age');
      return;
    }
    
    setIsLoading(true);
    const result = await registerUser(regName, regEmail, regPhone, regPassword, age, regGender, regAddress || undefined);
    
    if (result.success) {
      toast.success(`Registration Successful! Your Patient ID: ${result.patientId}`, {
        duration: 10000,
      });
      onLoginSuccess?.();
    } else {
      toast.error(result.error || 'Could not create account');
    }
    setIsLoading(false);
  };

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeEmail || !employeePassword) {
      toast.error('Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    const result = await loginAsEmployee(employeeEmail, employeePassword);
    
    if (result.success) {
      toast.success('Welcome!');
      onLoginSuccess?.();
    } else {
      toast.error(result.error || 'Invalid credentials');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={hospitalHero}
          alt="Hospital"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50" />
        <div className="relative z-10 p-12 flex flex-col justify-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">MediCare HMS</h1>
          <p className="text-xl opacity-90 mb-8">
            Advanced Hospital Management System for modern healthcare
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <span>Secure patient data management</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <span>Real-time appointment tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <span>Smart symptom-based prioritization</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <span>Integrated billing & lab systems</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Heart className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">MediCare HMS</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient
              </TabsTrigger>
              <TabsTrigger value="employee" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Staff
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="patient">
              <Card>
                <CardHeader>
                  <CardTitle>{isRegistering ? 'Create Account' : 'Patient Login'}</CardTitle>
                  <CardDescription>
                    {isRegistering 
                      ? 'Register to book appointments and view your medical records'
                      : 'Access your appointments and medical records'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isRegistering ? (
                    <form onSubmit={handlePatientLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="patient-email">Email</Label>
                        <Input
                          id="patient-email"
                          type="email"
                          placeholder="your@email.com"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient-password">Password</Label>
                        <Input
                          id="patient-password"
                          type="password"
                          value={patientPassword}
                          onChange={(e) => setPatientPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => setIsRegistering(true)}
                        >
                          Don't have an account? Register here
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handlePatientRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="reg-name">Full Name *</Label>
                          <Input
                            id="reg-name"
                            placeholder="John Doe"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-age">Age *</Label>
                          <Input
                            id="reg-age"
                            type="number"
                            placeholder="30"
                            value={regAge}
                            onChange={(e) => setRegAge(e.target.value)}
                            required
                            min="0"
                            max="150"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-gender">Gender *</Label>
                          <Select value={regGender} onValueChange={(v) => setRegGender(v as 'male' | 'female' | 'other')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email *</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="your@email.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-phone">Phone Number *</Label>
                        <Input
                          id="reg-phone"
                          type="tel"
                          placeholder="+1-555-0123"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-address">Address (Optional)</Label>
                        <Input
                          id="reg-address"
                          placeholder="123 Main St, City"
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password *</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm-password">Confirm Password *</Label>
                        <Input
                          id="reg-confirm-password"
                          type="password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => setIsRegistering(false)}
                        >
                          Already have an account? Sign in
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="employee">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Login</CardTitle>
                  <CardDescription>
                    Hospital employees login with your registered email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmployeeLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emp-email">Email</Label>
                      <Input
                        id="emp-email"
                        type="email"
                        placeholder="employee@hospital.com"
                        value={employeeEmail}
                        onChange={(e) => setEmployeeEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emp-password">Password</Label>
                      <Input
                        id="emp-password"
                        type="password"
                        value={employeePassword}
                        onChange={(e) => setEmployeePassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Employee accounts are created by administrators only
                    </p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
