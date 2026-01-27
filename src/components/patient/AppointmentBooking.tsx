import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  mockDoctors, 
  departmentLabels, 
  commonSymptoms 
} from '@/data/mockData';
import type { 
  Department, 
  SeverityLevel, 
  RiskLevel,
  Doctor
} from '@/types/hospital';
import { symptomDepartmentMap } from '@/types/hospital';
import { cn } from '@/lib/utils';

interface AppointmentBookingProps {
  onBack: () => void;
}

type BookingStep = 'symptoms' | 'doctor' | 'schedule' | 'confirm';

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ onBack }) => {
  const { patientRecord } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('symptoms');
  
  // Symptom form state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('low');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Doctor selection state
  const [selectedDepartment, setSelectedDepartment] = useState<Department | ''>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [useSmartSuggestion, setUseSmartSuggestion] = useState(true);
  
  // Schedule state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');

  // Calculate risk level based on symptoms and severity
  const calculateRiskLevel = (): RiskLevel => {
    const highRiskSymptoms = ['chest pain', 'shortness of breath', 'severe headache', 'fainting'];
    const hasHighRiskSymptom = selectedSymptoms.some(s => 
      highRiskSymptoms.some(hrs => s.toLowerCase().includes(hrs))
    );
    
    if (hasHighRiskSymptom || severity === 'high') return 'high';
    if (severity === 'medium') return 'medium';
    return 'low';
  };

  // Smart department suggestions based on symptoms
  const suggestedDepartments = useMemo(() => {
    const depts = new Set<Department>();
    selectedSymptoms.forEach(symptom => {
      const symptomLower = symptom.toLowerCase();
      Object.entries(symptomDepartmentMap).forEach(([key, values]) => {
        if (symptomLower.includes(key.toLowerCase())) {
          values.forEach(dept => depts.add(dept));
        }
      });
    });
    // If no specific match, suggest general medicine
    if (depts.size === 0) depts.add('general_medicine');
    return Array.from(depts);
  }, [selectedSymptoms]);

  // Filter doctors by department
  const availableDoctors = useMemo(() => {
    if (!selectedDepartment) return mockDoctors;
    return mockDoctors.filter(d => d.department === selectedDepartment);
  }, [selectedDepartment]);

  // Get available time slots for selected doctor and date
  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    const dayName = format(selectedDate, 'EEEE').toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    const availability = selectedDoctor.availability.find(a => a.day === dayName);
    return availability?.slots || [];
  }, [selectedDoctor, selectedDate]);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAddCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'symptoms') {
      if (selectedSymptoms.length === 0) {
        toast.error('Please select at least one symptom');
        return;
      }
      setCurrentStep('doctor');
      // Auto-select first suggested department
      if (useSmartSuggestion && suggestedDepartments.length > 0) {
        setSelectedDepartment(suggestedDepartments[0]);
      }
    } else if (currentStep === 'doctor') {
      if (!selectedDoctor) {
        toast.error('Please select a doctor');
        return;
      }
      setCurrentStep('schedule');
    } else if (currentStep === 'schedule') {
      if (!selectedDate || !selectedTime) {
        toast.error('Please select date and time');
        return;
      }
      setCurrentStep('confirm');
    }
  };

  const handleBookAppointment = () => {
    const riskLevel = calculateRiskLevel();
    toast.success(
      `Appointment booked successfully! Risk Level: ${riskLevel.toUpperCase()}`,
      { description: `Your appointment is scheduled for ${format(selectedDate!, 'MMM dd, yyyy')} at ${selectedTime}` }
    );
    onBack();
  };

  const riskLevel = calculateRiskLevel();
  const riskColors = {
    low: 'text-success bg-success/10 border-success/20',
    medium: 'text-warning bg-warning/10 border-warning/20',
    high: 'text-critical bg-critical/10 border-critical/20',
  };

  const steps = [
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'doctor', label: 'Doctor' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'confirm', label: 'Confirm' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Book Appointment</h1>
          <p className="text-muted-foreground">Smart booking with symptom-based prioritization</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-card rounded-lg border border-border p-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep === step.id 
                  ? "bg-primary text-primary-foreground" 
                  : steps.findIndex(s => s.id === currentStep) > index
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
              )}>
                {steps.findIndex(s => s.id === currentStep) > index ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn(
                "text-sm font-medium hidden sm:inline",
                currentStep === step.id ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-muted mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-lg border border-border p-6">
        {/* Step 1: Symptoms */}
        {currentStep === 'symptoms' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">What symptoms are you experiencing?</h2>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => handleSymptomToggle(symptom)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-colors",
                      selectedSymptoms.includes(symptom)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary"
                    )}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add other symptom..."
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSymptom()}
              />
              <Button variant="outline" onClick={handleAddCustomSymptom}>Add</Button>
            </div>

            {selectedSymptoms.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  {selectedSymptoms.map(symptom => (
                    <span key={symptom} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      {symptom}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>How long have you had these symptoms?</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less_than_day">Less than a day</SelectItem>
                        <SelectItem value="1-3_days">1-3 days</SelectItem>
                        <SelectItem value="3-7_days">3-7 days</SelectItem>
                        <SelectItem value="1-2_weeks">1-2 weeks</SelectItem>
                        <SelectItem value="more_than_2_weeks">More than 2 weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>How severe are your symptoms?</Label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as SeverityLevel[]).map(level => (
                        <button
                          key={level}
                          onClick={() => setSeverity(level)}
                          className={cn(
                            "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors capitalize",
                            severity === level
                              ? level === 'low' 
                                ? "bg-success/10 border-success text-success"
                                : level === 'medium'
                                  ? "bg-warning/10 border-warning text-warning"
                                  : "bg-critical/10 border-critical text-critical"
                              : "border-border hover:border-primary"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional notes (optional)</Label>
                  <Textarea 
                    placeholder="Any other information you'd like to share..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Risk Level Indicator */}
                <div className={cn(
                  "p-4 rounded-lg border flex items-center gap-3",
                  riskColors[riskLevel]
                )}>
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Risk Level: {riskLevel.toUpperCase()}</p>
                    <p className="text-sm opacity-80">
                      {riskLevel === 'high' 
                        ? 'Your symptoms indicate urgent attention may be needed'
                        : riskLevel === 'medium'
                          ? 'Please schedule an appointment soon'
                          : 'Non-urgent, schedule at your convenience'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Doctor Selection */}
        {currentStep === 'doctor' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Select Doctor</h2>
            </div>

            {suggestedDepartments.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Based on your symptoms, we recommend:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedDepartments.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDepartment(dept)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm border transition-colors",
                        selectedDepartment === dept
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-primary/50 text-primary hover:bg-primary/10"
                      )}
                    >
                      {departmentLabels[dept]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Or choose department manually</Label>
              <Select value={selectedDepartment} onValueChange={(v) => setSelectedDepartment(v as Department)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(departmentLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDepartment && (
              <div className="space-y-3">
                <Label>Available Doctors</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableDoctors.map(doctor => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-colors",
                        selectedDoctor?.id === doctor.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                          <p className="text-sm text-primary mt-1">₹{doctor.consultationFee}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Schedule */}
        {currentStep === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Select Date & Time</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>

              <div>
                <Label className="mb-2 block">Available Time Slots</Label>
                {selectedDate ? (
                  availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={cn(
                            "p-2 rounded-lg border text-sm font-medium transition-colors",
                            selectedTime === slot
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No slots available on this day. Please select another date.
                    </p>
                  )
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Please select a date to see available slots
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 'confirm' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-success" />
              <h2 className="text-lg font-semibold">Confirm Appointment</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">{patientRecord?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-medium">{patientRecord?.id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{selectedDoctor?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedDepartment && departmentLabels[selectedDepartment]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedDate && format(selectedDate, 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consultation Fee</p>
                  <p className="font-medium">₹{selectedDoctor?.consultationFee}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <span className={cn(
                    "inline-flex px-2 py-1 rounded text-sm font-medium capitalize",
                    riskColors[riskLevel]
                  )}>
                    {riskLevel}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map(s => (
                    <span key={s} className="bg-background px-2 py-1 rounded text-sm">{s}</span>
                  ))}
                </div>
                {additionalNotes && (
                  <p className="text-sm mt-2">{additionalNotes}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              if (currentStep === 'symptoms') onBack();
              else if (currentStep === 'doctor') setCurrentStep('symptoms');
              else if (currentStep === 'schedule') setCurrentStep('doctor');
              else setCurrentStep('schedule');
            }}
          >
            {currentStep === 'symptoms' ? 'Cancel' : 'Back'}
          </Button>
          
          {currentStep === 'confirm' ? (
            <Button variant="medical" onClick={handleBookAppointment}>
              Confirm Booking
            </Button>
          ) : (
            <Button variant="medical" onClick={handleNextStep}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
