
"use client";

import { useState, useEffect, useRef } from 'react';
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
  // audioDataUri is handled separately
});

type GuardianAngelFormData = z.infer<typeof guardianAngelSchema>;

export function GuardianAngelPanel() {
  const [isModeActive, setIsModeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeUserContextOutput | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  const { control, handleSubmit, formState: { errors }, reset } = useForm<GuardianAngelFormData>({
    resolver: zodResolver(guardianAngelSchema),
    defaultValues: {
      placeName: '',
      movementData: '',
    }
  });

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Adjust MIME type if needed
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            setAudioDataUri(reader.result as string);
            toast({ title: "Audio Recorded", description: "Audio captured for analysis.", duration: 2000 });
          };
        };
        mediaRecorderRef.current.start();
        toast({ title: "Recording Started", description: "Capturing audio for 5 seconds.", duration: 2000 });
        setTimeout(() => { // Simulate short recording for analysis
           if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
           }
        }, 5000);

      } catch (err) {
        console.error("Error accessing microphone:", err);
        toast({ title: "Microphone Error", description: "Could not access microphone. Please check permissions.", variant: "destructive" });
      }
    } else {
      toast({ title: "Unsupported", description: "Audio recording is not supported by your browser.", variant: "destructive" });
    }
  };

  const stopRecordingAndStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
  };
  
  useEffect(() => {
    // Cleanup: stop recording and stream when component unmounts or mode deactivates
    return () => {
      stopRecordingAndStream();
    };
  }, [audioStream]);


  const onSubmit = async (data: GuardianAngelFormData) => {
    if (!audioDataUri) {
      toast({ title: "Audio Required", description: "Please record audio before submitting for analysis.", variant: "destructive" });
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
        toast({ title: "Analysis Complete", description: "No immediate distress signals detected.", duration: 5000 });
      }
    } catch (error) {
      console.error("Error analyzing context:", error);
      toast({ title: "Analysis Error", description: "Could not complete analysis.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const activateMode = () => {
    setIsModeActive(true);
    setAnalysisResult(null); // Clear previous results
    setAudioDataUri(null); // Clear previous audio
    reset(); // Reset form fields
    toast({
      title: 'Guardian Angel Mode Activated',
      description: 'Please provide your current context for monitoring.',
    });
  };

  const deactivateMode = () => {
    setIsModeActive(false);
    setIsLoading(false);
    stopRecordingAndStream();
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
            <Label className="flex items-center"><Mic className="mr-2 h-5 w-5" /> Record Audio (5s)</Label>
            <Button type="button" variant="outline" onClick={startRecording} disabled={!!audioStream || isLoading} className="w-full">
                {audioStream ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
                {audioStream ? 'Recording...' : (audioDataUri ? 'Re-record Audio' : 'Start Recording')}
            </Button>
            {audioDataUri && <p className="text-xs text-green-600 text-center">Audio captured successfully.</p>}
          </div>

           {isLoading && (
            <div className="text-center py-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Analyzing context...</p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className={`mt-4 p-3 rounded-md border ${analysisResult.isDistressed ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-green-100 border-green-400 text-green-700'}`}>
              <h4 className="font-semibold flex items-center">
                {analysisResult.isDistressed && <AlertTriangle className="mr-2 h-5 w-5" />}
                Analysis Result:
              </h4>
              <p className="text-sm">{analysisResult.isDistressed ? `Distress Detected: ${analysisResult.reason}` : `No Distress Detected: ${analysisResult.reason || "All seems calm."}`}</p>
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

