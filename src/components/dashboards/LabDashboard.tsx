import React, { useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockLabTests } from '@/data/mockData';
import { 
  FlaskConical, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { LabTest } from '@/types/hospital';

export const LabDashboard: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const labTests = mockLabTests;
  const pendingTests = labTests.filter(t => t.sampleStatus === 'pending');
  const processingTests = labTests.filter(t => t.sampleStatus === 'processing' || t.sampleStatus === 'collected');
  const completedTests = labTests.filter(t => t.sampleStatus === 'completed');

  const testColumns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'testName', header: 'Test Name' },
    { key: 'orderedBy', header: 'Ordered By' },
    { 
      key: 'sampleStatus', 
      header: 'Status',
      render: (item: LabTest) => <StatusBadge status={item.sampleStatus} />
    },
    { 
      key: 'action', 
      header: 'Action',
      render: (item: LabTest) => (
        <Button 
          size="sm" 
          variant={item.sampleStatus === 'processing' ? 'medical' : 'outline'}
          onClick={() => setSelectedTest(item)}
        >
          {item.sampleStatus === 'pending' ? 'Collect Sample' : 
           item.sampleStatus === 'collected' ? 'Process' :
           item.sampleStatus === 'processing' ? 'Enter Result' : 'View'}
        </Button>
      )
    },
  ];

  const handleSubmitResult = () => {
    toast.success('Lab result submitted successfully');
    setSelectedTest(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lab Dashboard</h1>
          <p className="text-muted-foreground">Manage lab tests and results</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Pending Collection"
          value={pendingTests.length}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Processing"
          value={processingTests.length}
          icon={FlaskConical}
          variant="medical"
        />
        <StatCard
          title="Completed Today"
          value={completedTests.length}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Abnormal Results"
          value={completedTests.filter(t => t.isAbnormal).length}
          icon={AlertCircle}
          variant="critical"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="quickAction">
          <FlaskConical className="w-4 h-4" />
          Collect Sample
        </Button>
        <Button variant="quickAction">
          <FileText className="w-4 h-4" />
          Enter Result
        </Button>
      </div>

      {/* Tests Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All Lab Tests</h2>
        <DataTable
          columns={testColumns}
          data={labTests}
          keyField="id"
        />
      </div>

      {/* Result Entry Dialog */}
      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Lab Result</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedTest?.patientName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Test</p>
                  <p className="font-medium">{selectedTest?.testName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sample Status</Label>
              <Select defaultValue={selectedTest?.sampleStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Result</Label>
              <Input placeholder="Enter result value" />
            </div>

            <div className="space-y-2">
              <Label>Normal Range</Label>
              <Input placeholder="e.g., 70-100 mg/dL" defaultValue={selectedTest?.normalRange} />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Additional notes..." rows={2} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="abnormal" className="rounded" />
              <Label htmlFor="abnormal" className="text-sm font-normal">Mark as Abnormal Result</Label>
            </div>

            <Button variant="medical" className="w-full" onClick={handleSubmitResult}>
              Submit Result
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
