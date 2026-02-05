 import React, { useEffect } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Progress } from '@/components/ui/progress';
 import { Skeleton } from '@/components/ui/skeleton';
 import {
   BedDouble,
   AlertTriangle,
   TrendingUp,
   Users,
   Activity,
   RefreshCw,
   Brain,
 } from 'lucide-react';
 import { useBeds, useAdmissions } from '@/hooks/useDashboardData';
 import { usePharmacyAI } from '@/hooks/usePharmacyAI';
 import { cn } from '@/lib/utils';
 
 export const SmartBedManagement: React.FC = () => {
   const { data: beds = [], isLoading: bedsLoading } = useBeds();
   const { data: admissions = [], isLoading: admissionsLoading } = useAdmissions('admitted');
   const { analyze, isLoading: aiLoading, result } = usePharmacyAI();
 
   useEffect(() => {
     analyze('beds');
   }, []);
 
   const insights = result?.insights;
 
   const totalBeds = beds.length;
   const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
   const availableBeds = beds.filter(b => b.status === 'available').length;
   const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
 
   const wardStats = beds.reduce((acc, bed) => {
     const ward = bed.ward_type;
     if (!acc[ward]) acc[ward] = { total: 0, occupied: 0, available: 0 };
     acc[ward].total++;
     if (bed.status === 'occupied') acc[ward].occupied++;
     if (bed.status === 'available') acc[ward].available++;
     return acc;
   }, {} as Record<string, { total: number; occupied: number; available: number }>);
 
   const isLoading = bedsLoading || admissionsLoading;
 
   return (
     <div className="space-y-6">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {isLoading ? (
           [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
         ) : (
           <>
             <Card className="bg-gradient-to-br from-primary/10 to-transparent">
               <CardContent className="pt-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-muted-foreground">Total Beds</p>
                     <p className="text-3xl font-bold">{totalBeds}</p>
                   </div>
                   <BedDouble className="w-8 h-8 text-primary" />
                 </div>
               </CardContent>
             </Card>
             <Card className="bg-gradient-to-br from-success/10 to-transparent">
               <CardContent className="pt-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-muted-foreground">Available</p>
                     <p className="text-3xl font-bold text-success">{availableBeds}</p>
                   </div>
                   <Activity className="w-8 h-8 text-success" />
                 </div>
               </CardContent>
             </Card>
             <Card className="bg-gradient-to-br from-warning/10 to-transparent">
               <CardContent className="pt-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-muted-foreground">Occupied</p>
                     <p className="text-3xl font-bold text-warning">{occupiedBeds}</p>
                   </div>
                   <Users className="w-8 h-8 text-warning" />
                 </div>
               </CardContent>
             </Card>
             <Card className="bg-gradient-to-br from-muted to-transparent">
               <CardContent className="pt-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-muted-foreground">Occupancy</p>
                     <p className="text-3xl font-bold">{occupancyRate}%</p>
                   </div>
                   <TrendingUp className="w-8 h-8 text-muted-foreground" />
                 </div>
               </CardContent>
             </Card>
           </>
         )}
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2">
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
               <BedDouble className="w-5 h-5 text-primary" />
               Ward Occupancy
             </CardTitle>
           </CardHeader>
           <CardContent>
             {isLoading ? (
               <Skeleton className="h-48 w-full" />
             ) : (
               <div className="space-y-4">
                 {Object.entries(wardStats).map(([ward, stats]) => {
                   const pct = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;
                   return (
                     <div key={ward}>
                       <div className="flex justify-between mb-1">
                         <span className="font-medium capitalize">{ward.replace('_', ' ')}</span>
                         <span className="text-sm text-muted-foreground">{stats.occupied}/{stats.total}</span>
                       </div>
                       <Progress value={pct} className={cn("h-3", pct >= 90 && "[&>div]:bg-destructive")} />
                     </div>
                   );
                 })}
               </div>
             )}
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-primary/5 to-transparent">
           <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
               <CardTitle className="text-lg flex items-center gap-2">
                 <Brain className="w-5 h-5 text-primary" />
                 AI Predictions
               </CardTitle>
               <Button variant="ghost" size="sm" onClick={() => analyze('beds')} disabled={aiLoading}>
                 <RefreshCw className={cn("w-4 h-4", aiLoading && "animate-spin")} />
               </Button>
             </div>
           </CardHeader>
           <CardContent className="space-y-4">
             {aiLoading ? (
               <Skeleton className="h-32 w-full" />
             ) : insights?.occupancyForecast ? (
               <>
                 <div className="grid grid-cols-3 gap-2 text-center">
                   <div className="p-2 rounded-lg bg-background/50">
                     <p className="text-xs text-muted-foreground">Now</p>
                     <p className="text-xl font-bold">{insights.occupancyForecast.current}%</p>
                   </div>
                   <div className="p-2 rounded-lg bg-background/50">
                     <p className="text-xs text-muted-foreground">24h</p>
                     <p className="text-xl font-bold">{insights.occupancyForecast.predicted24h}%</p>
                   </div>
                   <div className="p-2 rounded-lg bg-background/50">
                     <p className="text-xs text-muted-foreground">48h</p>
                     <p className="text-xl font-bold">{insights.occupancyForecast.predicted48h}%</p>
                   </div>
                 </div>
                 {insights.occupancyForecast.criticalWards?.length > 0 && (
                   <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                     <div className="flex items-center gap-2 mb-1">
                       <AlertTriangle className="w-4 h-4 text-destructive" />
                       <span className="text-sm font-medium text-destructive">Critical Wards</span>
                     </div>
                     <div className="flex flex-wrap gap-1">
                       {insights.occupancyForecast.criticalWards.map((w, i) => (
                         <Badge key={i} variant="destructive" className="text-xs">{w}</Badge>
                       ))}
                     </div>
                   </div>
                 )}
               </>
             ) : (
               <div className="text-center py-8">
                 <Brain className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-30" />
                 <p className="text-sm text-muted-foreground">Click refresh to load predictions</p>
               </div>
             )}
           </CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2">
             <Users className="w-5 h-5 text-primary" />
             Current Admissions ({admissions.length})
           </CardTitle>
         </CardHeader>
         <CardContent>
           {admissionsLoading ? (
             <Skeleton className="h-32 w-full" />
           ) : admissions.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {admissions.slice(0, 6).map(a => (
                 <div key={a.id} className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
                   <div>
                     <p className="font-medium text-sm">{a.patients?.name || 'Patient'}</p>
                     <p className="text-xs text-muted-foreground capitalize">{a.ward_type.replace('_', ' ')}</p>
                   </div>
                   <Badge variant={a.type === 'emergency' ? 'destructive' : 'secondary'}>{a.type}</Badge>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-8 text-muted-foreground">
               <BedDouble className="w-12 h-12 mx-auto mb-2 opacity-30" />
               <p>No current admissions</p>
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 };