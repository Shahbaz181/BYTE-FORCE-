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

// Basic phone regex, consider a more robust one for production
const phoneRegex = new RegExp(
  /^([+]?[\s0-9.-]+)?(\d{3}|[(]?[0-9]+[)])?([-.\s]?[0-9])+$/
);

const addContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name cannot exceed 50 characters."),
  phone: z.string().regex(phoneRegex, "Invalid phone number format."),
});

type AddContactFormData = z.infer<typeof addContactSchema>;

export function StandaloneAddContactForm() {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddContactFormData>({
    resolver: zodResolver(addContactSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const onSubmit: SubmitHandler<AddContactFormData> = (data) => {
    // In a real app, you would save this data (e.g., to localStorage, backend)
    // and potentially add it to the guardians list in ManageGuardians or a central contact store.
    // For now, just show a toast and log.
    console.log('Contact to add:', data);
    toast({
      title: "Contact Added (Simulated)",
      description: `Name: ${data.name}, Phone: ${data.phone}`,
    });
    reset(); // Clear the form
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="flex items-center"><UserPlus className="mr-2 h-6 w-6 text-primary" /> Add New Contact</CardTitle>
          <CardDescription>Fill in the details below to add an emergency contact.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter contact's name"
              {...register('name')}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && <p className="text-sm text-destructive" role="alert">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter contact's phone number"
              {...register('phone')}
              aria-invalid={errors.phone ? "true" : "false"}
            />
            {errors.phone && <p className="text-sm text-destructive" role="alert">{errors.phone.message}</p>}
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
