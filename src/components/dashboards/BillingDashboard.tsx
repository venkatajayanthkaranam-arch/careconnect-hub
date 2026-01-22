import React, { useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockBills, mockAdmissions } from '@/data/mockData';
import { 
  CreditCard, 
  FileText, 
  DollarSign, 
  CheckCircle,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { Bill } from '@/types/hospital';

export const BillingDashboard: React.FC = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const bills = mockBills;
  const pendingBills = bills.filter(b => b.status === 'pending');
  const totalPending = pendingBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalCollected = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.paidAmount, 0);

  const billColumns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'type', header: 'Type', render: (item: Bill) => <StatusBadge status={item.type} /> },
    { 
      key: 'totalAmount', 
      header: 'Amount',
      render: (item: Bill) => <span className="font-medium">${item.totalAmount.toLocaleString()}</span>
    },
    { 
      key: 'paidAmount', 
      header: 'Paid',
      render: (item: Bill) => <span>${item.paidAmount.toLocaleString()}</span>
    },
    { key: 'status', header: 'Status', render: (item: Bill) => <StatusBadge status={item.status} /> },
    { 
      key: 'action', 
      header: 'Action',
      render: (item: Bill) => (
        <Button 
          size="sm" 
          variant={item.status === 'pending' ? 'medical' : 'outline'}
          onClick={() => setSelectedBill(item)}
        >
          {item.status === 'pending' ? 'Collect' : 'View'}
        </Button>
      )
    },
  ];

  const insuranceColumns = [
    { key: 'patientName', header: 'Patient' },
    { 
      key: 'insurance', 
      header: 'Provider',
      render: (item: Bill) => item.insuranceClaim?.provider || '-'
    },
    { 
      key: 'claimAmount', 
      header: 'Claim Amount',
      render: (item: Bill) => item.insuranceClaim ? `$${item.insuranceClaim.claimAmount.toLocaleString()}` : '-'
    },
    { 
      key: 'claimStatus', 
      header: 'Status',
      render: (item: Bill) => item.insuranceClaim ? <StatusBadge status={item.insuranceClaim.status} /> : '-'
    },
  ];

  const handleCollectPayment = () => {
    toast.success('Payment collected successfully');
    setSelectedBill(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing Dashboard</h1>
          <p className="text-muted-foreground">Manage patient billing and payments</p>
        </div>
        <Button variant="medical">
          <FileText className="w-4 h-4 mr-2" />
          Generate New Bill
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Pending Bills"
          value={pendingBills.length}
          icon={FileText}
          variant="warning"
        />
        <StatCard
          title="Total Pending"
          value={`$${totalPending.toLocaleString()}`}
          icon={DollarSign}
          variant="critical"
        />
        <StatCard
          title="Collected Today"
          value={`$${totalCollected.toLocaleString()}`}
          icon={CreditCard}
          variant="success"
        />
        <StatCard
          title="Insurance Claims"
          value={bills.filter(b => b.insuranceClaim).length}
          icon={CheckCircle}
          variant="medical"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="quickAction">
          <FileText className="w-4 h-4" />
          OP Billing
        </Button>
        <Button variant="quickAction">
          <CreditCard className="w-4 h-4" />
          IP Billing
        </Button>
        <Button variant="quickAction">
          <CheckCircle className="w-4 h-4" />
          Discharge Billing
        </Button>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Bills</h2>
          <DataTable
            columns={billColumns}
            data={bills}
            keyField="id"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Insurance Claims</h2>
          <DataTable
            columns={insuranceColumns}
            data={bills.filter(b => b.insuranceClaim)}
            keyField="id"
          />
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedBill?.patientName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bill Type</p>
                  <StatusBadge status={selectedBill?.type || 'op'} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Services</Label>
              <div className="border rounded-lg divide-y">
                {selectedBill?.services.map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {service.quantity}</p>
                    </div>
                    <span className="font-medium">${service.total.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-muted">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-lg">${selectedBill?.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount Received</Label>
                <Input type="number" placeholder="Enter amount" defaultValue={selectedBill?.totalAmount} />
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select defaultValue="card">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Printer className="w-4 h-4 mr-2" />
                Print Bill
              </Button>
              <Button variant="medical" className="flex-1" onClick={handleCollectPayment}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Collect Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
