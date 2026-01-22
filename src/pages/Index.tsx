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
import { IPManagement } from '@/components/modules/IPManagement';
import type { UserRole } from '@/types/hospital';

const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated || !user) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
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
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardRouter />
    </AuthProvider>
  );
};

export default Index;
