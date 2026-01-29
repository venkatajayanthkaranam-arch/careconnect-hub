import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAppointments, useBills } from '@/hooks/useDashboardData';
import { departmentLabels } from '@/data/mockData';
import { 
  Calendar, 
  CreditCard, 
  Clock,
  User,
  FileText,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AppointmentBooking } from '@/components/patient/AppointmentBooking';
import type { AppointmentWithDetails, BillWithDetails } from '@/hooks/useDashboardData';

export const PatientDashboard: React.FC = () => {
  const { patientRecord, profile } = useAuth();
  const [showBooking, setShowBooking] = useState(false);

  const patientId = patientRecord?.id || '';
  const patientName = profile?.name || patientRecord?.name || 'Patient';

  // Fetch real data from Supabase
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments(patientId);
  const { data: bills = [], isLoading: billsLoading } = useBills(patientId);

  const upcomingAppointments = appointments.filter(
    a => a.status === 'scheduled' || a.status === 'waiting'
  );
  const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'partial');
  const totalPending = pendingBills.reduce((sum, b) => sum + (Number(b.total_amount) - Number(b.paid_amount)), 0);

  const appointmentColumns = [
    { 
      key: 'date', 
      header: 'Date',
      render: (item: AppointmentWithDetails) => format(new Date(item.appointment_date), 'MMM dd, yyyy')
    },
    { key: 'appointment_time', header: 'Time' },
    { 
      key: 'doctorName', 
      header: 'Doctor',
      render: (item: AppointmentWithDetails) => item.doctors?.name || 'Not Assigned'
    },
    { 
      key: 'department', 
      header: 'Department',
      render: (item: AppointmentWithDetails) => departmentLabels[item.department]
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item: AppointmentWithDetails) => <StatusBadge status={item.status} /> 
    },
  ];

  const billColumns = [
    { 
      key: 'createdAt', 
      header: 'Date',
      render: (item: BillWithDetails) => format(new Date(item.created_at), 'MMM dd, yyyy')
    },
    { key: 'id', header: 'Bill ID', render: (item: BillWithDetails) => item.id.slice(0, 8) },
    { key: 'type', header: 'Type', render: (item: BillWithDetails) => item.type.toUpperCase() },
    { 
      key: 'totalAmount', 
      header: 'Amount',
      render: (item: BillWithDetails) => `₹${Number(item.total_amount).toLocaleString()}`
    },
    { 
      key: 'paidAmount', 
      header: 'Paid',
      render: (item: BillWithDetails) => `₹${Number(item.paid_amount).toLocaleString()}`
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item: BillWithDetails) => <StatusBadge status={item.status} /> 
    },
  ];

  if (showBooking) {
    return <AppointmentBooking onBack={() => setShowBooking(false)} />;
  }

  const isLoading = appointmentsLoading || billsLoading;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-info/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome, {patientName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your appointments and health records
            </p>
            <div className="flex items-center gap-2 mt-3 text-sm">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                Patient ID: {patientId || 'Not Assigned'}
              </span>
            </div>
          </div>
          <Button variant="medical" onClick={() => setShowBooking(true)}>
            <Plus className="w-4 h-4" />
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
        ) : (
          <>
            <StatCard
              title="Upcoming Appointments"
              value={upcomingAppointments.length}
              icon={Calendar}
              variant="medical"
            />
            <StatCard
              title="Total Appointments"
              value={appointments.length}
              icon={Clock}
            />
            <StatCard
              title="Pending Bills"
              value={pendingBills.length}
              icon={FileText}
              variant={pendingBills.length > 0 ? 'warning' : 'success'}
            />
            <StatCard
              title="Amount Due"
              value={`₹${totalPending.toLocaleString()}`}
              icon={CreditCard}
              variant={totalPending > 0 ? 'critical' : 'success'}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button variant="quickAction" onClick={() => setShowBooking(true)}>
          <Calendar className="w-4 h-4" />
          Book New Appointment
        </Button>
        <Button variant="quickAction">
          <FileText className="w-4 h-4" />
          View Medical Records
        </Button>
        <Button variant="quickAction">
          <User className="w-4 h-4" />
          Update Profile
        </Button>
      </div>

      {/* Appointments & Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Appointments</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </div>
          {appointmentsLoading ? (
            <Skeleton className="h-48 rounded-lg" />
          ) : appointments.length > 0 ? (
            <DataTable
              columns={appointmentColumns}
              data={appointments.slice(0, 5)}
              keyField="id"
            />
          ) : (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No appointments yet</p>
              <Button 
                variant="medical" 
                size="sm" 
                className="mt-4"
                onClick={() => setShowBooking(true)}
              >
                Book Your First Appointment
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Bills</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </div>
          {billsLoading ? (
            <Skeleton className="h-48 rounded-lg" />
          ) : bills.length > 0 ? (
            <DataTable
              columns={billColumns}
              data={bills.slice(0, 5)}
              keyField="id"
            />
          ) : (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No bills yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
