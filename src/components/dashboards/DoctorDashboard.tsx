import React, { useState, useMemo } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockAppointments, mockLabTests, departmentLabels } from '@/data/mockData';
import { 
  Calendar, 
  Clock, 
  Users, 
  Stethoscope,
  FileText,
  FlaskConical,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Appointment, RiskLevel } from '@/types/hospital';
import { cn } from '@/lib/utils';

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const styles = {
    low: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    high: 'bg-critical/10 text-critical border-critical/20 animate-pulse',
  };
  const icons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };
  
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
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  
  // Sort appointments by risk level (high first) then by time
  const todayAppointments = useMemo(() => {
    const riskOrder: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
    return [...mockAppointments].sort((a, b) => {
      const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      if (riskDiff !== 0) return riskDiff;
      return a.time.localeCompare(b.time);
    });
  }, []);

  const waitingPatients = todayAppointments.filter(a => a.status === 'waiting');
  const inProgress = todayAppointments.filter(a => a.status === 'in_progress');
  const highRiskCount = todayAppointments.filter(a => a.riskLevel === 'high').length;

  const appointmentColumns = [
    { 
      key: 'riskLevel', 
      header: 'Priority',
      render: (item: Appointment) => <RiskBadge level={item.riskLevel} />
    },
    { key: 'time', header: 'Time' },
    { key: 'patientName', header: 'Patient' },
    { 
      key: 'department', 
      header: 'Dept',
      render: (item: Appointment) => departmentLabels[item.department]
    },
    { key: 'type', header: 'Type', render: (item: Appointment) => <StatusBadge status={item.type} /> },
    { key: 'status', header: 'Status', render: (item: Appointment) => <StatusBadge status={item.status} /> },
    { 
      key: 'action', 
      header: 'Action',
      render: (item: Appointment) => (
        <Button 
          size="sm" 
          variant={item.status === 'waiting' ? 'medical' : 'outline'}
          onClick={() => setSelectedPatient(item)}
        >
          {item.status === 'waiting' ? 'Start' : 'View'}
        </Button>
      )
    },
  ];

  const labResultColumns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'testName', header: 'Test' },
    { 
      key: 'sampleStatus', 
      header: 'Status',
      render: (item: typeof mockLabTests[0]) => <StatusBadge status={item.sampleStatus} />
    },
    { 
      key: 'result', 
      header: 'Result',
      render: (item: typeof mockLabTests[0]) => (
        <span className={item.isAbnormal ? 'text-critical font-medium' : ''}>
          {item.result || '-'}
        </span>
      )
    },
  ];

  const handleSaveConsultation = () => {
    toast.success('Consultation saved successfully');
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Appointments sorted by risk priority</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="High Risk Patients"
          value={highRiskCount}
          icon={AlertTriangle}
          variant="critical"
        />
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          icon={Calendar}
          variant="medical"
        />
        <StatCard
          title="Waiting"
          value={waitingPatients.length}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="In Consultation"
          value={inProgress.length}
          icon={Stethoscope}
          variant="success"
        />
        <StatCard
          title="Completed"
          value={todayAppointments.filter(a => a.status === 'completed').length}
          icon={Users}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="quickAction">
          <FileText className="w-4 h-4" />
          New Prescription
        </Button>
        <Button variant="quickAction">
          <FlaskConical className="w-4 h-4" />
          Order Lab Test
        </Button>
      </div>

      {/* Appointments Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Today's Schedule (Risk Prioritized)</h2>
          <DataTable
            columns={appointmentColumns}
            data={todayAppointments}
            keyField="id"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Lab Results</h2>
          <DataTable
            columns={labResultColumns}
            data={mockLabTests.filter(t => t.sampleStatus === 'completed')}
            keyField="id"
          />
        </div>
      </div>

      {/* Consultation Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Patient Consultation - {selectedPatient?.patientName}
              {selectedPatient && <RiskBadge level={selectedPatient.riskLevel} />}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="font-medium">{selectedPatient?.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{selectedPatient?.department && departmentLabels[selectedPatient.department]}</p>
              </div>
            </div>

            {selectedPatient?.symptomInfo && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Reported Symptoms</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedPatient.symptomInfo.symptoms.map(s => (
                    <span key={s} className="bg-background px-2 py-1 rounded text-sm">{s}</span>
                  ))}
                </div>
                <p className="text-sm">Duration: {selectedPatient.symptomInfo.duration}</p>
                {selectedPatient.symptomInfo.additionalNotes && (
                  <p className="text-sm mt-1">{selectedPatient.symptomInfo.additionalNotes}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Textarea placeholder="Enter diagnosis notes..." rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Prescription</Label>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <Input placeholder="Medicine" />
                  <Input placeholder="Dosage" />
                  <Input placeholder="Qty" type="number" />
                  <Input placeholder="Instructions" />
                </div>
                <Button variant="outline" size="sm">+ Add Medicine</Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex-1">
                <FlaskConical className="w-4 h-4 mr-2" />
                Request Lab Test
              </Button>
              <Button variant="medical" className="flex-1" onClick={handleSaveConsultation}>
                Save & Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
