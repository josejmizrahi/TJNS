import * as React from 'react'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Calendar, Clock, Video } from "lucide-react"

interface TimeSlot {
  id: string;
  date: Date;
  available: boolean;
}

interface VideoVerificationProps {
  onSchedule: (slotId: string) => Promise<void>;
  availableSlots: TimeSlot[];
}

export function VideoVerification({ onSchedule, availableSlots }: VideoVerificationProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [status, setStatus] = useState<'selecting' | 'scheduling' | 'scheduled'>('selecting');

  const handleSchedule = async () => {
    if (!selectedSlot) return;
    
    try {
      setStatus('scheduling');
      await onSchedule(selectedSlot);
      setStatus('scheduled');
    } catch (error) {
      setStatus('selecting');
      // Handle error
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="text-blue-500" />
          <CardTitle>Video Verification</CardTitle>
        </div>
        <CardDescription>Schedule a video call for identity verification</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {status === 'selecting' && (
            <div className="grid gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedSlot === slot.id ? "default" : "outline"}
                  className={`w-full justify-start ${!slot.available ? 'opacity-50' : ''}`}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {slot.date.toLocaleDateString()} 
                    </span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>
                      {slot.date.toLocaleTimeString()}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {status === 'scheduling' && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
            </div>
          )}

          {status === 'scheduled' && (
            <div className="text-center space-y-2">
              <Video className="w-8 h-8 text-green-500 mx-auto" />
              <p className="font-medium">Video call scheduled!</p>
              <p className="text-sm text-gray-500">
                You will receive an email with the call details
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {status === 'selecting' && (
          <Button
            onClick={handleSchedule}
            disabled={!selectedSlot}
            className="w-full"
          >
            Schedule Video Call
          </Button>
        )}
        {status === 'scheduled' && (
          <Button
            variant="outline"
            onClick={() => setStatus('selecting')}
            className="w-full"
          >
            Schedule Another Call
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
