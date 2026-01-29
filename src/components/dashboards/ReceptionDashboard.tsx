import React, { useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useTodayAppointments, usePatients } from '@/hooks/useDashboardData';
import { departmentLabels } from '@/data/mockData';
import { 
  UserPlus, 
  Calendar, 
  Users, 
  Clock,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppointmentWithDetails } from '@/hooks/useDashboardData';

export const ReceptionDashboard: React.FC = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useTodayAppointments();
  const { data: patients = [], isLoading: patientsLoading } = usePatients();

  const waitingCount = todayAppointments.filter(a => a.status === 'waiting').length;
  const todayNewPatients = patients.filter(p => {
    const today = new Date().toISOString().split('T')[0];
    return p.created_at.startsWith(today);
  }).length;

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
      key: 'type', 
      header: 'Type', 
      render: (item: AppointmentWithDetails) => <StatusBadge status={item.type} /> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item: AppointmentWithDetails) => <StatusBadge status={item.status} /> 
    },
    { 
      key: 'paymentStatus', 
      header: 'Payment',
      render: (item: AppointmentWithDetails) => <StatusBadge status={item.payment_status} />
    },
  ];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Patient registered successfully');
    setIsRegisterOpen(false);
  };

  const isLoading = appointmentsLoading || patientsLoading;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reception Dashboard</h1>
          <p className="text-muted-foreground">Manage patient registrations and appointments</p>
        </div>
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button variant="medical">
              <UserPlus className="w-4 h-4 mr-2" />
              Register Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input id="patientName" placeholder="Enter full name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="Age" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1-555-0000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Enter address" />
              </div>
              <div className="space-y-2">
                <Label>Registration Type</Label>
                <Select defaultValue="offline">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" variant="medical" className="w-full">
                Register Patient
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Today's Appointments"
              value={todayAppointments.length}
              icon={Calendar}
              variant="medical"
            />
            <StatCard
              title="Waiting Patients"
              value={waitingCount}
              icon={Clock}
              variant="warning"
            />
            <StatCard
              title="Total Patients"
              value={patients.length}
              icon={Users}
            />
            <StatCard
              title="New Today"
              value={todayNewPatients}
              icon={UserPlus}
              variant="success"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="quickAction">
          <Plus className="w-4 h-4" />
          Book Appointment
        </Button>
        <Button variant="quickAction">
          <UserPlus className="w-4 h-4" />
          Walk-in Patient
        </Button>
      </div>

      {/* Appointments Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Today's Appointments</h2>
        {appointmentsLoading ? (
          <Skeleton className="h-64 rounded-lg" />
        ) : (
          <DataTable
            columns={appointmentColumns}
            data={todayAppointments}
            keyField="id"
            emptyMessage="No appointments scheduled for today"
          />
        )}
      </div>
    </div>
  );
};
