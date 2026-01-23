import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { EmployeeRole } from '@/types/hospital';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope,
  FlaskConical, 
  Pill, 
  Bed, 
  CreditCard, 
  Settings, 
  FileText, 
  UserPlus, 
  ClipboardList,
  Heart,
  AlertTriangle,
  Package,
  BarChart3,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const menusByRole: Record<EmployeeRole, MenuItem[]> = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: Users, label: 'User Management', path: 'users' },
    { icon: BarChart3, label: 'Reports & Analytics', path: 'reports' },
    { icon: Settings, label: 'Settings', path: 'settings' },
  ],
  reception: [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: UserPlus, label: 'Patient Registration', path: 'registration' },
    { icon: Calendar, label: 'Appointments', path: 'appointments' },
    { icon: Bed, label: 'Bed Management', path: 'beds' },
  ],
  doctor: [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: Calendar, label: 'Appointments', path: 'appointments' },
    { icon: Stethoscope, label: 'Consultation', path: 'consultation' },
    { icon: FileText, label: 'Prescriptions', path: 'prescriptions' },
    { icon: FlaskConical, label: 'Lab Results', path: 'lab-results' },
  ],
  nurse: [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: Users, label: 'Assigned Patients', path: 'patients' },
    { icon: Heart, label: 'Vitals', path: 'vitals' },
    { icon: Pill, label: 'Medications', path: 'medications' },
    { icon: ClipboardList, label: 'Care Log', path: 'care-log' },
  ],
  lab_technician: [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: FlaskConical, label: 'Pending Tests', path: 'pending' },
    { icon: ClipboardList, label: 'Test Processing', path: 'processing' },
    { icon: FileText, label: 'Results', path: 'results' },
  ],
  pharmacist: [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: ClipboardList, label: 'Prescriptions', path: 'prescriptions' },
    { icon: Pill, label: 'Issue Medicines', path: 'issue' },
    { icon: Package, label: 'Inventory', path: 'inventory' },
    { icon: AlertTriangle, label: 'Alerts', path: 'alerts' },
  ],
  billing_staff: [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: CreditCard, label: 'OP Bills', path: 'op-bills' },
    { icon: Bed, label: 'IP Bills', path: 'ip-bills' },
    { icon: FileText, label: 'Insurance', path: 'insurance' },
    { icon: ClipboardList, label: 'Discharge', path: 'discharge' },
  ],
};

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = menusByRole[user.role] || [];

  const getRoleLabel = (role: EmployeeRole): string => {
    const labels: Record<EmployeeRole, string> = {
      admin: 'Administrator',
      reception: 'Reception',
      doctor: 'Doctor',
      nurse: 'Nurse',
      lab_technician: 'Lab Technician',
      pharmacist: 'Pharmacist',
      billing_staff: 'Billing Staff',
    };
    return labels[role];
  };

  return (
    <aside className="w-64 bg-sidebar h-screen flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-medical flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-semibold text-lg">MediCare</h1>
            <p className="text-sidebar-foreground/60 text-xs">Hospital Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sidebar-primary font-semibold text-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground font-medium text-sm truncate">{user.name}</p>
            <p className="text-sidebar-foreground/60 text-xs">{user.role !== 'patient' ? getRoleLabel(user.role) : 'Patient'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={cn(
                isActive ? 'sidebar-link-active' : 'sidebar-link',
                'w-full'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
