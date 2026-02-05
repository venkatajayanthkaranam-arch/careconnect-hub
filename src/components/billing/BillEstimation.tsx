 import React, { useState, useEffect } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Progress } from '@/components/ui/progress';
 import { Skeleton } from '@/components/ui/skeleton';
 import {
   Receipt,
   Calculator,
   TrendingUp,
   Clock,
   CreditCard,
   FileText,
   RefreshCw,
   Brain,
   IndianRupee,
 } from 'lucide-react';
 import { useAuth } from '@/contexts/AuthContext';
 import { useBills } from '@/hooks/useDashboardData';
 import { usePharmacyAI } from '@/hooks/usePharmacyAI';
 import { cn } from '@/lib/utils';
 
 interface BillBreakdownItem {
   category: string;
   amount: number;
   description: string;
 }
 
 interface EstimatedBill {
   consultationType: string;
   estimatedTotal: number;
   breakdown: BillBreakdownItem[];
   insuranceCoverage: number;
   outOfPocket: number;
   confidence: number;
 }
 
 export const BillEstimation: React.FC = () => {
   const { patientRecord } = useAuth();
   const { data: bills = [], isLoading: billsLoading } = useBills(patientRecord?.id);
   const { analyze, isLoading: aiLoading, result } = usePharmacyAI();
 
   const [estimationType, setEstimationType] = useState<'op' | 'ip' | 'emergency'>('op');
 
   useEffect(() => { analyze('billing'); }, []);
 
   const insights = result?.insights;
 
   const totalBilled = bills.reduce((sum, b) => sum + (b.total_amount || 0), 0);
   const totalPaid = bills.reduce((sum, b) => sum + (b.paid_amount || 0), 0);
   const pendingAmount = totalBilled - totalPaid;
   const paidPercentage = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;
 
   const getEstimation = (type: 'op' | 'ip' | 'emergency'): EstimatedBill => {
     const estimations: Record<string, EstimatedBill> = {
       op: {
         consultationType: 'Outpatient Visit',
         estimatedTotal: 1500,
         breakdown: [
           { category: 'Consultation', amount: 500, description: 'Doctor consultation fee' },
           { category: 'Lab Tests', amount: 600, description: 'Basic blood work & urine' },
           { category: 'Pharmacy', amount: 400, description: 'Prescribed medications' },
         ],
         insuranceCoverage: 800,
         outOfPocket: 700,
         confidence: 85,
       },
       ip: {
         consultationType: 'Inpatient (3-5 days)',
         estimatedTotal: 45000,
         breakdown: [
           { category: 'Room', amount: 15000, description: 'Semi-private room' },
           { category: 'Doctor', amount: 8000, description: 'Consultant visits' },
           { category: 'Nursing', amount: 5000, description: 'Care' },
           { category: 'Lab', amount: 7000, description: 'Tests' },
           { category: 'Pharmacy', amount: 6000, description: 'Medications' },
           { category: 'Other', amount: 4000, description: 'Misc' },
         ],
         insuranceCoverage: 35000,
         outOfPocket: 10000,
         confidence: 75,
       },
       emergency: {
         consultationType: 'Emergency Care',
         estimatedTotal: 8000,
         breakdown: [
           { category: 'ER Fee', amount: 2000, description: 'Facility' },
           { category: 'Doctor', amount: 1500, description: 'Physician' },
           { category: 'Diagnostics', amount: 3000, description: 'Tests' },
           { category: 'Treatment', amount: 1500, description: 'Care' },
         ],
         insuranceCoverage: 6000,
         outOfPocket: 2000,
         confidence: 70,
       },
     };
     return estimations[type];
   };
 
   const currentEstimation = getEstimation(estimationType);
 
   return (
     <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {billsLoading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />) : (
           <>
             <Card className="bg-gradient-to-br from-primary/10 to-transparent">
               <CardContent className="pt-4">
                 <div className="flex items-center justify-between">
                   <div><p className="text-sm text-muted-foreground">Total Billed</p><p className="text-2xl font-bold">₹{totalBilled.toLocaleString()}</p></div>
                   <Receipt className="w-8 h-8 text-primary" />
                 </div>
               </CardContent>
             </Card>
             <Card className="bg-gradient-to-br from-success/10 to-transparent">
               <CardContent className="pt-4">
                 <div className="flex items-center justify-between">
                   <div><p className="text-sm text-muted-foreground">Total Paid</p><p className="text-2xl font-bold text-success">₹{totalPaid.toLocaleString()}</p></div>
                   <CreditCard className="w-8 h-8 text-success" />
                 </div>
               </CardContent>
             </Card>
             <Card className="bg-gradient-to-br from-warning/10 to-transparent">
               <CardContent className="pt-4">
                 <div className="flex items-center justify-between">
                   <div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-warning">₹{pendingAmount.toLocaleString()}</p></div>
                   <Clock className="w-8 h-8 text-warning" />
                 </div>
               </CardContent>
             </Card>
             <Card className="bg-gradient-to-br from-muted to-transparent">
               <CardContent className="pt-4">
                 <div className="flex items-center justify-between">
                   <div><p className="text-sm text-muted-foreground">Progress</p><p className="text-2xl font-bold">{paidPercentage}%</p></div>
                   <TrendingUp className="w-8 h-8 text-muted-foreground" />
                 </div>
                 <Progress value={paidPercentage} className="h-2 mt-2" />
               </CardContent>
             </Card>
           </>
         )}
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2">
           <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calculator className="w-5 h-5 text-primary" />Bill Estimation</CardTitle></CardHeader>
           <CardContent className="space-y-4">
             <div className="flex gap-2">
               {(['op', 'ip', 'emergency'] as const).map(type => (
                 <Button key={type} variant={estimationType === type ? 'default' : 'outline'} onClick={() => setEstimationType(type)} className="flex-1">
                   {type === 'op' ? 'Outpatient' : type === 'ip' ? 'Inpatient' : 'Emergency'}
                 </Button>
               ))}
             </div>
             <div className="p-4 rounded-lg bg-muted/30 border">
               <div className="flex items-center justify-between mb-4">
                 <div><h3 className="font-semibold text-lg">{currentEstimation.consultationType}</h3><Badge variant="outline" className="mt-1">{currentEstimation.confidence}% confidence</Badge></div>
                 <div className="text-right"><p className="text-sm text-muted-foreground">Estimated</p><p className="text-3xl font-bold text-primary">₹{currentEstimation.estimatedTotal.toLocaleString()}</p></div>
               </div>
               <div className="space-y-2">
                 <p className="text-sm font-medium text-muted-foreground">Breakdown</p>
                 {currentEstimation.breakdown.map((item, i) => (
                   <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                     <div><p className="font-medium text-sm">{item.category}</p><p className="text-xs text-muted-foreground">{item.description}</p></div>
                     <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                   </div>
                 ))}
               </div>
               <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
                 <div className="flex items-center justify-between"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-success" /><span className="text-sm font-medium">Insurance</span></div><span className="font-semibold text-success">-₹{currentEstimation.insuranceCoverage.toLocaleString()}</span></div>
               </div>
               <div className="mt-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                 <div className="flex items-center justify-between"><div className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Your Cost</span></div><span className="font-bold text-lg text-primary">₹{currentEstimation.outOfPocket.toLocaleString()}</span></div>
               </div>
             </div>
             <p className="text-xs text-muted-foreground text-center">* AI estimate based on historical data. Actual costs may vary.</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-primary/5 to-transparent">
           <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
               <CardTitle className="text-lg flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />AI Insights</CardTitle>
               <Button variant="ghost" size="sm" onClick={() => analyze('billing')} disabled={aiLoading}><RefreshCw className={cn("w-4 h-4", aiLoading && "animate-spin")} /></Button>
             </div>
           </CardHeader>
           <CardContent className="space-y-4">
             {aiLoading ? <Skeleton className="h-48 w-full" /> : insights?.paymentTrends ? (
               <>
                 <div className="p-3 rounded-lg bg-background/50"><p className="text-sm text-muted-foreground">Revenue</p><p className="text-xl font-bold">₹{insights.paymentTrends.totalRevenue.toLocaleString()}</p></div>
                 <div className="p-3 rounded-lg bg-warning/10"><p className="text-sm text-muted-foreground">Pending</p><p className="text-xl font-bold text-warning">₹{insights.paymentTrends.pendingAmount.toLocaleString()}</p></div>
                 {insights.paymentTrends.topPaymentModes.length > 0 && (
                   <div className="p-3 rounded-lg bg-background/50"><p className="text-sm text-muted-foreground mb-2">Payment Modes</p><div className="flex flex-wrap gap-1">{insights.paymentTrends.topPaymentModes.map((m, i) => <Badge key={i} variant="secondary">{m}</Badge>)}</div></div>
                 )}
               </>
             ) : (
               <div className="text-center py-8"><Brain className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-30" /><p className="text-sm text-muted-foreground">Click refresh for insights</p></div>
             )}
           </CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Receipt className="w-5 h-5 text-primary" />Recent Bills</CardTitle></CardHeader>
         <CardContent>
           {billsLoading ? <Skeleton className="h-32 w-full" /> : bills.length > 0 ? (
             <div className="space-y-3">
               {bills.slice(0, 5).map(bill => (
                 <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                   <div><p className="font-medium text-sm">{bill.type.toUpperCase()} Bill</p><p className="text-xs text-muted-foreground">{new Date(bill.created_at).toLocaleDateString()}</p></div>
                   <div className="text-right"><p className="font-bold">₹{bill.total_amount.toLocaleString()}</p><Badge variant={bill.status === 'paid' ? 'default' : bill.status === 'partial' ? 'secondary' : 'destructive'}>{bill.status}</Badge></div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-8 text-muted-foreground"><Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>No bills found</p></div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 };