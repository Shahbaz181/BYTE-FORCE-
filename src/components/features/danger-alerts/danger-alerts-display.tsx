
"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getDangerZoneAlerts, type DangerZoneAlertsInput, type DangerZoneAlertsOutput } from '@/ai/flows/danger-zone-alerts';
import { MapPin, AlertTriangle, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { ShieldCheck } from 'lucide-react';


const dangerAlertsSchema = z.object({
  locationName: z.string().min(3, "Location name must be at least 3 characters.").max(100, "Location name cannot exceed 100 characters."),
});

type DangerAlertsFormData = z.infer<typeof dangerAlertsSchema>;

export function DangerAlertsDisplay() {
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<DangerZoneAlertsOutput['alerts'] | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors }, reset } = useForm<DangerAlertsFormData>({
    resolver: zodResolver(dangerAlertsSchema),
    defaultValues: {
      locationName: '', 
    },
  });

  const onSubmit = async (data: DangerAlertsFormData) => {
    setIsLoading(true);
    setAlerts(null);
    try {
      const result = await getDangerZoneAlerts(data as DangerZoneAlertsInput);
      if (result && result.alerts) {
        setAlerts(result.alerts);
        if (result.alerts.length === 0) {
            toast({ title: "No Danger Alerts", description: "No recent incidents reported in your specified area." });
        }
      } else {
        toast({ title: "Error", description: "Could not fetch alerts.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching danger alerts:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const severityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'medium': return 'bg-orange-100 border-orange-400 text-orange-700';
      case 'high': return 'bg-red-100 border-red-400 text-red-700';
      default: return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };


  return (
    <div className="space-y-6">
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center"><MapPin className="mr-2 h-6 w-6" /> Check Danger Zones</CardTitle>
            <CardDescription>Enter a location name (e.g., "City Park", "Downtown Plaza") to check for AI-powered community alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name</Label>
              <Controller
                name="locationName"
                control={control}
                render={({ field }) => <Input id="locationName" type="text" placeholder="e.g., Central Park, New York" {...field} />}
              />
              {errors.locationName && <p className="text-sm text-destructive">{errors.locationName.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
              Check for Alerts
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <div className="text-center py-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Fetching alerts...</p>
        </div>
      )}

      {alerts && alerts.length > 0 && (
        <Card className="w-full max-w-lg mx-auto shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-accent"><AlertTriangle className="mr-2 h-6 w-6" /> Nearby Danger Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Image 
              src="https://picsum.photos/seed/mapalerts/600/300" 
              alt="Map with danger zones" 
              width={600} 
              height={300} 
              className="w-full rounded-lg object-cover aspect-video"
              data-ai-hint="map danger" 
            />
            {alerts.map((alert, index) => (
              <Alert key={index} className={cn("border-2", severityColor(alert.severity))}>
                <AlertTriangle className={cn("h-5 w-5", severityColor(alert.severity).split(' ')[2])} /> {/* Ensure icon color matches text */}
                <AlertTitle className="font-semibold">{alert.location}</AlertTitle>
                <AlertDescription>
                  <p>{alert.description}</p>
                  <p className="mt-1 text-xs">Severity: <span className="font-medium uppercase">{alert.severity}</span></p>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
      
      {alerts && alerts.length === 0 && !isLoading && (
         <Card className="w-full max-w-lg mx-auto shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-primary"><ShieldCheck className="mr-2 h-6 w-6" /> All Clear!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">No significant danger alerts found for the specified location based on recent community reports.</p>
             <Image 
              src="https://picsum.photos/seed/mapsafe/600/300" 
              alt="Map showing safe area" 
              width={600} 
              height={300} 
              className="w-full rounded-lg object-cover aspect-video mt-4"
              data-ai-hint="map safe" 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
