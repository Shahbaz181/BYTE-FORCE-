// src/components/features/settings/manage-guardians.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Guardian, GuardianOnlineStatus } from '@/types/guardian';
import { MAX_GUARDIANS, PRIORITY_LEVELS } from '@/types/guardian';
import { GuardianForm, type GuardianFormData } from './guardian-form';
import { GuardianListItem } from './guardian-list-item';
import { PlusCircle, Users, Contact } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialMockGuardians: Guardian[] = [
  {
    id: '1',
    name: 'Jane Doe',
    phone: '+15551234567',
    relation: 'Mother',
    priority: 1,
    photoUrl: 'https://picsum.photos/seed/jane/100/100',
    consentStatus: 'Accepted',
    onlineStatus: 'Online',
    lastActive: 'Now',
    locationReceived: true,
    sosResponseAcknowledged: false,
  },
  {
    id: '2',
    name: 'John Smith',
    phone: '+15557654321',
    relation: 'Friend',
    priority: 2,
    photoUrl: 'https://picsum.photos/seed/john/100/100',
    consentStatus: 'Pending',
    onlineStatus: 'Offline',
    lastActive: '2h ago',
    locationReceived: false,
    sosResponseAcknowledged: false,
  },
];


export function ManageGuardians() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading guardians from a persistent store or API in a real app
    // For now, we use mock data if local storage is empty
    const storedGuardians = localStorage.getItem('shesafe-guardians');
    if (storedGuardians) {
      setGuardians(JSON.parse(storedGuardians));
    } else {
      setGuardians(initialMockGuardians);
    }
  }, []);

  useEffect(() => {
    // Persist guardians to local storage whenever they change
    // In a real app, this would be an API call
    if (guardians.length > 0 || localStorage.getItem('shesafe-guardians')) {
        localStorage.setItem('shesafe-guardians', JSON.stringify(guardians));
    }
  }, [guardians]);


  const handleAddGuardianClick = () => {
    if (guardians.length >= MAX_GUARDIANS) {
      toast({
        title: 'Guardian Limit Reached',
        description: `You can add a maximum of ${MAX_GUARDIANS} guardians.`,
        variant: 'destructive',
      });
      return;
    }
    setEditingGuardian(null);
    setIsFormOpen(true);
  };

  const handleEditGuardian = (guardian: Guardian) => {
    setEditingGuardian(guardian);
    setIsFormOpen(true);
  };

  const handleDeleteGuardian = (guardianId: string) => {
    setGuardians(prev => prev.filter(g => g.id !== guardianId));
    toast({
      title: 'Guardian Removed',
      description: 'The guardian has been removed from your list.',
    });
  };

  const handleSaveGuardian = (data: GuardianFormData, isEditing: boolean) => {
    if (isEditing && data.id) {
      setGuardians(prev => prev.map(g => g.id === data.id ? { ...g, ...data, photoUrl: data.photoUrl || g.photoUrl } : g));
    } else {
      // For new guardians, set consent to 'Pending'
      const newGuardian: Guardian = {
        id: Date.now().toString(), // Simple ID generation
        ...data,
        photoUrl: data.photoUrl || undefined,
        consentStatus: 'Pending', // New guardians start with Pending consent
        onlineStatus: 'Unknown', // Default status for new
        lastActive: undefined,
        locationReceived: false,
        sosResponseAcknowledged: false,
      };
      setGuardians(prev => [...prev, newGuardian]);
       // Simulate sending consent request
      toast({
        title: 'Consent Request Sent (Simulated)',
        description: `A consent request has been sent to ${newGuardian.name}.`,
      });
    }
    setIsFormOpen(false);
    setEditingGuardian(null);
  };

  const handleCallGuardian = (guardian: Guardian) => {
    toast({ title: `Calling ${guardian.name} (Simulated)`, description: `Dialing ${guardian.phone}...` });
  };
  const handleSmsGuardian = (guardian: Guardian) => {
    toast({ title: `Messaging ${guardian.name} (Simulated)`, description: `Opening SMS to ${guardian.phone}...` });
  };
  const handleShareLocationWithGuardian = (guardian: Guardian) => {
    toast({ title: `Sharing Location with ${guardian.name} (Simulated)`, description: `Your live location is being shared.` });
  };
   const handleResendInvite = (guardian: Guardian) => {
    if (guardian.consentStatus === 'Pending' || guardian.consentStatus === 'Declined' || guardian.consentStatus === 'Not Sent') {
      // Simulate resending invite
      setGuardians(prev => prev.map(g => g.id === guardian.id ? { ...g, consentStatus: 'Pending' } : g));
      toast({
        title: 'Invite Sent (Simulated)',
        description: `A new consent request has been sent to ${guardian.name}.`,
      });
    }
  };
  const handleImportContacts = () => {
    toast({
        title: "Import Contacts (Simulated)",
        description: "This feature would allow importing from your phone's contacts.",
    });
  };


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
            <CardTitle className="text-2xl flex items-center"><Users className="mr-2 h-6 w-6" />Emergency Contacts</CardTitle>
            <CardDescription>Manage your trusted guardians who receive alerts.</CardDescription>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleImportContacts} title="Import from phone contacts">
                <Contact className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button onClick={handleAddGuardianClick} disabled={guardians.length >= MAX_GUARDIANS} title="Add a new guardian">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Guardian
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {guardians.length === 0 ? (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>No Guardians Yet</AlertTitle>
            <AlertDescription>
              Add your trusted contacts to create your safety net. Click "Add Guardian" to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {guardians.map(guardian => (
              <GuardianListItem
                key={guardian.id}
                guardian={guardian}
                onEdit={handleEditGuardian}
                onDelete={handleDeleteGuardian}
                onCall={handleCallGuardian}
                onSms={handleSmsGuardian}
                onShareLocation={handleShareLocationWithGuardian}
                onResendInvite={handleResendInvite}
              />
            ))}
          </div>
        )}
      </CardContent>
      <GuardianForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveGuardian}
        initialData={editingGuardian}
      />
    </Card>
  );
}

