
"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { analyzeSituationText, type AnalyzeSituationTextInput, type AnalyzeSituationTextOutput } from '@/ai/flows/guardian-angel-mode';
import { Ear, Shield, Play, StopCircle, Loader2, AlertTriangle, MessageSquare } from 'lucide-react';
import Image from 'next/image';

const guardianAngelSchema = z.object({
  situationText: z.string().min(5, "Please describe your situation (minimum 5 characters).").max(1000, "Description is too long (max 1000 characters)."),
});

type GuardianAngelFormData = z.infer<typeof guardianAngelSchema>;

const GENERIC_SAFETY_TIPS = [
  "Stay aware of your surroundings at all times.",
  "Trust your instincts. If a situation or person makes you feel uneasy, remove yourself from the situation if possible.",
  "Keep your phone charged and easily accessible.",
  "When out alone, especially at night or in unfamiliar areas, share your live location with a trusted contact.",
  "If you think you are being followed, go to a public place, a store, or knock on a door for help."
];

export function GuardianAngelPanel() {
  const [isModeActive, setIsModeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSituationTextOutput | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors }, reset } = useForm<GuardianAngelFormData>({
    resolver: zodResolver(guardianAngelSchema),
    defaultValues: {
      situationText: '',
    }
  });

  const onSubmit = async (data: GuardianAngelFormData) => {
    setIsLoading(true);
    setAnalysisResult(null);
    const input: AnalyzeSituationTextInput = {
      situationText: data.situationText,
    };

    try {
      const result = await analyzeSituationText(input);
      setAnalysisResult(result);
      toast({ title: "Analysis Complete", description: "See below for assessment and tips.", duration: 5000 });
    } catch (error: any) {
      console.error("Error analyzing situation:", error);
      const errorMessage = error.message ? error.message : "Could not complete analysis.";
      toast({ title: "Analysis Error", description: errorMessage, variant: "destructive" });
      setAnalysisResult({ assessment: `Analysis failed: ${errorMessage}`, safetyTips: GENERIC_SAFETY_TIPS });
    } finally {
      setIsLoading(false);
    }
  };

  const activateMode = () => {
    setIsModeActive(true);
    setAnalysisResult(null);
    reset();
    toast({
      title: 'Guardian Angel Mode Activated',
      description: 'Describe your situation below for AI-powered advice.',
    });
  };

  const deactivateMode = () => {
    setIsModeActive(false);
    setIsLoading(false);
    setAnalysisResult(null);
    reset();
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
          <CardDescription>Feeling uneasy? Describe your situation, and our AI will provide an assessment and safety tips.</CardDescription>
        </CardHeader>
        <CardContent>
            <Image 
              src="https://picsum.photos/seed/guardianhelp/400/250" 
              alt="Illustration of a helping hand or supportive figure" 
              width={400} 
              height={250} 
              className="w-full rounded-lg object-cover aspect-video mb-4"
              data-ai-hint="support guidance" 
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
          <CardDescription>Describe your current situation or concerns below. Our AI will analyze it and provide safety tips.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="situationText" className="flex items-center"><MessageSquare className="mr-2 h-5 w-5" /> Describe Your Situation</Label>
            <Controller
              name="situationText"
              control={control}
              render={({ field }) => <Textarea id="situationText" placeholder="e.g., I'm walking alone and feel like someone is following me." {...field} rows={4} />}
            />
            {errors.situationText && <p className="text-sm text-destructive">{errors.situationText.message}</p>}
          </div>
          
           {isLoading && (
            <div className="text-center py-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Analyzing your situation...</p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className={`mt-4 p-4 rounded-md border ${analysisResult.assessment.toLowerCase().includes("failed") || analysisResult.assessment.toLowerCase().includes("error") ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-green-100 border-green-400 text-green-700'}`}>
              <h4 className="font-semibold flex items-center text-lg mb-2">
                {(analysisResult.assessment.toLowerCase().includes("failed") || analysisResult.assessment.toLowerCase().includes("error")) && <AlertTriangle className="mr-2 h-5 w-5" />}
                AI Assessment:
              </h4>
              <p className="text-sm mb-3">{analysisResult.assessment}</p>

              {(analysisResult.safetyTips && analysisResult.safetyTips.length > 0) && (
                <>
                  <h5 className="font-semibold text-md mt-3 mb-1">
                    Safety Tips:
                  </h5>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {analysisResult.safetyTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Shield className="mr-2 h-5 w-5" />}
            Analyze Situation
          </Button>
          <Button variant="outline" className="w-full" onClick={deactivateMode} disabled={isLoading}>
            <StopCircle className="mr-2 h-5 w-5" /> Deactivate Mode
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
