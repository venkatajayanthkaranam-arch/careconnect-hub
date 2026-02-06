import React, { useState, useMemo } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityAppointment } from '@/components/appointments/PriorityAppointment';
import { useTodayAppointments, useLabTests } from '@/hooks/useDashboardData';
import { departmentLabels } from '@/data/mockData';
import { 
  Calendar, 
  Clock, 
  Users, 
  Stethoscope,
  FileText,
  FlaskConical,
  AlertTriangle,
  Brain,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AppointmentWithDetails, LabTestWithDetails } from '@/hooks/useDashboardData';
import type { Database } from '@/integrations/supabase/types';

type RiskLevel = Database['public']['Enums']['risk_level'];

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const styles = {
    low: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    high: 'bg-critical/10 text-critical border-critical/20 animate-pulse',
  };
  const icons = { low: '🟢', medium: '🟡', high: '🔴' };
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
      styles[level]
    )}>
      {icons[level]} {level.toUpperCase()}
    </span>
  );
};

export const DoctorDashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<AppointmentWithDetails | null>(null);
  
  const { data: appointments = [], isLoading: appointmentsLoading } = useTodayAppointments();
  const { data: labTests = [], isLoading: labTestsLoading } = useLabTests();

  const todayAppointments = useMemo(() => {
    const riskOrder: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
    return [...appointments].sort((a, b) => {
      const riskDiff = riskOrder[a.risk_level] - riskOrder[b.risk_level];
      if (riskDiff !== 0) return riskDiff;
      return a.appointment_time.localeCompare(b.appointment_time);
    });
  }, [appointments]);

  const waitingPatients = todayAppointments.filter(a => a.status === 'waiting');
  const inProgress = todayAppointments.filter(a => a.status === 'in_progress');
  const highRiskCount = todayAppointments.filter(a => a.risk_level === 'high').length;
  const completedLabTests = labTests.filter(t => t.sample_status === 'completed');

  const appointmentColumns = [
    { key: 'riskLevel', header: 'Priority', render: (item: AppointmentWithDetails) => <RiskBadge level={item.risk_level} /> },
    { key: 'appointment_time', header: 'Time' },
    { key: 'patientName', header: 'Patient', render: (item: AppointmentWithDetails) => item.patients?.name || 'Unknown' },
    { key: 'department', header: 'Dept', render: (item: AppointmentWithDetails) => departmentLabels[item.department] },
    { key: 'type', header: 'Type', render: (item: AppointmentWithDetails) => <StatusBadge status={item.type} /> },
    { key: 'status', header: 'Status', render: (item: AppointmentWithDetails) => <StatusBadge status={item.status} /> },
    { 
      key: 'action', header: 'Action',
      render: (item: AppointmentWithDetails) => (
        <Button size="sm" variant={item.status === 'waiting' ? 'medical' : 'outline'} onClick={() => setSelectedPatient(item)}>
          {item.status === 'waiting' ? 'Start' : 'View'}
        </Button>
      )
    },
  ];

  const labResultColumns = [
    { key: 'patientName', header: 'Patient', render: (item: LabTestWithDetails) => item.patients?.name || 'Unknown' },
    { key: 'test_name', header: 'Test' },
    { key: 'sampleStatus', header: 'Status', render: (item: LabTestWithDetails) => <StatusBadge status={item.sample_status} /> },
    { key: 'result', header: 'Result', render: (item: LabTestWithDetails) => (
        <span className={item.is_abnormal ? 'text-critical font-medium' : ''}>{item.result || '-'}</span>
      )
    },
  ];

  const handleSaveConsultation = () => {
    toast.success('Consultation saved successfully');
    setSelectedPatient(null);
  };

  const isLoading = appointmentsLoading || labTestsLoading;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Appointments sorted by risk priority</p>
          </div>
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />Overview
            </TabsTrigger>
            <TabsTrigger value="priority-booking" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />AI Priority Triage
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {isLoading ? (
              [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
            ) : (
              <>
                <StatCard title="High Risk Patients" value={highRiskCount} icon={AlertTriangle} variant="critical" />
                <StatCard title="Today's Appointments" value={todayAppointments.length} icon={Calendar} variant="medical" />
                <StatCard title="Waiting" value={waitingPatients.length} icon={Clock} variant="warning" />
                <StatCard title="In Consultation" value={inProgress.length} icon={Stethoscope} variant="success" />
                <StatCard title="Completed" value={todayAppointments.filter(a => a.status === 'completed').length} icon={Users} />
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="quickAction"><FileText className="w-4 h-4" />New Prescription</Button>
            <Button variant="quickAction"><FlaskConical className="w-4 h-4" />Order Lab Test</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Today's Schedule (Risk Prioritized)</h2>
              {appointmentsLoading ? <Skeleton className="h-64 rounded-lg" /> : (
                <DataTable columns={appointmentColumns} data={todayAppointments} keyField="id" emptyMessage="No appointments scheduled for today" />
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Lab Results</h2>
              {labTestsLoading ? <Skeleton className="h-64 rounded-lg" /> : (
                <DataTable columns={labResultColumns} data={completedLabTests.slice(0, 10)} keyField="id" emptyMessage="No completed lab results" />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="priority-booking">
          <PriorityAppointment />
        </TabsContent>
      </Tabs>

      {/* Consultation Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Patient Consultation - {selectedPatient?.patients?.name}
              {selectedPatient && <RiskBadge level={selectedPatient.risk_level} />}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div><p className="text-sm text-muted-foreground">Patient ID</p><p className="font-medium">{selectedPatient?.patient_id}</p></div>
              <div><p className="text-sm text-muted-foreground">Department</p><p className="font-medium">{selectedPatient?.department && departmentLabels[selectedPatient.department]}</p></div>
            </div>

            {selectedPatient?.symptoms && selectedPatient.symptoms.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Reported Symptoms</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedPatient.symptoms.map(s => <span key={s} className="bg-background px-2 py-1 rounded text-sm">{s}</span>)}
                </div>
                {selectedPatient.symptom_duration && <p className="text-sm">Duration: {selectedPatient.symptom_duration}</p>}
                {selectedPatient.additional_notes && <p className="text-sm mt-1">{selectedPatient.additional_notes}</p>}
              </div>
            )}

            <div className="space-y-3">
              <div><Label>Diagnosis</Label><Textarea placeholder="Enter diagnosis..." rows={2} className="mt-1" /></div>
              <div><Label>Notes</Label><Textarea placeholder="Consultation notes..." rows={3} className="mt-1" /></div>
              <div><Label>Follow-up Date</Label><Input type="date" className="mt-1" /></div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1"><FlaskConical className="w-4 h-4 mr-2" />Order Lab Test</Button>
              <Button variant="outline" className="flex-1"><FileText className="w-4 h-4 mr-2" />Write Prescription</Button>
              <Button variant="medical" className="flex-1" onClick={handleSaveConsultation}>Save & Complete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
