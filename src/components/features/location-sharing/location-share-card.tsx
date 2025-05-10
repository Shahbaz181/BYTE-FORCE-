// src/components/features/location-sharing/location-share-card.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { MapPin, Clock, Users, Play, StopCircle, AlertTriangle, Copy, MessageSquare, Share2, LocateFixed, Loader2 } from 'lucide-react';
import type { Guardian } from '@/types/guardian';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GUARDIANS_STORAGE_KEY = 'shesafe-guardians';

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
    (val) => (String(val).trim() === "" ? undefined : Number(val)),
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

interface GeoLocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

export function LocationShareCard() {
  const [isSharing, setIsSharing] = useState(false);
  const [sharingDetails, setSharingDetails] = useState<LocationShareFormData | null>(null);
  const [availableGuardians, setAvailableGuardians] = useState<Guardian[]>([]);
  const [shareableLink, setShareableLink] = useState<string>('');
  const { toast } = useToast();

  const [currentLocation, setCurrentLocation] = useState<GeoLocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);


  useEffect(() => {
    const storedGuardiansRaw = localStorage.getItem(GUARDIANS_STORAGE_KEY);
    if (storedGuardiansRaw) {
      try {
        const parsedGuardians: Guardian[] = JSON.parse(storedGuardiansRaw);
        setAvailableGuardians(parsedGuardians.filter(g => g.consentStatus !== 'Declined'));
      } catch (e) {
        console.error("Failed to parse guardians from localStorage", e);
        setAvailableGuardians([]);
      }
    }
  }, [isSharing]); // Reload guardians if sharing status changes, e.g. to update list if contacts were added

  const startRealTimeLocationSharing = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      toast({ variant: "destructive", title: "Geolocation Error", description: "Geolocation is not supported." });
      return;
    }

    setLocationError(null);
    setCurrentLocation(null); // Reset location while fetching new one

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(position as GeoLocationPosition); // Cast to include accuracy
        setLocationError(null);
      },
      (error) => {
        let message = "Could not get your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Please enable it in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "The request to get user location timed out.";
        }
        setLocationError(message);
        setCurrentLocation(null);
        toast({ variant: "destructive", title: "Location Error", description: message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0, // Force fresh location
      }
    );
  };

  const stopRealTimeLocationSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setCurrentLocation(null);
    // Do not clear locationError here, it might be a persistent issue like "not supported"
  };

  useEffect(() => {
    if (isSharing) {
      startRealTimeLocationSharing();
    } else {
      stopRealTimeLocationSharing();
    }
    return () => { // Cleanup on component unmount
      stopRealTimeLocationSharing();
    };
  }, [isSharing]);


  const { control, handleSubmit, watch, formState: { errors }, setValue } = useForm<LocationShareFormData>({
    resolver: zodResolver(locationShareSchema),
    defaultValues: {
      selectedGuardians: [],
      duration: '30',
      customDurationMinutes: undefined, // Ensure it's undefined initially
    },
  });

  const selectedDuration = watch('duration');

  const generateShareableLink = (): string => {
    // In a real app, this would be a unique session ID from the backend
    return `https://shesafe.app/live-location?session=${Date.now().toString(36)}`;
  };

  const onSubmit = (data: LocationShareFormData) => {
    setIsSharing(true); // This will trigger the useEffect to start location sharing
    setSharingDetails(data);
    const generatedLink = generateShareableLink();
    setShareableLink(generatedLink);

    const durationLabel = data.duration === 'custom' 
      ? `${data.customDurationMinutes} minutes` 
      : shareDurations.find(d => d.value === data.duration)?.label;
    
    const selectedGuardianNames = data.selectedGuardians
        .map(id => availableGuardians.find(g => g.id === id)?.name)
        .filter(name => !!name)
        .join(', ');

    toast({
      title: 'Location Sharing Started!',
      description: `Your location is now being shared with ${selectedGuardianNames} for ${durationLabel}. You can also share a link.`,
      duration: 5000,
    });
    console.log('Location sharing started:', data, 'Link:', generatedLink);
  };

  const stopSharing = () => {
    setIsSharing(false); // This will trigger the useEffect to stop location sharing
    setSharingDetails(null);
    setShareableLink('');
    toast({
      title: 'Location Sharing Stopped',
      description: 'You are no longer sharing your location.',
      duration: 3000,
    });
  };

  const handleCopyLink = async () => {
    if (!shareableLink) return;
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast({ title: 'Link Copied!', description: 'Shareable link copied to clipboard.' });
    } catch (err) {
      toast({ title: 'Copy Failed', description: 'Could not copy the link.', variant: 'destructive' });
      console.error('Failed to copy link: ', err);
    }
  };

  const getShareMessage = () => `I'm sharing my live location with you via SheSafe: ${shareableLink}`;

  const handleShareViaWhatsApp = () => {
    if (!shareableLink) return;
    const message = getShareMessage();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareViaMessage = () => {
    if (!shareableLink) return;
    const message = getShareMessage();
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_blank', 'noopener,noreferrer');
  };

  if (isSharing && sharingDetails) {
    const durationLabel = sharingDetails.duration === 'custom' 
      ? `${sharingDetails.customDurationMinutes} minutes` 
      : shareDurations.find(d => d.value === sharingDetails.duration)?.label;
    
    const selectedGuardianNames = sharingDetails.selectedGuardians
        .map(id => availableGuardians.find(g => g.id === id)?.name)
        .filter(name => !!name)
        .join(', ');

    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-primary"><LocateFixed className="mr-2 h-6 w-6 animate-pulse" /> Location Sharing Active</CardTitle>
          <CardDescription>Your live location is currently being shared.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Shared with (Guardians):</Label>
            <p className="text-sm text-muted-foreground">
              {selectedGuardianNames || "No specific guardians selected"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium">Duration:</Label>
            <p className="text-sm text-muted-foreground">{durationLabel}</p>
          </div>

          <div className="pt-2 border-t mt-2">
            <Label className="text-sm font-medium">Current Location:</Label>
            {locationError && (
              <Alert variant="destructive" className="mt-1">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Location Error</AlertTitle>
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}
            {!currentLocation && !locationError && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching location...
              </div>
            )}
            {currentLocation && (
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                <p>Latitude: {currentLocation.coords.latitude.toFixed(6)}</p>
                <p>Longitude: {currentLocation.coords.longitude.toFixed(6)}</p>
                <p>Accuracy: {currentLocation.coords.accuracy.toFixed(0)} meters</p>
                <p className="text-xs">Last update: {new Date(currentLocation.timestamp).toLocaleTimeString()}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2 pt-4 border-t mt-4">
            <Label htmlFor="shareableLink" className="text-sm font-medium">Share via Link:</Label>
            <div className="flex items-center space-x-2">
              <Input id="shareableLink" type="text" value={shareableLink} readOnly className="flex-grow bg-muted" aria-label="Shareable location link"/>
              <Button variant="outline" size="icon" onClick={handleCopyLink} title="Copy Link">
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" className="w-full" onClick={handleShareViaWhatsApp}>
              <Share2 className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" className="w-full" onClick={handleShareViaMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
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
          <CardDescription>Choose trusted contacts and how long to share your live location. You can also share via a link after starting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {availableGuardians.length === 0 ? (
            <Alert variant="default">
              <Users className="h-4 w-4" />
              <AlertTitle>No Available Contacts</AlertTitle>
              <AlertDescription>
                Please add emergency contacts on the Dashboard or in Settings to enable location sharing.
                Only contacts who haven't declined consent will appear here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="guardians" className="flex items-center"><Users className="mr-2 h-5 w-5" /> Select Guardians (up to 5)</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {availableGuardians.map((guardian) => (
                  <Controller
                    key={guardian.id}
                    name="selectedGuardians"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-md border p-3">
                         <Label htmlFor={`guardian-${guardian.id}`} className="font-normal flex flex-col">
                            {guardian.name}
                            {guardian.consentStatus !== 'Accepted' && (
                                <span className="text-xs text-muted-foreground">({guardian.consentStatus})</span>
                            )}
                         </Label>
                        <Switch
                          id={`guardian-${guardian.id}`}
                          checked={(field.value || []).includes(guardian.id)}
                          onCheckedChange={(checked) => {
                            const currentSelection = field.value || [];
                            if (checked) {
                              if (currentSelection.length < 5) {
                                setValue("selectedGuardians", [...currentSelection, guardian.id]);
                              } else {
                                 toast({ title: "Limit Reached", description: "You can select up to 5 guardians.", variant: "destructive"});
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
          )}

          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center"><Clock className="mr-2 h-5 w-5" /> Sharing Duration</Label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value} 
                  disabled={availableGuardians.length === 0 || !!errors.selectedGuardians}
                >
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
                render={({ field }) => (
                  <Input 
                    id="customDurationMinutes" 
                    type="number" 
                    placeholder="e.g., 45" 
                    {...field} 
                    value={field.value === undefined ? '' : field.value} // Handle undefined for empty input
                    onChange={e => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : parseInt(value, 10));
                    }}
                    disabled={availableGuardians.length === 0 || !!errors.selectedGuardians} 
                  />
                )}
              />
              {errors.customDurationMinutes && <p className="text-sm text-destructive">{errors.customDurationMinutes.message}</p>}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={availableGuardians.length === 0 || !!errors.selectedGuardians}>
            <Play className="mr-2 h-5 w-5" /> Start Sharing Location
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
