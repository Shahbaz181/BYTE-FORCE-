// src/components/features/contacts/standalone-add-contact-form.tsx
"use client";

import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import type { Guardian } from '@/types/guardian';
import { MAX_GUARDIANS, RELATION_SUGGESTIONS } from '@/types/guardian';

const phoneRegex = new RegExp(
  /^([+]?[\s0-9.-]+)?(\d{3}|[(]?[0-9]+[)])?([-.\s]?[0-9])+$/
);

const addContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name cannot exceed 50 characters."),
  phone: z.string().regex(phoneRegex, "Invalid phone number format."),
  relation: z.string().min(2, "Relation must be at least 2 characters.").max(30, "Relation cannot exceed 30 characters."),
});

type AddContactFormData = z.infer<typeof addContactSchema>;

const GUARDIANS_STORAGE_KEY = 'shesafe-guardians';

export function StandaloneAddContactForm() {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddContactFormData>({
    resolver: zodResolver(addContactSchema),
    defaultValues: {
      name: '',
      phone: '',
      relation: '',
    },
  });

  const onSubmit: SubmitHandler<AddContactFormData> = (data) => {
    try {
      const storedGuardiansRaw = localStorage.getItem(GUARDIANS_STORAGE_KEY);
      const existingGuardians: Guardian[] = storedGuardiansRaw ? JSON.parse(storedGuardiansRaw) : [];

      if (existingGuardians.length >= MAX_GUARDIANS) {
        toast({
          title: 'Guardian Limit Reached',
          description: `You can add a maximum of ${MAX_GUARDIANS} guardians. Please manage your guardians in Settings.`,
          variant: 'destructive',
        });
        return;
      }

      const newGuardian: Guardian = {
        id: Date.now().toString(),
        name: data.name,
        phone: data.phone,
        relation: data.relation,
        priority: 3, // Default priority
        consentStatus: 'Not Sent', // Default consent status
        // Other fields can be undefined or have defaults
        photoUrl: undefined,
        onlineStatus: 'Unknown',
        lastActive: undefined,
        locationReceived: false,
        sosResponseAcknowledged: false,
      };

      const updatedGuardians = [...existingGuardians, newGuardian];
      localStorage.setItem(GUARDIANS_STORAGE_KEY, JSON.stringify(updatedGuardians));

      toast({
        title: "Guardian Added",
        description: `${data.name} has been added to your emergency contacts. Manage them in Settings.`,
      });
      reset(); // Clear the form
    } catch (error) {
      console.error("Error saving contact:", error);
      toast({
        title: "Error",
        description: "Could not save contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="flex items-center"><UserPlus className="mr-2 h-6 w-6 text-primary" /> Add New Emergency Contact</CardTitle>
          <CardDescription>Quickly add a contact. Full management is available in Settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="standalone-name">Name</Label>
            <Input
              id="standalone-name"
              placeholder="Enter contact's name"
              {...register('name')}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && <p className="text-sm text-destructive" role="alert">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="standalone-phone">Phone Number</Label>
            <Input
              id="standalone-phone"
              type="tel"
              placeholder="Enter contact's phone number"
              {...register('phone')}
              aria-invalid={errors.phone ? "true" : "false"}
            />
            {errors.phone && <p className="text-sm text-destructive" role="alert">{errors.phone.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="standalone-relation">Relation</Label>
            <Input
              id="standalone-relation"
              placeholder="e.g., Mother, Friend"
              list="standalone-relation-suggestions"
              {...register('relation')}
              aria-invalid={errors.relation ? "true" : "false"}
            />
            <datalist id="standalone-relation-suggestions">
              {RELATION_SUGGESTIONS.map(suggestion => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
            {errors.relation && <p className="text-sm text-destructive" role="alert">{errors.relation.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            <UserPlus className="mr-2 h-5 w-5" /> Add Contact
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
