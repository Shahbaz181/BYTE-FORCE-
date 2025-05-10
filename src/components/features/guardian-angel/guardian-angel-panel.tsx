
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { analyzeUserContext, type AnalyzeUserContextInput, type AnalyzeUserContextOutput } from '@/ai/flows/guardian-angel-mode';
import { Ear, MapPin, TrendingUp, Shield, Play, StopCircle, Mic, Loader2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

const guardianAngelSchema = z.object({
  placeName: z.string().min(3, "Place name must be at least 3 characters.").max(100, "Place name cannot exceed 100 characters."),
  movementData: z.string().min(3, "Describe movement briefly, e.g., 'walking fast', 'stationary'.").max(100),
});

type GuardianAngelFormData = z.infer<typeof guardianAngelSchema>;

const GENERIC_SAFETY_TIPS = [
  "Stay aware of your surroundings at all times.",
  "Trust your instincts. If a situation or person makes you feel uneasy, remove yourself from the situation if possible.",
  "Keep your phone charged and easily accessible.",
  "When out alone, especially at night or in unfamiliar areas, share your live location with a trusted contact.",
  "Avoid poorly lit or deserted areas. Stick to well-traveled routes.",
  "If you think you are being followed, go to a public place, a store, or knock on a door for help."
];


export function GuardianAngelPanel() {
  const [isModeActive, setIsModeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeUserContextOutput | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const { control, handleSubmit, formState: { errors }, reset } = useForm<GuardianAngelFormData>({
    resolver: zodResolver(guardianAngelSchema),
    defaultValues: {
      placeName: '',
      movementData: '',
    }
  });

  const stopRecordingAndStream = useCallback(() => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); 
    }
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    // Optionally, fully reset recorder and chunks here if necessary
    // mediaRecorderRef.current = null;
    // audioChunksRef.current = [];
  }, [audioStream]);


  useEffect(() => {
    return () => {
      stopRecordingAndStream();
    };
  }, [stopRecordingAndStream]);


  const startRecording = async () => {
    if (audioStream || (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording")) {
      toast({ title: "Recording Active", description: "A recording is already in progress or microphone is active.", variant: "default" });
      return;
    }

    // Reset previous audio data states
    setAudioDataUri(null);
    audioChunksRef.current = [];
    setAnalysisResult(null); // Clear previous analysis results

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream); // Indicates recording process has started

        const optionsAudioWebMOpus = { mimeType: 'audio/webm;codecs=opus' };
        const optionsAudioWebM = { mimeType: 'audio/webm' };
        let recorder;

        if (MediaRecorder.isTypeSupported(optionsAudioWebMOpus.mimeType)) {
            recorder = new MediaRecorder(stream, optionsAudioWebMOpus);
        } else if (MediaRecorder.isTypeSupported(optionsAudioWebM.mimeType)) {
            recorder = new MediaRecorder(stream, optionsAudioWebM);
            console.warn("audio/webm;codecs=opus not supported, using default audio/webm.");
        } else {
            toast({ title: "Unsupported Format", description: "Audio/webm recording is not supported by your browser.", variant: "destructive" });
            stream.getTracks().forEach(track => track.stop());
            setAudioStream(null);
            return;
        }
        
        mediaRecorderRef.current = recorder;

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          if (audioChunksRef.current.length === 0) {
            console.warn("Audio recording stopped with no data chunks.");
            setAudioDataUri(null);
            toast({ title: "Recording Issue", description: "No audio data was captured. Microphone might not be recording sound. Please check mic and try again.", variant: "destructive", duration: 4000 });
          } else {
            const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
              const resultDataUri = reader.result as string;
              if (resultDataUri && resultDataUri.split(',')[1]?.length > 0) {
                  setAudioDataUri(resultDataUri);
                  toast({ title: "Audio Recorded", description: "Audio captured successfully for analysis.", duration: 2000 });
              } else {
                  setAudioDataUri(null);
                  toast({ title: "Recording Error", description: "Recorded audio was empty or corrupted. Please try re-recording.", variant: "destructive", duration: 4000 });
              }
            };
            reader.onerror = () => {
                setAudioDataUri(null);
                toast({ title: "File Reading Error", description: "Could not process the recorded audio. Please try again.", variant: "destructive", duration: 3000 });
            };
          }
          // Cleanup stream tracks and state, done after processing
          stream.getTracks().forEach(track => track.stop());
          setAudioStream(null); 
          if (recordingTimeoutRef.current) { 
            clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
          }
        };
        
        mediaRecorderRef.current.start();
        toast({ title: "Recording Started", description: "Capturing audio for 5 seconds...", duration: 2000 });
        
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
        }
        recordingTimeoutRef.current = setTimeout(() => {
           if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
           }
        }, 5000);

      } catch (err: any) {
        console.error("Error accessing microphone:", err.name, err.message);
        let description = "Could not access microphone. Please check permissions.";
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            description = "Microphone access denied. Please enable it in your browser settings.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            description = "No microphone found. Please ensure a microphone is connected and enabled.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError" || err.name === "OverconstrainedError") {
            description = "Microphone is already in use, cannot be accessed, or does not support required constraints. Please check other apps or browser tabs, or try a different microphone.";
        } else if (err.name === "AbortError") {
             description = "Microphone access was aborted. This can happen if another device request took precedence.";
        }
        toast({ title: "Microphone Error", description, variant: "destructive", duration: 5000 });
        setAudioStream(null);
      }
    } else {
      toast({ title: "Unsupported Browser", description: "Audio recording (getUserMedia) is not supported by your browser.", variant: "destructive" });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); 
      // onstop will handle toasts and state changes like setAudioStream(null)
    } else {
        toast({ title: "Not Recording", description: "There is no active recording to stop.", duration: 2000});
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  const onSubmit = async (data: GuardianAngelFormData) => {
    if (!audioDataUri) {
      toast({ title: "Audio Required", description: "Please record audio before submitting for analysis.", variant: "destructive" });
      return;
    }
     if (audioDataUri.split(',')[1]?.length === 0) {
      toast({ title: "Empty Audio", description: "The recorded audio is empty or invalid. Please re-record.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    const input: AnalyzeUserContextInput = {
      placeName: data.placeName,
      movementData: data.movementData,
      audioDataUri,
    };

    try {
      const result = await analyzeUserContext(input);
      setAnalysisResult(result);
      if (result.isDistressed) {
        toast({ title: "Distress Detected!", description: result.reason, variant: "destructive", duration: 7000 });
      } else {
        toast({ title: "Analysis Complete", description: result.reason || "No immediate distress signals detected.", duration: 5000 });
      }
    } catch (error: any) {
      console.error("Error analyzing context:", error);
      const errorMessage = error.message ? error.message : "Could not complete analysis.";
      toast({ title: "Analysis Error", description: errorMessage, variant: "destructive" });
      // Ensure analysisResult is set to a non-distressed state on error to avoid misleading UI
      setAnalysisResult({isDistressed: false, reason: `Analysis failed: ${errorMessage}`, safetyTips: GENERIC_SAFETY_TIPS});
    } finally {
      setIsLoading(false);
    }
  };

  const activateMode = () => {
    setIsModeActive(true);
    setAnalysisResult(null); 
    setAudioDataUri(null); 
    audioChunksRef.current = [];
    reset(); 
    toast({
      title: 'Guardian Angel Mode Activated',
      description: 'Please provide your current context for monitoring.',
    });
  };

  const deactivateMode = () => {
    setIsModeActive(false);
    setIsLoading(false);
    stopRecordingAndStream(); // This will stop recording and cleanup
    setAudioDataUri(null);
    setAnalysisResult(null);
    audioChunksRef.current = [];
    toast({
      title: 'Guardian Angel Mode Deactivated',
    });
  };

  if (!isModeActive) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <Ear className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4">Guardian Angel Mode</CardTitle>
          <CardDescription>Activate this mode if you feel unsafe. It will monitor your context using AI to detect potential distress.</CardDescription>
        </CardHeader>
        <CardContent>
            <Image 
              src="https://picsum.photos/seed/guardianangel/400/250" 
              alt="Illustration of a guardian angel or protective shield" 
              width={400} 
              height={250} 
              className="w-full rounded-lg object-cover aspect-video mb-4"
              data-ai-hint="protection safety" 
            />
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={activateMode}>
            <Play className="mr-2 h-5 w-5" /> Activate Guardian Angel Mode
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="flex items-center text-primary"><Shield className="mr-2 h-6 w-6" /> Guardian Angel Mode Active</CardTitle>
          <CardDescription>Provide your current context. Audio will be recorded briefly for analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="placeName" className="flex items-center"><MapPin className="mr-2 h-5 w-5" /> Location Name</Label>
            <Controller
              name="placeName"
              control={control}
              render={({ field }) => <Input id="placeName" type="text" placeholder="e.g., City Park, near the fountain" {...field} />}
            />
            {errors.placeName && <p className="text-sm text-destructive">{errors.placeName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="movementData" className="flex items-center"><TrendingUp className="mr-2 h-5 w-5" /> Movement Data / Description</Label>
            <Controller
              name="movementData"
              control={control}
              render={({ field }) => <Textarea id="movementData" placeholder="e.g., Walking quickly down Elm Street, feeling followed." {...field} />}
            />
            {errors.movementData && <p className="text-sm text-destructive">{errors.movementData.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center"><Mic className="mr-2 h-5 w-5" /> Record Audio (Max 5s)</Label>
            <div className="flex space-x-2">
              {!audioStream ? ( // If not currently streaming (i.e. recording actively)
                <Button type="button" variant="outline" onClick={startRecording} disabled={isLoading} className="flex-grow">
                  <Mic className="mr-2 h-4 w-4" />
                  {audioDataUri ? 'Re-record Audio' : 'Start Recording'}
                </Button>
              ) : ( // If audioStream exists, means recording is active
                <Button type="button" variant="destructive" onClick={handleStopRecording} disabled={isLoading} className="flex-grow">
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Recording
                </Button>
              )}
            </div>
            {audioStream && <p className="text-xs text-center text-primary animate-pulse">Recording in progress...</p>}
            {audioDataUri && !audioStream && <p className="text-xs text-green-600 text-center">Audio captured. Ready for analysis.</p>}
            {!audioDataUri && !audioStream && 
              (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive" && audioChunksRef.current.length === 0 ? 
                <p className="text-xs text-muted-foreground text-center">Recording may have failed or captured no data. Try again.</p> : 
                <p className="text-xs text-muted-foreground text-center">Ready to record.</p>)
            }
          </div>

           {isLoading && (
            <div className="text-center py-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Analyzing context...</p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className={`mt-4 p-4 rounded-md border ${analysisResult.isDistressed ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-green-100 border-green-400 text-green-700'}`}>
              <h4 className="font-semibold flex items-center text-lg mb-2">
                {analysisResult.isDistressed && <AlertTriangle className="mr-2 h-5 w-5" />}
                Analysis Result:
              </h4>
              <p className="text-sm mb-3">{analysisResult.reason || (analysisResult.isDistressed ? "Distress detected." : "No immediate distress signals detected.")}</p>

              {(() => {
                const analysisFailed = analysisResult.reason && (analysisResult.reason.toLowerCase().includes("analysis failed") || analysisResult.reason.toLowerCase().includes("audio data was considered invalid"));
                const tipsToDisplay = (analysisResult.safetyTips && analysisResult.safetyTips.length > 0)
                  ? analysisResult.safetyTips
                  : (analysisFailed || analysisResult.isDistressed === false) ? GENERIC_SAFETY_TIPS : null;

                if (tipsToDisplay && tipsToDisplay.length > 0) {
                  return (
                    <>
                      <h5 className="font-semibold text-md mt-3 mb-1">
                        { (analysisResult.safetyTips && analysisResult.safetyTips.length > 0 && !analysisFailed) ? "Personalized Safety Tips:" : "General Safety Tips:"}
                      </h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {tipsToDisplay.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </>
                  );
                }
                return null;
              })()}
            </div>
          )}

        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || !audioDataUri}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Shield className="mr-2 h-5 w-5" />}
            Analyze My Context
          </Button>
          <Button variant="outline" className="w-full" onClick={deactivateMode} disabled={isLoading}>
            <StopCircle className="mr-2 h-5 w-5" /> Deactivate Mode
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

