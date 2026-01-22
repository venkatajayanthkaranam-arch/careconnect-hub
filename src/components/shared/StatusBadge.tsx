import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled'
  | 'pending' | 'paid' | 'partial'
  | 'available' | 'occupied' | 'maintenance'
  | 'collected' | 'processing'
  | 'issued'
  | 'admitted' | 'discharged'
  | 'approved' | 'rejected' | 'under_review' | 'submitted'
  | 'online' | 'offline'
  | 'active'
  | 'none';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; label?: string }> = {
  // Appointment status
  scheduled: { bg: 'bg-info/10', text: 'text-info' },
  waiting: { bg: 'bg-warning/10', text: 'text-warning' },
  in_progress: { bg: 'bg-primary/10', text: 'text-primary', label: 'In Progress' },
  completed: { bg: 'bg-success/10', text: 'text-success' },
  cancelled: { bg: 'bg-muted', text: 'text-muted-foreground' },
  
  // Payment status
  pending: { bg: 'bg-warning/10', text: 'text-warning' },
  paid: { bg: 'bg-success/10', text: 'text-success' },
  partial: { bg: 'bg-info/10', text: 'text-info' },
  
  // Bed status
  available: { bg: 'bg-success/10', text: 'text-success' },
  occupied: { bg: 'bg-critical/10', text: 'text-critical' },
  maintenance: { bg: 'bg-muted', text: 'text-muted-foreground' },
  
  // Lab status
  collected: { bg: 'bg-info/10', text: 'text-info' },
  processing: { bg: 'bg-primary/10', text: 'text-primary' },
  
  // Prescription status
  issued: { bg: 'bg-success/10', text: 'text-success' },
  
  // Admission status
  admitted: { bg: 'bg-info/10', text: 'text-info' },
  discharged: { bg: 'bg-success/10', text: 'text-success' },
  
  // Insurance status
  approved: { bg: 'bg-success/10', text: 'text-success' },
  rejected: { bg: 'bg-critical/10', text: 'text-critical' },
  under_review: { bg: 'bg-warning/10', text: 'text-warning', label: 'Under Review' },
  submitted: { bg: 'bg-info/10', text: 'text-info' },
  none: { bg: 'bg-muted', text: 'text-muted-foreground' },
  
  // Registration type
  online: { bg: 'bg-primary/10', text: 'text-primary' },
  offline: { bg: 'bg-muted', text: 'text-muted-foreground' },
  
  // Patient status
  active: { bg: 'bg-success/10', text: 'text-success' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || { bg: 'bg-muted', text: 'text-muted-foreground' };
  const label = config.label || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
      config.bg,
      config.text,
      className
    )}>
      {label}
    </span>
  );
};
