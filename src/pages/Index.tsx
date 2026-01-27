import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { ReceptionDashboard } from '@/components/dashboards/ReceptionDashboard';
import { DoctorDashboard } from '@/components/dashboards/DoctorDashboard';
import { NurseDashboard } from '@/components/dashboards/NurseDashboard';
import { LabDashboard } from '@/components/dashboards/LabDashboard';
import { PharmacyDashboard } from '@/components/dashboards/PharmacyDashboard';
import { BillingDashboard } from '@/components/dashboards/BillingDashboard';
import { PatientDashboard } from '@/components/dashboards/PatientDashboard';
import { IPManagement } from '@/components/modules/IPManagement';
import { Loader2 } from 'lucide-react';

const DashboardRouter: React.FC = () => {
  const { isAuthenticated, isPatient, isEmployee, employeeRole, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  // Patient users get their own simplified layout
  if (isPatient) {
    return (
      <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        <PatientDashboard />
      </DashboardLayout>
    );
  }

  // Employee dashboards
  if (isEmployee && employeeRole) {
    const renderDashboard = () => {
      switch (employeeRole) {
        case 'admin':
          if (currentPage === 'users') return <div className="text-2xl font-bold">User Management</div>;
          if (currentPage === 'reports') return <div className="text-2xl font-bold">Reports & Analytics</div>;
          return <AdminDashboard onNavigate={setCurrentPage} />;
        
        case 'reception':
          if (currentPage === 'appointments') return <ReceptionDashboard />;
          if (currentPage === 'beds') return <IPManagement />;
          return <ReceptionDashboard />;
        
        case 'doctor':
          return <DoctorDashboard />;
        
        case 'nurse':
          return <NurseDashboard />;
        
        case 'lab_technician':
          return <LabDashboard />;
        
        case 'pharmacist':
          return <PharmacyDashboard />;
        
        case 'billing_staff':
          return <BillingDashboard />;
        
        default:
          return <AdminDashboard onNavigate={setCurrentPage} />;
      }
    };

    return (
      <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderDashboard()}
      </DashboardLayout>
    );
  }

  // Fallback - shouldn't normally reach here
  return <LoginPage onLoginSuccess={() => {}} />;
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardRouter />
    </AuthProvider>
  );
};

export default Index;
