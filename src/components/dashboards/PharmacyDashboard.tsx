import React, { useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AIInsightsPanel } from '@/components/pharmacy/AIInsightsPanel';
import { usePrescriptions, useMedicines } from '@/hooks/useDashboardData';
import { 
  Pill, 
  ClipboardList, 
  Package, 
  AlertTriangle,
  Check,
  Brain
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
import { Skeleton } from '@/components/ui/skeleton';
import type { PrescriptionWithDetails } from '@/hooks/useDashboardData';
import type { Database } from '@/integrations/supabase/types';

type Medicine = Database['public']['Tables']['medicines']['Row'];

export const PharmacyDashboard: React.FC = () => {
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithDetails | null>(null);
  
  const { data: prescriptions = [], isLoading: prescriptionsLoading } = usePrescriptions();
  const { data: medicines = [], isLoading: medicinesLoading } = useMedicines();

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
  const lowStockMedicines = medicines.filter(m => m.stock <= m.reorder_level);
  const expiringMedicines = medicines.filter(m => {
    if (!m.expiry_date) return false;
    const daysUntilExpiry = Math.ceil((new Date(m.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90;
  });

  const prescriptionColumns = [
    { 
      key: 'patientName', 
      header: 'Patient',
      render: (item: PrescriptionWithDetails) => item.patients?.name || 'Unknown'
    },
    { 
      key: 'doctorName', 
      header: 'Doctor',
      render: (item: PrescriptionWithDetails) => item.doctors?.name || 'Unknown'
    },
    { key: 'type', header: 'Type', render: (item: PrescriptionWithDetails) => <StatusBadge status={item.type} /> },
    { 
      key: 'medicines', 
      header: 'Items',
      render: (item: PrescriptionWithDetails) => <span>{item.prescription_items?.length || 0} items</span>
    },
    { key: 'status', header: 'Status', render: (item: PrescriptionWithDetails) => <StatusBadge status={item.status} /> },
    { 
      key: 'action', 
      header: 'Action',
      render: (item: PrescriptionWithDetails) => (
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
        <span className={item.stock <= item.reorder_level ? 'text-critical font-medium' : ''}>
          {item.stock}
        </span>
      )
    },
    { 
      key: 'expiryDate', 
      header: 'Expiry',
      render: (item: Medicine) => {
        if (!item.expiry_date) return '-';
        const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <span className={daysUntilExpiry <= 90 ? 'text-warning font-medium' : ''}>
            {new Date(item.expiry_date).toLocaleDateString()}
          </span>
        );
      }
    },
  ];

  const handleIssueMedicines = () => {
    toast.success('Medicines issued successfully');
    setSelectedPrescription(null);
  };

  const isLoading = prescriptionsLoading || medicinesLoading;

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
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
        ) : (
          <>
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
          </>
        )}
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
                {lowStockMedicines.slice(0, 5).map(m => (
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
                {expiringMedicines.slice(0, 5).map(m => (
                  <li key={m.id}>{m.name} - Expires {m.expiry_date && new Date(m.expiry_date).toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tables and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pending Prescriptions</h2>
            {prescriptionsLoading ? (
              <Skeleton className="h-64 rounded-lg" />
            ) : (
              <DataTable
                columns={prescriptionColumns}
                data={prescriptions}
                keyField="id"
                emptyMessage="No prescriptions found"
              />
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Inventory</h2>
            {medicinesLoading ? (
              <Skeleton className="h-64 rounded-lg" />
            ) : (
              <DataTable
                columns={inventoryColumns}
                data={medicines}
                keyField="id"
                emptyMessage="No medicines in inventory"
              />
            )}
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Insights</h2>
          </div>
          <AIInsightsPanel compact />
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
                  <p className="font-medium">{selectedPrescription?.patients?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Doctor</p>
                  <p className="font-medium">{selectedPrescription?.doctors?.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Medicines to Issue</Label>
              {selectedPrescription?.prescription_items?.map((med) => (
                <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{med.medicine_name}</p>
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
