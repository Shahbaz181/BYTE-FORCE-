"use client";

import { useState } from "react";
import { Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function SOSButtonFAB() {
  const { toast } = useToast();
  const [isSilent, setIsSilent] = useState(false);

  const handleSOS = () => {
    // Simulate SOS action
    // 1. Get current location (mocked for now)
    const currentLocation = { lat: 34.0522, lon: -118.2437 };

    // 2. Record 10-second audio (mocked)
    const audioClip = "simulated_audio_clip.mp3";

    // 3. Send alert to guardians
    const messageToGuardians = `Emergency! Current location: ${currentLocation.lat}, ${currentLocation.lon}. Audio: ${audioClip}`;
    
    toast({
      title: isSilent ? "Silent SOS Activated" : "SOS Activated!",
      description: isSilent ? "Alerts sent discreetly." : "Emergency alerts sent to guardians. Siren and (simulated) flashlight activated.",
      variant: "destructive",
      duration: 5000,
    });

    if (!isSilent) {
      // Simulate siren
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Volume
        oscillator.start();
        setTimeout(() => oscillator.stop(), 1000); // Play for 1 second
      }
    }
    // Simulate auto-call (not possible in browser, show toast)
    setTimeout(() => {
       toast({
        title: "Simulating Call",
        description: "Connecting to nearest emergency service...",
        duration: 3000,
      });
    }, 1500);


    console.log("SOS Activated:", messageToGuardians, "Silent Mode:", isSilent);
    // Reset silent mode if needed, or keep user preference
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl z-50 animate-pulse"
          aria-label="Emergency SOS"
        >
          <Siren className="h-8 w-8" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Activate Emergency SOS?</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately send an alert with your location and a short audio clip to your trusted guardians.
            {isSilent && " (Silent Mode: No siren will sound on your device.)"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 my-4">
            <input type="checkbox" id="silentMode" checked={isSilent} onChange={(e) => setIsSilent(e.target.checked)} className="form-checkbox h-5 w-5 text-accent focus:ring-accent border-gray-300 rounded" />
            <label htmlFor="silentMode" className="text-sm text-muted-foreground">
              Activate in Silent Mode (no local siren/strobe)
            </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSOS} className="bg-destructive hover:bg-destructive/90">
            Confirm SOS
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
