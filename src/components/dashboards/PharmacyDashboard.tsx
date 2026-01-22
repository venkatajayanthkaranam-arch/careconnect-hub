import React, { useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockPrescriptions, mockMedicines } from '@/data/mockData';
import { 
  Pill, 
  ClipboardList, 
  Package, 
  AlertTriangle,
  Check
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
import { toast } from 'sonner';
import type { Prescription, Medicine } from '@/types/hospital';

export const PharmacyDashboard: React.FC = () => {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const prescriptions = mockPrescriptions;
  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
  const lowStockMedicines = mockMedicines.filter(m => m.stock <= m.reorderLevel);
  const expiringMedicines = mockMedicines.filter(m => {
    const daysUntilExpiry = Math.ceil((m.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90;
  });

  const prescriptionColumns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName', header: 'Doctor' },
    { key: 'type', header: 'Type', render: (item: Prescription) => <StatusBadge status={item.type} /> },
    { 
      key: 'medicines', 
      header: 'Items',
      render: (item: Prescription) => <span>{item.medicines.length} items</span>
    },
    { key: 'status', header: 'Status', render: (item: Prescription) => <StatusBadge status={item.status} /> },
    { 
      key: 'action', 
      header: 'Action',
      render: (item: Prescription) => (
        <Button 
          size="sm" 
          variant={item.status === 'pending' ? 'medical' : 'outline'}
          onClick={() => setSelectedPrescription(item)}
          disabled={item.status === 'issued'}
        >
          {item.status === 'pending' ? 'Issue' : item.status === 'issued' ? 'Issued' : 'View'}
        </Button>
      )
    },
  ];

  const inventoryColumns = [
    { key: 'name', header: 'Medicine' },
    { key: 'category', header: 'Category' },
    { key: 'store', header: 'Store', render: (item: Medicine) => <StatusBadge status={item.store} /> },
    { 
      key: 'stock', 
      header: 'Stock',
      render: (item: Medicine) => (
        <span className={item.stock <= item.reorderLevel ? 'text-critical font-medium' : ''}>
          {item.stock}
        </span>
      )
    },
    { 
      key: 'expiryDate', 
      header: 'Expiry',
      render: (item: Medicine) => {
        const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <span className={daysUntilExpiry <= 90 ? 'text-warning font-medium' : ''}>
            {item.expiryDate.toLocaleDateString()}
          </span>
        );
      }
    },
  ];

  const handleIssueMedicines = () => {
    toast.success('Medicines issued successfully');
    setSelectedPrescription(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground">Manage prescriptions and inventory</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Pending Prescriptions"
          value={pendingPrescriptions.length}
          icon={ClipboardList}
          variant="medical"
        />
        <StatCard
          title="Issued Today"
          value={prescriptions.filter(p => p.status === 'issued').length}
          icon={Pill}
          variant="success"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockMedicines.length}
          icon={Package}
          variant="warning"
        />
        <StatCard
          title="Expiring Soon"
          value={expiringMedicines.length}
          icon={AlertTriangle}
          variant="critical"
        />
      </div>

      {/* Alerts */}
      {(lowStockMedicines.length > 0 || expiringMedicines.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockMedicines.length > 0 && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-warning" />
                <span className="font-medium text-warning">Low Stock Alert</span>
              </div>
              <ul className="text-sm space-y-1">
                {lowStockMedicines.map(m => (
                  <li key={m.id}>{m.name} - {m.stock} units remaining</li>
                ))}
              </ul>
            </div>
          )}
          {expiringMedicines.length > 0 && (
            <div className="p-4 rounded-lg bg-critical/10 border border-critical/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-critical" />
                <span className="font-medium text-critical">Expiry Alert</span>
              </div>
              <ul className="text-sm space-y-1">
                {expiringMedicines.map(m => (
                  <li key={m.id}>{m.name} - Expires {m.expiryDate.toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Pending Prescriptions</h2>
          <DataTable
            columns={prescriptionColumns}
            data={prescriptions}
            keyField="id"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Inventory</h2>
          <DataTable
            columns={inventoryColumns}
            data={mockMedicines}
            keyField="id"
          />
        </div>
      </div>

      {/* Issue Medicines Dialog */}
      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Issue Medicines</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedPrescription?.patientName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Doctor</p>
                  <p className="font-medium">{selectedPrescription?.doctorName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Medicines to Issue</Label>
              {selectedPrescription?.medicines.map((med, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage} - Qty: {med.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      defaultValue={med.quantity} 
                      className="w-20" 
                    />
                    <Check className="w-5 h-5 text-success" />
                  </div>
                </div>
              ))}
            </div>

            <Button variant="medical" className="w-full" onClick={handleIssueMedicines}>
              <Check className="w-4 h-4 mr-2" />
              Confirm & Issue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
