"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, Users, Play, StopCircle } from 'lucide-react';

const guardians = [
  { id: '1', name: 'Mom' },
  { id: '2', name: 'Alex (Friend)' },
  { id: '3', name: 'Partner' },
];

const shareDurations = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '240', label: '4 hours' },
  { value: 'custom', label: 'Custom' },
];

const locationShareSchema = z.object({
  selectedGuardians: z.array(z.string()).min(1, "Select at least one guardian."),
  duration: z.string().min(1, "Select a duration."),
  customDurationMinutes: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive("Custom duration must be positive.").optional()
  ),
}).refine(data => {
  if (data.duration === 'custom' && (data.customDurationMinutes === undefined || data.customDurationMinutes <=0)) {
    return false;
  }
  return true;
}, {
  message: "Please enter a valid custom duration.",
  path: ["customDurationMinutes"],
});

type LocationShareFormData = z.infer<typeof locationShareSchema>;

export function LocationShareCard() {
  const [isSharing, setIsSharing] = useState(false);
  const [sharingDetails, setSharingDetails] = useState<LocationShareFormData | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, watch, formState: { errors }, setValue } = useForm<LocationShareFormData>({
    resolver: zodResolver(locationShareSchema),
    defaultValues: {
      selectedGuardians: [],
      duration: '30',
    },
  });

  const selectedDuration = watch('duration');

  const onSubmit = (data: LocationShareFormData) => {
    setIsSharing(true);
    setSharingDetails(data);
    const durationLabel = data.duration === 'custom' 
      ? `${data.customDurationMinutes} minutes` 
      : shareDurations.find(d => d.value === data.duration)?.label;
    
    toast({
      title: 'Location Sharing Started!',
      description: `Your location is now being shared with ${data.selectedGuardians.length} guardian(s) for ${durationLabel}.`,
      duration: 5000,
    });
    // Here you would typically initiate actual location sharing logic
    console.log('Location sharing started:', data);
  };

  const stopSharing = () => {
    setIsSharing(false);
    setSharingDetails(null);
    toast({
      title: 'Location Sharing Stopped',
      description: 'You are no longer sharing your location.',
      duration: 3000,
    });
  };

  if (isSharing && sharingDetails) {
    const durationLabel = sharingDetails.duration === 'custom' 
      ? `${sharingDetails.customDurationMinutes} minutes` 
      : shareDurations.find(d => d.value === sharingDetails.duration)?.label;

    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-primary"><MapPin className="mr-2 h-6 w-6" /> Location Sharing Active</CardTitle>
          <CardDescription>Your location is currently being shared.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Shared with:</Label>
            <p className="text-sm text-muted-foreground">
              {sharingDetails.selectedGuardians.map(id => guardians.find(g => g.id === id)?.name).join(', ')}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium">Duration:</Label>
            <p className="text-sm text-muted-foreground">{durationLabel}</p>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-2">GPS accuracy: Street-level detail (Simulated)</p>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" className="w-full" onClick={stopSharing}>
            <StopCircle className="mr-2 h-5 w-5" /> Stop Sharing
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="flex items-center"><MapPin className="mr-2 h-6 w-6" /> Share Your Location</CardTitle>
          <CardDescription>Choose trusted contacts and how long to share your live location.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guardians" className="flex items-center"><Users className="mr-2 h-5 w-5" /> Select Guardians (up to 5)</Label>
            <div className="space-y-2">
              {guardians.map((guardian) => (
                <Controller
                  key={guardian.id}
                  name="selectedGuardians"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-md border p-3">
                       <Label htmlFor={`guardian-${guardian.id}`} className="font-normal">{guardian.name}</Label>
                      <Switch
                        id={`guardian-${guardian.id}`}
                        checked={field.value.includes(guardian.id)}
                        onCheckedChange={(checked) => {
                          const currentSelection = field.value || [];
                          if (checked) {
                            if (currentSelection.length < 5) {
                              setValue("selectedGuardians", [...currentSelection, guardian.id]);
                            } else {
                               toast({ title: "Limit Reached", description: "You can select up to 5 guardians.", variant: "destructive"});
                               // Revert the switch state manually as onCheckedChange doesn't automatically prevent it
                               // This requires a more complex setup to prevent the switch from visually changing
                               // For now, relying on toast and user to correct. A better UX would disable other switches.
                            }
                          } else {
                            setValue("selectedGuardians", currentSelection.filter((id) => id !== guardian.id));
                          }
                        }}
                      />
                    </div>
                  )}
                />
              ))}
            </div>
            {errors.selectedGuardians && <p className="text-sm text-destructive">{errors.selectedGuardians.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center"><Clock className="mr-2 h-5 w-5" /> Sharing Duration</Label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {shareDurations.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
          </div>

          {selectedDuration === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customDurationMinutes">Custom Duration (minutes)</Label>
              <Controller
                name="customDurationMinutes"
                control={control}
                render={({ field }) => <Input id="customDurationMinutes" type="number" placeholder="e.g., 45" {...field} value={field.value ?? ''} />}
              />
              {errors.customDurationMinutes && <p className="text-sm text-destructive">{errors.customDurationMinutes.message}</p>}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            <Play className="mr-2 h-5 w-5" /> Start Sharing Location
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
