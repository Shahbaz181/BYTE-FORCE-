// src/components/features/settings/guardian-form.tsx
"use client";

import type { Control } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Guardian, PriorityLevel } from '@/types/guardian';
import { PRIORITY_LEVELS, RELATION_SUGGESTIONS } from '@/types/guardian';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

// Basic phone regex, consider a more robust one for production
const phoneRegex = new RegExp(
  /^([+]?[\s0-9.-]+)?(\d{3}|[(]?[0-9]+[)])?([-.\s]?[0-9])+$/
);

export const guardianFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name cannot exceed 50 characters."),
  phone: z.string().regex(phoneRegex, "Invalid phone number format."),
  relation: z.string().min(2, "Relation must be at least 2 characters.").max(30, "Relation cannot exceed 30 characters."),
  priority: z.coerce.number().min(1).max(5) as z.ZodType<PriorityLevel, z.ZodTypeDef, number>,
  photoUrl: z.string().url({ message: "Please enter a valid URL for the photo (e.g., https://example.com/photo.jpg)." }).optional().or(z.literal('')),
});

export type GuardianFormData = z.infer<typeof guardianFormSchema>;

interface GuardianFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GuardianFormData, isEditing: boolean) => void;
  initialData?: Guardian | null;
}

export function GuardianForm({ isOpen, onClose, onSave, initialData }: GuardianFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<GuardianFormData>({
    resolver: zodResolver(guardianFormSchema),
    defaultValues: initialData ? 
      { ...initialData, photoUrl: initialData.photoUrl || '' } : 
      { name: '', phone: '', relation: '', priority: 3, photoUrl: '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData ? 
        { ...initialData, photoUrl: initialData.photoUrl || '' } : 
        { name: '', phone: '', relation: '', priority: 3, photoUrl: '' }
      );
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: GuardianFormData) => {
    onSave(data, isEditing);
    toast({
      title: `Guardian ${isEditing ? 'Updated' : 'Added'}`,
      description: `${data.name} has been successfully ${isEditing ? 'updated' : 'added'}.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Guardian' : 'Add New Guardian'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of your trusted contact.' : 'Add a new trusted contact to receive alerts.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" {...field} className="col-span-3" />}
            />
            {errors.name && <p className="col-span-4 text-sm text-destructive text-right">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <Input id="phone" type="tel" {...field} className="col-span-3" placeholder="e.g., +1-555-123-4567" />}
            />
            {errors.phone && <p className="col-span-4 text-sm text-destructive text-right">{errors.phone.message}</p>}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relation" className="text-right">Relation</Label>
            <Controller
              name="relation"
              control={control}
              render={({ field }) => (
                <div className="col-span-3">
                  <Input id="relation" list="relation-suggestions" {...field} placeholder="e.g., Mother, Best Friend" />
                  <datalist id="relation-suggestions">
                    {RELATION_SUGGESTIONS.map(suggestion => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                </div>
              )}
            />
            {errors.relation && <p className="col-span-4 text-sm text-destructive text-right">{errors.relation.message}</p>}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">Priority</Label>
            <Controller
              name="priority"
              control={control as unknown as Control<GuardianFormData, PriorityLevel>} // Type assertion due to Controller expecting string for Select
              render={({ field }) => (
                <Select onValueChange={(value) => field.onChange(Number(value) as PriorityLevel)} value={String(field.value)}>
                  <SelectTrigger id="priority" className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map(level => (
                      <SelectItem key={level} value={String(level)}>
                        Level {level} {level === 1 ? "(Highest)" : level === 5 ? "(Lowest)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.priority && <p className="col-span-4 text-sm text-destructive text-right">{errors.priority.message}</p>}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="photoUrl" className="text-right">Photo URL</Label>
            <Controller
              name="photoUrl"
              control={control}
              render={({ field }) => <Input id="photoUrl" {...field} className="col-span-3" placeholder="https://example.com/image.png (Optional)" />}
            />
            {errors.photoUrl && <p className="col-span-4 text-sm text-destructive text-right">{errors.photoUrl.message}</p>}
          </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Add Guardian'}</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

