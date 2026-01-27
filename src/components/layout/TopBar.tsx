import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockAlerts } from '@/data/mockData';

interface TopBarProps {
  onOpenChat: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenChat }) => {
  const { profile, patientRecord } = useAuth();
  const displayName = profile?.name || patientRecord?.name || 'User';
  const unreadAlerts = mockAlerts.filter(a => !a.acknowledged && a.severity === 'critical').length;

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search patients, appointments..." 
            className="pl-9 w-80 bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-4">{formatDate()}</span>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-critical text-critical-foreground text-xs rounded-full flex items-center justify-center animate-pulse-gentle">
              {unreadAlerts}
            </span>
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={onOpenChat}>
          <MessageSquare className="w-5 h-5" />
        </Button>

        <div className="w-px h-8 bg-border mx-2" />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gradient-medical flex items-center justify-center text-white font-medium text-sm">
            {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
};
