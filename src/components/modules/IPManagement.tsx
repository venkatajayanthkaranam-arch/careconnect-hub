import React, { useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockBeds, mockAdmissions, mockPatients } from '@/data/mockData';
import { 
  Bed, 
  UserPlus, 
  AlertTriangle, 
  Activity,
  ArrowRightLeft
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
import type { Bed as BedType } from '@/types/hospital';

export const IPManagement: React.FC = () => {
  const [isAdmitOpen, setIsAdmitOpen] = useState(false);
  const beds = mockBeds;
  const admissions = mockAdmissions;
  
  const bedsByWard = {
    general: beds.filter(b => b.wardType === 'general'),
    semi_private: beds.filter(b => b.wardType === 'semi_private'),
    private: beds.filter(b => b.wardType === 'private'),
    icu: beds.filter(b => b.wardType === 'icu'),
    emergency: beds.filter(b => b.wardType === 'emergency'),
  };

  const availableBeds = beds.filter(b => b.status === 'available').length;
  const icuBeds = bedsByWard.icu;
  const icuAvailable = icuBeds.filter(b => b.status === 'available').length;

  const bedColumns = [
    { key: 'bedNumber', header: 'Bed No.' },
    { 
      key: 'wardType', 
      header: 'Ward',
      render: (item: BedType) => (
        <span className="capitalize">{item.wardType.replace('_', ' ')}</span>
      )
    },
    { key: 'status', header: 'Status', render: (item: BedType) => <StatusBadge status={item.status} /> },
    { key: 'patientName', header: 'Patient', render: (item: BedType) => item.patientName || '-' },
    { 
      key: 'action', 
      header: 'Action',
      render: (item: BedType) => (
        item.status === 'available' ? (
          <Button size="sm" variant="medical">Allocate</Button>
        ) : item.status === 'occupied' ? (
          <Button size="sm" variant="outline">Transfer</Button>
        ) : (
          <Button size="sm" variant="outline" disabled>Maintenance</Button>
        )
      )
    },
  ];

  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Patient admitted successfully');
    setIsAdmitOpen(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">IP Management</h1>
          <p className="text-muted-foreground">Manage admissions and bed allocation</p>
        </div>
        <Dialog open={isAdmitOpen} onOpenChange={setIsAdmitOpen}>
          <DialogTrigger asChild>
            <Button variant="medical">
              <UserPlus className="w-4 h-4 mr-2" />
              Admit Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Admit New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ward Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Ward</SelectItem>
                    <SelectItem value="semi_private">Semi-Private</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Admission Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Advance Amount</Label>
                <Input type="number" placeholder="Enter advance amount" />
              </div>
              <div className="space-y-2">
                <Label>Insurance Status</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" variant="medical" className="w-full">
                Admit Patient
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Beds"
          value={beds.length}
          icon={Bed}
          subtitle={`${availableBeds} available`}
        />
        <StatCard
          title="Current Admissions"
          value={admissions.filter(a => a.status === 'admitted').length}
          icon={UserPlus}
          variant="medical"
        />
        <StatCard
          title="ICU Status"
          value={`${icuBeds.length - icuAvailable}/${icuBeds.length}`}
          icon={Activity}
          variant={icuAvailable <= 1 ? 'critical' : 'warning'}
          subtitle={`${icuAvailable} available`}
        />
        <StatCard
          title="Emergency Beds"
          value={bedsByWard.emergency.filter(b => b.status === 'available').length}
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Ward Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(bedsByWard).map(([ward, wardBeds]) => {
          const available = wardBeds.filter(b => b.status === 'available').length;
          const occupied = wardBeds.filter(b => b.status === 'occupied').length;
          return (
            <div key={ward} className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-medium capitalize text-sm">{ward.replace('_', ' ')}</h3>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-bold">{available}</span>
                <span className="text-muted-foreground text-sm">/ {wardBeds.length}</span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-medical transition-all duration-300"
                  style={{ width: `${(occupied / wardBeds.length) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="quickAction">
          <ArrowRightLeft className="w-4 h-4" />
          Transfer Patient
        </Button>
        <Button variant="quickAction">
          <Bed className="w-4 h-4" />
          View All Beds
        </Button>
      </div>

      {/* Beds Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Bed Status</h2>
        <DataTable
          columns={bedColumns}
          data={beds}
          keyField="id"
        />
      </div>
    </div>
  );
};
