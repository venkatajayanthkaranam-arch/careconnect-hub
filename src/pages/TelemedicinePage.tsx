import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MessageSquare,
  Clock,
  Calendar,
  User,
  Stethoscope,
  Send,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDoctors, useAppointments } from '@/hooks/useDashboardData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: Date;
}

export const TelemedicinePage: React.FC = () => {
  const { isPatient, patientRecord, employeeRole } = useAuth();
  const { data: doctors = [], isLoading: doctorsLoading } = useDoctors();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments(patientRecord?.id);

  // Video call state
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize local video stream
  const startLocalVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      toast.error('Could not access camera/microphone. Please check permissions.');
    }
  }, []);

  // Stop local video stream
  const stopLocalVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Start call
  const startCall = useCallback(async (doctor: any) => {
    setSelectedDoctor(doctor);
    await startLocalVideo();
    setIsInCall(true);
    toast.success(`Connecting to Dr. ${doctor.name}...`);
    
    // Simulate connection (in production, this would use WebRTC signaling)
    setTimeout(() => {
      toast.success('Call connected!');
    }, 2000);
  }, [startLocalVideo]);

  // End call
  const endCall = useCallback(() => {
    stopLocalVideo();
    setIsInCall(false);
    setSelectedDoctor(null);
    setShowChat(false);
    setChatMessages([]);
    toast.info('Call ended');
  }, [stopLocalVideo]);

  // Screen sharing (simplified)
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      stopLocalVideo();
      await startLocalVideo();
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        
        // Handle screen share stop
        screenStream.getVideoTracks()[0].onended = () => {
          startLocalVideo();
          setIsScreenSharing(false);
        };
      } catch (err) {
        console.error('Error sharing screen:', err);
        toast.error('Could not share screen');
      }
    }
  }, [isScreenSharing, startLocalVideo, stopLocalVideo]);

  // Send chat message
  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: isPatient ? 'patient' : 'doctor',
      message: newMessage,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate doctor response
    if (isPatient) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'doctor',
          message: 'Thank you for your message. I am reviewing your concern.',
          timestamp: new Date(),
        }]);
      }, 2000);
    }
  }, [newMessage, isPatient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalVideo();
    };
  }, [stopLocalVideo]);

  // Filter telemedicine appointments
  const teleAppointments = appointments.filter(a => 
    a.type === 'follow_up' && a.status === 'scheduled'
  );

  const isLoading = doctorsLoading || appointmentsLoading;

  // Video Call View
  if (isInCall) {
    return (
      <div className={cn(
        "flex flex-col h-full",
        isFullscreen && "fixed inset-0 z-50 bg-background"
      )}>
        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Main Video (Remote) */}
          <div className="lg:col-span-2 relative rounded-xl overflow-hidden bg-muted">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="text-3xl bg-primary/20">
                    {selectedDoctor?.name?.split(' ').map((n: string) => n[0]).join('') || 'DR'}
                  </AvatarFallback>
                </Avatar>
                <p className="text-lg font-medium">Dr. {selectedDoctor?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedDoctor?.specialization}</p>
                <Badge variant="outline" className="mt-2">
                  <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
                  Connected
                </Badge>
              </div>
            </div>
            
            {/* Doctor info overlay */}
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                <Stethoscope className="w-3 h-3 mr-1" />
                Dr. {selectedDoctor?.name}
              </Badge>
            </div>
          </div>

          {/* Sidebar - Local Video + Chat */}
          <div className="flex flex-col gap-4">
            {/* Local Video */}
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  !isVideoEnabled && "hidden"
                )}
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <VideoOff className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <Badge className="absolute bottom-2 left-2" variant="secondary">
                You
              </Badge>
            </div>

            {/* Chat Section */}
            {showChat && (
              <Card className="flex-1 flex flex-col">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-3 pt-0">
                  <div className="flex-1 overflow-y-auto space-y-2 mb-2 max-h-48">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={cn(
                          "p-2 rounded-lg text-sm max-w-[80%]",
                          msg.sender === 'patient'
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        )}
                      >
                        {msg.message}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={sendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={isAudioEnabled ? 'secondary' : 'destructive'}
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <Button
              variant={isVideoEnabled ? 'secondary' : 'destructive'}
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            <Button
              variant={isScreenSharing ? 'default' : 'secondary'}
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={toggleScreenShare}
            >
              <Monitor className="w-5 h-5" />
            </Button>
            <Button
              variant={showChat ? 'default' : 'secondary'}
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={endCall}
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Telemedicine Page
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="w-7 h-7 text-primary" />
            Telemedicine
          </h1>
          <p className="text-muted-foreground">
            {isPatient ? 'Connect with doctors from anywhere' : 'Manage virtual consultations'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Doctors */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Available Doctors</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
          ) : doctors.length > 0 ? (
            <div className="grid gap-4">
              {doctors.map(doctor => (
                <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">Dr. {doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {doctor.department.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              ₹{doctor.consultation_fee}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          className="gap-2" 
                          onClick={() => startCall(doctor)}
                        >
                          <Video className="w-4 h-4" />
                          Start Call
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowBookingDialog(true);
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Book Later
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No doctors available for telemedicine</p>
              <p className="text-sm text-muted-foreground mt-1">Please check back later or contact reception</p>
            </Card>
          )}
        </div>

        {/* Scheduled Consultations */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Upcoming Consultations</h2>
          {isLoading ? (
            <Skeleton className="h-48 rounded-lg" />
          ) : teleAppointments.length > 0 ? (
            <div className="space-y-3">
              {teleAppointments.slice(0, 5).map(appt => (
                <Card key={appt.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {appt.doctors?.name ? `Dr. ${appt.doctors.name}` : 'Doctor'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No upcoming consultations</p>
            </Card>
          )}

          {/* Quick Tips */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tips for Better Consultation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Ensure good lighting and stable internet</p>
              <p>• Have your medical records ready</p>
              <p>• Find a quiet, private space</p>
              <p>• Test your camera and mic beforehand</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Telemedicine Consultation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedDoctor && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar>
                  <AvatarFallback>
                    {selectedDoctor.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Dr. {selectedDoctor.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.specialization}</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Preferred Date</label>
              <Input type="date" className="mt-1" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="text-sm font-medium">Preferred Time</label>
              <Input type="time" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Reason for Consultation</label>
              <Textarea className="mt-1" placeholder="Describe your symptoms or concern..." />
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                toast.success('Consultation request submitted');
                setShowBookingDialog(false);
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Consultation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};