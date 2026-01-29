import React from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAdmissions } from '@/hooks/useDashboardData';
import { 
  Users, 
  Heart, 
  Pill, 
  ClipboardList,
  Activity
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
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdmissionWithDetails } from '@/hooks/useDashboardData';

export const NurseDashboard: React.FC = () => {
  const { data: admissions = [], isLoading } = useAdmissions('admitted');

  const patientColumns = [
    { 
      key: 'patientName', 
      header: 'Patient',
      render: (item: AdmissionWithDetails) => item.patients?.name || 'Unknown'
    },
    { key: 'ward_type', header: 'Ward' },
    { 
      key: 'bedId', 
      header: 'Bed',
      render: (item: AdmissionWithDetails) => item.beds?.bed_number || 'N/A'
    },
    { key: 'type', header: 'Type', render: (item: AdmissionWithDetails) => <StatusBadge status={item.type} /> },
    { 
      key: 'action', 
      header: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">Record Vitals</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Vital Signs</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4" onSubmit={(e) => { e.preventDefault(); toast.success('Vitals recorded'); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Temperature (°F)</Label>
                    <Input type="number" step="0.1" placeholder="98.6" />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Pressure</Label>
                    <Input placeholder="120/80" />
                  </div>
                  <div className="space-y-2">
                    <Label>Heart Rate (bpm)</Label>
                    <Input type="number" placeholder="72" />
                  </div>
                  <div className="space-y-2">
                    <Label>Oxygen Level (%)</Label>
                    <Input type="number" placeholder="98" />
                  </div>
                </div>
                <Button type="submit" variant="medical" className="w-full">Save Vitals</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="quickAction">Medications</Button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nurse Dashboard</h1>
          <p className="text-muted-foreground">Patient care and monitoring</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
        ) : (
          <>
            <StatCard
              title="Assigned Patients"
              value={admissions.length}
              icon={Users}
              variant="medical"
            />
            <StatCard
              title="Vitals Pending"
              value={3}
              icon={Heart}
              variant="warning"
            />
            <StatCard
              title="Medications Due"
              value={5}
              icon={Pill}
              variant="critical"
            />
            <StatCard
              title="Care Logs Today"
              value={12}
              icon={ClipboardList}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="quickAction">
          <Activity className="w-4 h-4" />
          Record Vitals
        </Button>
        <Button variant="quickAction">
          <Pill className="w-4 h-4" />
          Medication Schedule
        </Button>
        <Button variant="quickAction">
          <ClipboardList className="w-4 h-4" />
          Add Care Log
        </Button>
      </div>

      {/* Patients Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Assigned Patients</h2>
        {isLoading ? (
          <Skeleton className="h-64 rounded-lg" />
        ) : (
          <DataTable
            columns={patientColumns}
            data={admissions}
            keyField="id"
            emptyMessage="No admitted patients"
          />
        )}
      </div>

      {/* Upcoming Medications */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upcoming Medications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { patient: 'Mary Johnson', medicine: 'Amoxicillin 250mg', time: '10:00 AM', status: 'due' },
            { patient: 'Michael Davis', medicine: 'Metformin 500mg', time: '10:30 AM', status: 'upcoming' },
            { patient: 'Mary Johnson', medicine: 'Ibuprofen 400mg', time: '11:00 AM', status: 'upcoming' },
          ].map((med, i) => (
            <div key={i} className={`p-4 rounded-lg border ${med.status === 'due' ? 'bg-critical/5 border-critical/20' : 'bg-card border-border'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{med.patient}</p>
                  <p className="text-sm text-muted-foreground">{med.medicine}</p>
                </div>
                <span className={`text-sm font-medium ${med.status === 'due' ? 'text-critical' : 'text-muted-foreground'}`}>
                  {med.time}
                </span>
              </div>
              <Button size="sm" variant={med.status === 'due' ? 'medical' : 'outline'} className="w-full mt-3">
                {med.status === 'due' ? 'Administer Now' : 'Mark as Given'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
