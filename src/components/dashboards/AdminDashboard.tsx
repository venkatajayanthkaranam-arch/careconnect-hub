import React, { useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { AlertBanner } from '@/components/shared/AlertBanner';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeManagement } from '@/components/admin/EmployeeManagement';
import { useDashboardStats, useAlerts, useTodayAppointments, useBeds } from '@/hooks/useDashboardData';
import { 
  Users, 
  Calendar, 
  Bed, 
  Activity, 
  AlertTriangle, 
  FlaskConical, 
  Package, 
  CreditCard,
  TrendingUp,
  UserCog,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppointmentWithDetails } from '@/hooks/useDashboardData';
import type { Database } from '@/integrations/supabase/types';

type Alert = Database['public']['Tables']['alerts']['Row'];

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts();
  const { data: appointments = [], isLoading: appointmentsLoading } = useTodayAppointments();
  const { data: beds = [], isLoading: bedsLoading } = useBeds();

  const isLoading = statsLoading || alertsLoading || appointmentsLoading || bedsLoading;

  const upcomingAppointments = appointments.slice(0, 5);

  const appointmentColumns = [
    { 
      key: 'patientName', 
      header: 'Patient',
      render: (item: AppointmentWithDetails) => item.patients?.name || 'Unknown'
    },
    { 
      key: 'doctorName', 
      header: 'Doctor',
      render: (item: AppointmentWithDetails) => item.doctors?.name || 'Not Assigned'
    },
    { key: 'appointment_time', header: 'Time' },
    { 
      key: 'status', 
      header: 'Status',
      render: (item: AppointmentWithDetails) => <StatusBadge status={item.status} />
    },
  ];

  // Transform alerts to match AlertBanner expected format
  const formattedAlerts = alerts.map(alert => ({
    id: alert.id,
    type: alert.type,
    message: alert.message,
    severity: alert.severity,
    createdAt: new Date(alert.created_at),
    acknowledged: alert.acknowledged || false,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-auto grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              Employee Management
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'overview' && (
            <Button variant="medical" onClick={() => onNavigate('reports')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          )}
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of hospital operations</p>
          </div>

          <AlertBanner alerts={formattedAlerts} />

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
            ) : (
              <>
                <StatCard
                  title="Total Patients"
                  value={(stats?.totalPatients || 0).toLocaleString()}
                  icon={Users}
                  variant="medical"
                  trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                  title="Today's Appointments"
                  value={stats?.todayAppointments || 0}
                  icon={Calendar}
                  trend={{ value: 8, isPositive: true }}
                />
                <StatCard
                  title="Bed Occupancy"
                  value={`${stats?.bedOccupancy || 0}%`}
                  icon={Bed}
                  subtitle={`${stats?.availableBeds || 0} beds available`}
                />
                <StatCard
                  title="ICU Utilization"
                  value={`${stats?.icuUtilization || 0}%`}
                  icon={Activity}
                  variant="warning"
                  subtitle={`${stats?.availableIcuBeds || 0} ICU beds available`}
                />
              </>
            )}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
            ) : (
              <>
                <StatCard
                  title="Emergency Load"
                  value={stats?.emergencyLoad || 0}
                  icon={AlertTriangle}
                  variant="critical"
                />
                <StatCard
                  title="Pending Lab Tests"
                  value={stats?.pendingLabTests || 0}
                  icon={FlaskConical}
                />
                <StatCard
                  title="Low Stock Items"
                  value={stats?.lowStockMedicines || 0}
                  icon={Package}
                  variant="warning"
                />
                <StatCard
                  title="Pending Bills"
                  value={stats?.pendingBills || 0}
                  icon={CreditCard}
                />
              </>
            )}
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
              {appointmentsLoading ? (
                <Skeleton className="h-48 rounded-lg" />
              ) : (
                <DataTable
                  columns={appointmentColumns}
                  data={upcomingAppointments}
                  keyField="id"
                  emptyMessage="No appointments today"
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Critical Alerts</h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              {alertsLoading ? (
                <Skeleton className="h-48 rounded-lg" />
              ) : (
                <div className="space-y-3">
                  {alerts.filter(a => !a.acknowledged).slice(0, 4).length === 0 ? (
                    <div className="p-4 rounded-lg border border-border text-center text-muted-foreground">
                      No active alerts
                    </div>
                  ) : (
                    alerts.filter(a => !a.acknowledged).slice(0, 4).map((alert) => (
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
                              {new Date(alert.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
