import React from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { AlertBanner } from '@/components/shared/AlertBanner';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockDashboardStats, mockAlerts, mockAppointments, mockBeds } from '@/data/mockData';
import { 
  Users, 
  Calendar, 
  Bed, 
  Activity, 
  AlertTriangle, 
  FlaskConical, 
  Package, 
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Appointment } from '@/types/hospital';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const stats = mockDashboardStats;
  const alerts = mockAlerts;
  
  const upcomingAppointments = mockAppointments.slice(0, 5);
  const bedStats = {
    total: mockBeds.length,
    available: mockBeds.filter(b => b.status === 'available').length,
    occupied: mockBeds.filter(b => b.status === 'occupied').length,
  };

  const appointmentColumns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName', header: 'Doctor' },
    { key: 'time', header: 'Time' },
    { 
      key: 'status', 
      header: 'Status',
      render: (item: Appointment) => <StatusBadge status={item.status} />
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of hospital operations</p>
        </div>
        <Button variant="medical" onClick={() => onNavigate('reports')}>
          <TrendingUp className="w-4 h-4 mr-2" />
          View Reports
        </Button>
      </div>

      <AlertBanner alerts={alerts} />

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients.toLocaleString()}
          icon={Users}
          variant="medical"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Bed Occupancy"
          value={`${stats.bedOccupancy}%`}
          icon={Bed}
          subtitle={`${bedStats.available} beds available`}
        />
        <StatCard
          title="ICU Utilization"
          value={`${stats.icuUtilization}%`}
          icon={Activity}
          variant="warning"
          subtitle="1 bed available"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Emergency Load"
          value={stats.emergencyLoad}
          icon={AlertTriangle}
          variant="critical"
        />
        <StatCard
          title="Pending Lab Tests"
          value={stats.pendingLabTests}
          icon={FlaskConical}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockMedicines}
          icon={Package}
          variant="warning"
        />
        <StatCard
          title="Pending Bills"
          value={stats.pendingBills}
          icon={CreditCard}
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Today's Appointments</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('appointments')}>
              View All
            </Button>
          </div>
          <DataTable
            columns={appointmentColumns}
            data={upcomingAppointments}
            keyField="id"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Critical Alerts</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {alerts.filter(a => !a.acknowledged).slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'critical' 
                    ? 'bg-critical/5 border-critical/20' 
                    : alert.severity === 'warning'
                    ? 'bg-warning/5 border-warning/20'
                    : 'bg-info/5 border-info/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                    alert.severity === 'critical' 
                      ? 'text-critical' 
                      : alert.severity === 'warning'
                      ? 'text-warning'
                      : 'text-info'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
