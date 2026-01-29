import React, { useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useBills } from '@/hooks/useDashboardData';
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
import { Skeleton } from '@/components/ui/skeleton';
import type { BillWithDetails } from '@/hooks/useDashboardData';

export const BillingDashboard: React.FC = () => {
  const [selectedBill, setSelectedBill] = useState<BillWithDetails | null>(null);
  
  const { data: bills = [], isLoading } = useBills();
  
  const pendingBills = bills.filter(b => b.status === 'pending');
  const totalPending = pendingBills.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const totalCollected = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.paid_amount), 0);
  const insuranceBills = bills.filter(b => b.insurance_claim_status);

  const billColumns = [
    { 
      key: 'patientName', 
      header: 'Patient',
      render: (item: BillWithDetails) => item.patients?.name || 'Unknown'
    },
    { key: 'type', header: 'Type', render: (item: BillWithDetails) => <StatusBadge status={item.type} /> },
    { 
      key: 'totalAmount', 
      header: 'Amount',
      render: (item: BillWithDetails) => <span className="font-medium">₹{Number(item.total_amount).toLocaleString()}</span>
    },
    { 
      key: 'paidAmount', 
      header: 'Paid',
      render: (item: BillWithDetails) => <span>₹{Number(item.paid_amount).toLocaleString()}</span>
    },
    { key: 'status', header: 'Status', render: (item: BillWithDetails) => <StatusBadge status={item.status} /> },
    { 
      key: 'action', 
      header: 'Action',
      render: (item: BillWithDetails) => (
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
    { 
      key: 'patientName', 
      header: 'Patient',
      render: (item: BillWithDetails) => item.patients?.name || 'Unknown'
    },
    { 
      key: 'claimAmount', 
      header: 'Claim Amount',
      render: (item: BillWithDetails) => item.insurance_claim_amount ? `₹${Number(item.insurance_claim_amount).toLocaleString()}` : '-'
    },
    { 
      key: 'claimStatus', 
      header: 'Status',
      render: (item: BillWithDetails) => item.insurance_claim_status ? <StatusBadge status={item.insurance_claim_status} /> : '-'
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
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
        ) : (
          <>
            <StatCard
              title="Pending Bills"
              value={pendingBills.length}
              icon={FileText}
              variant="warning"
            />
            <StatCard
              title="Total Pending"
              value={`₹${totalPending.toLocaleString()}`}
              icon={DollarSign}
              variant="critical"
            />
            <StatCard
              title="Collected Today"
              value={`₹${totalCollected.toLocaleString()}`}
              icon={CreditCard}
              variant="success"
            />
            <StatCard
              title="Insurance Claims"
              value={insuranceBills.length}
              icon={CheckCircle}
              variant="medical"
            />
          </>
        )}
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
          {isLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : (
            <DataTable
              columns={billColumns}
              data={bills}
              keyField="id"
              emptyMessage="No bills found"
            />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Insurance Claims</h2>
          {isLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : (
            <DataTable
              columns={insuranceColumns}
              data={insuranceBills}
              keyField="id"
              emptyMessage="No insurance claims"
            />
          )}
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
                  <p className="font-medium">{selectedBill?.patients?.name}</p>
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
                {selectedBill?.bill_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">{item.service_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">₹{Number(item.total).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-muted">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-lg">₹{Number(selectedBill?.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount Received</Label>
                <Input type="number" placeholder="Enter amount" defaultValue={selectedBill?.total_amount?.toString()} />
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
