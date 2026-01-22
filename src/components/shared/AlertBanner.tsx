import React from 'react';
import { AlertTriangle, X, Bell, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Alert } from '@/types/hospital';

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  const criticalAlerts = alerts.filter(a => !a.acknowledged && a.severity === 'critical');

  if (criticalAlerts.length === 0) return null;

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'emergency':
        return AlertTriangle;
      case 'critical_result':
        return AlertCircle;
      case 'icu_overload':
        return Bell;
      default:
        return Info;
    }
  };

  return (
    <div className="space-y-2 mb-6">
      {criticalAlerts.slice(0, 3).map((alert) => {
        const Icon = getIcon(alert.type);
        return (
          <div
            key={alert.id}
            className={cn(
              "rounded-lg px-4 py-3 flex items-center gap-3",
              "bg-critical/10 border border-critical/20"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-critical/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-critical" />
            </div>
            <p className="flex-1 text-sm text-foreground">{alert.message}</p>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                onClick={() => onDismiss(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};
