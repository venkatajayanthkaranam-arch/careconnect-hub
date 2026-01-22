import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'medical' | 'success' | 'warning' | 'critical';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  subtitle,
}) => {
  const isGradient = variant !== 'default';

  const gradientClasses: Record<string, string> = {
    medical: 'gradient-medical',
    success: 'gradient-success',
    warning: 'gradient-warning',
    critical: 'gradient-critical',
  };

  if (isGradient) {
    return (
      <div className={cn('stat-card-gradient', gradientClasses[variant])}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            {subtitle && (
              <p className="text-white/70 text-xs mt-1">{subtitle}</p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3">
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-white/80" />
            ) : (
              <TrendingDown className="w-4 h-4 text-white/80" />
            )}
            <span className="text-sm text-white/80">
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          {trend.isPositive ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-critical" />
          )}
          <span className={cn(
            "text-sm",
            trend.isPositive ? "text-success" : "text-critical"
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last week
          </span>
        </div>
      )}
    </div>
  );
};
