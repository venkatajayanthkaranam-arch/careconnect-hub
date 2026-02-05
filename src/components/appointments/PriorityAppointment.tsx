 import React, { useState } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Skeleton } from '@/components/ui/skeleton';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import {
   AlertTriangle,
   Calendar,
   Stethoscope,
   Activity,
   CheckCircle,
   ArrowUp,
   ArrowDown,
   Minus,
 } from 'lucide-react';
 import { useDoctors, useTodayAppointments } from '@/hooks/useDashboardData';
 import { toast } from 'sonner';
 import { cn } from '@/lib/utils';
 
 interface Symptom {
   name: string;
   severity: 'low' | 'medium' | 'high';
 }
 
 const COMMON_SYMPTOMS: Symptom[] = [
   { name: 'Chest Pain', severity: 'high' },
   { name: 'Difficulty Breathing', severity: 'high' },
   { name: 'Severe Headache', severity: 'high' },
   { name: 'High Fever (>103°F)', severity: 'high' },
   { name: 'Fever', severity: 'medium' },
   { name: 'Persistent Cough', severity: 'medium' },
   { name: 'Abdominal Pain', severity: 'medium' },
   { name: 'Joint Pain', severity: 'medium' },
   { name: 'Mild Headache', severity: 'low' },
   { name: 'Common Cold', severity: 'low' },
   { name: 'Skin Rash', severity: 'low' },
   { name: 'Follow-up Visit', severity: 'low' },
 ];
 
 const URGENCY_CONFIG = {
   emergency: { label: 'Emergency', color: 'destructive', icon: AlertTriangle, waitTime: 'Immediate' },
   urgent: { label: 'Urgent', color: 'warning', icon: ArrowUp, waitTime: '< 30 min' },
   normal: { label: 'Normal', color: 'secondary', icon: Minus, waitTime: '1-2 hours' },
   low: { label: 'Low Priority', color: 'outline', icon: ArrowDown, waitTime: '2+ hours' },
 } as const;
 
 type UrgencyLevel = keyof typeof URGENCY_CONFIG;
 
 export const PriorityAppointment: React.FC<{ onBook?: () => void }> = ({ onBook }) => {
   const { data: doctors = [], isLoading: doctorsLoading } = useDoctors();
   const { data: todayAppointments = [] } = useTodayAppointments();
 
   const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
   const [customSymptom, setCustomSymptom] = useState('');
   const [duration, setDuration] = useState('');
   const [additionalNotes, setAdditionalNotes] = useState('');
   const [selectedDoctor, setSelectedDoctor] = useState('');
   const [showConfirmation, setShowConfirmation] = useState(false);
   const [calculatedPriority, setCalculatedPriority] = useState<UrgencyLevel>('normal');
 
   const calculatePriority = (symptoms: string[]): UrgencyLevel => {
     const selected = COMMON_SYMPTOMS.filter(s => symptoms.includes(s.name));
     const hasHigh = selected.some(s => s.severity === 'high');
     const hasMedium = selected.some(s => s.severity === 'medium');
     if (hasHigh && symptoms.length >= 2) return 'emergency';
     if (hasHigh) return 'urgent';
     if (hasMedium && symptoms.length >= 3) return 'urgent';
     if (hasMedium) return 'normal';
     return 'low';
   };
 
   const toggleSymptom = (name: string) => {
     const newSymptoms = selectedSymptoms.includes(name)
       ? selectedSymptoms.filter(s => s !== name)
       : [...selectedSymptoms, name];
     setSelectedSymptoms(newSymptoms);
     setCalculatedPriority(calculatePriority(newSymptoms));
   };
 
   const addCustomSymptom = () => {
     if (customSymptom && !selectedSymptoms.includes(customSymptom)) {
       const newSymptoms = [...selectedSymptoms, customSymptom];
       setSelectedSymptoms(newSymptoms);
       setCalculatedPriority(calculatePriority(newSymptoms));
       setCustomSymptom('');
     }
   };
 
   const handleBook = () => {
     if (selectedSymptoms.length === 0) {
       toast.error('Please select at least one symptom');
       return;
     }
     setShowConfirmation(true);
   };
 
   const confirmBooking = () => {
     toast.success(`Priority appointment booked as ${URGENCY_CONFIG[calculatedPriority].label}`);
     setShowConfirmation(false);
     setSelectedSymptoms([]);
     setDuration('');
     setAdditionalNotes('');
     setSelectedDoctor('');
     onBook?.();
   };
 
   const priorityConfig = URGENCY_CONFIG[calculatedPriority];
   const queuePosition = todayAppointments.filter(a => a.status === 'scheduled' || a.status === 'waiting').length + 1;
 
   return (
     <div className="space-y-6">
       <Card>
         <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2">
             <Activity className="w-5 h-5 text-primary" />
             Select Your Symptoms
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
             {COMMON_SYMPTOMS.map(symptom => (
               <button
                 key={symptom.name}
                 onClick={() => toggleSymptom(symptom.name)}
                 className={cn(
                   "p-3 rounded-lg border text-left transition-all",
                   selectedSymptoms.includes(symptom.name)
                     ? symptom.severity === 'high' ? "bg-destructive/10 border-destructive"
                       : symptom.severity === 'medium' ? "bg-warning/10 border-warning"
                       : "bg-primary/10 border-primary"
                     : "bg-muted/30 hover:bg-muted/50"
                 )}
               >
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">{symptom.name}</span>
                   {selectedSymptoms.includes(symptom.name) && <CheckCircle className="w-4 h-4" />}
                 </div>
                 <Badge variant={symptom.severity === 'high' ? 'destructive' : symptom.severity === 'medium' ? 'secondary' : 'outline'} className="mt-1 text-xs">
                   {symptom.severity}
                 </Badge>
               </button>
             ))}
           </div>
 
           <div className="flex gap-2">
             <Input placeholder="Other symptom..." value={customSymptom} onChange={(e) => setCustomSymptom(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()} />
             <Button variant="outline" onClick={addCustomSymptom}>Add</Button>
           </div>
 
           <div>
             <Label>How long have you had these symptoms?</Label>
             <Select value={duration} onValueChange={setDuration}>
               <SelectTrigger className="mt-1"><SelectValue placeholder="Select duration" /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="today">Started today</SelectItem>
                 <SelectItem value="1-3days">1-3 days</SelectItem>
                 <SelectItem value="week">About a week</SelectItem>
                 <SelectItem value="weeks">2+ weeks</SelectItem>
               </SelectContent>
             </Select>
           </div>
 
           <div>
             <Label>Additional Notes (optional)</Label>
             <Textarea className="mt-1" placeholder="Any other information..." value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} />
           </div>
         </CardContent>
       </Card>
 
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className={cn("border-2", calculatedPriority === 'emergency' && "border-destructive bg-destructive/5", calculatedPriority === 'urgent' && "border-warning bg-warning/5")}>
           <CardHeader className="pb-2">
             <CardTitle className="text-lg flex items-center gap-2">
               <priorityConfig.icon className="w-5 h-5" />
               Priority Assessment
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="text-center py-4">
               <Badge variant={priorityConfig.color as any} className="text-lg px-4 py-2">{priorityConfig.label}</Badge>
               <p className="text-sm text-muted-foreground mt-2">Wait time: <strong>{priorityConfig.waitTime}</strong></p>
             </div>
             {selectedSymptoms.length > 0 && (
               <div className="p-3 rounded-lg bg-muted/50">
                 <p className="text-sm font-medium mb-2">Selected:</p>
                 <div className="flex flex-wrap gap-1">
                   {selectedSymptoms.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                 </div>
               </div>
             )}
           </CardContent>
         </Card>
 
         <Card className="lg:col-span-2">
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
               <Stethoscope className="w-5 h-5 text-primary" />
               Available Doctors
             </CardTitle>
           </CardHeader>
           <CardContent>
             {doctorsLoading ? <Skeleton className="h-48 w-full" /> : doctors.length > 0 ? (
               <div className="space-y-3">
                 {doctors.map(doctor => (
                   <button key={doctor.id} onClick={() => setSelectedDoctor(doctor.id)} className={cn("w-full p-4 rounded-lg border text-left transition-all", selectedDoctor === doctor.id ? "bg-primary/10 border-primary" : "bg-muted/30 hover:bg-muted/50")}>
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="font-medium">Dr. {doctor.name}</p>
                         <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                         <Badge variant="secondary" className="text-xs mt-1">₹{doctor.consultation_fee}</Badge>
                       </div>
                       {selectedDoctor === doctor.id && <CheckCircle className="w-5 h-5 text-primary" />}
                     </div>
                   </button>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-muted-foreground">
                 <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-30" />
                 <p>No doctors available</p>
               </div>
             )}
           </CardContent>
         </Card>
       </div>
 
       <div className="flex justify-end">
         <Button size="lg" onClick={handleBook} disabled={selectedSymptoms.length === 0} className={cn(calculatedPriority === 'emergency' && "bg-destructive hover:bg-destructive/90")}>
           <Calendar className="w-4 h-4 mr-2" />
           Book {priorityConfig.label} Appointment
         </Button>
       </div>
 
       <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
         <DialogContent>
           <DialogHeader><DialogTitle>Confirm Appointment</DialogTitle></DialogHeader>
           <div className="space-y-4 mt-4">
             <div className="p-4 rounded-lg bg-muted/50">
               <div className="flex justify-between mb-2"><span className="text-sm text-muted-foreground">Priority</span><Badge variant={priorityConfig.color as any}>{priorityConfig.label}</Badge></div>
               <div className="flex justify-between mb-2"><span className="text-sm text-muted-foreground">Queue</span><span className="font-medium">#{queuePosition}</span></div>
               <div className="flex justify-between"><span className="text-sm text-muted-foreground">Wait Time</span><span className="font-medium">{priorityConfig.waitTime}</span></div>
             </div>
             {selectedDoctor && <div className="p-4 rounded-lg bg-primary/10"><p className="text-sm text-muted-foreground mb-1">Doctor</p><p className="font-medium">Dr. {doctors.find(d => d.id === selectedDoctor)?.name}</p></div>}
             {calculatedPriority === 'emergency' && <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"><div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /><p className="text-sm font-medium text-destructive">Emergency - You will be seen immediately</p></div></div>}
             <Button className="w-full" onClick={confirmBooking}>Confirm Booking</Button>
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 };