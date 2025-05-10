// src/ai/flows/danger-zone-alerts.ts
'use server';

/**
 * @fileOverview Implements the danger zone alerts feature using AI to analyze community incident reports.
 *
 * - `getDangerZoneAlerts` - A function that retrieves danger zone alerts based on a location.
 * - `DangerZoneAlertsInput` - The input type for the `getDangerZoneAlerts` function.
 * - `DangerZoneAlertsOutput` - The return type for the `getDangerZoneAlerts` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DangerZoneAlertsInputSchema = z.object({
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
});
export type DangerZoneAlertsInput = z.infer<typeof DangerZoneAlertsInputSchema>;

const DangerZoneAlertsOutputSchema = z.object({
  alerts: z.array(
    z.object({
      location: z.string().describe('The location of the danger zone.'),
      description: z.string().describe('A description of the incident.'),
      severity: z.enum(['low', 'medium', 'high']).describe('The severity of the incident.'),
    })
  ).describe('A list of danger zone alerts near the user.'),
});
export type DangerZoneAlertsOutput = z.infer<typeof DangerZoneAlertsOutputSchema>;

export async function getDangerZoneAlerts(input: DangerZoneAlertsInput): Promise<DangerZoneAlertsOutput> {
  return dangerZoneAlertsFlow(input);
}

const dangerZoneAlertsPrompt = ai.definePrompt({
  name: 'dangerZoneAlertsPrompt',
  input: {schema: DangerZoneAlertsInputSchema},
  output: {schema: DangerZoneAlertsOutputSchema},
  prompt: `You are an AI assistant designed to identify potential danger zones based on community incident reports.

  Given the user's current location (latitude: {{{latitude}}}, longitude: {{{longitude}}}), analyze recent incident reports and identify any potential danger zones nearby.
  Provide a list of alerts, including the location of the danger zone, a description of the incident, and a severity level (low, medium, or high).
  Consider factors such as the type of incident, time of day, and proximity to the user's location when determining the severity level.
  Do not include any alerts that are more than 24 hours old.
  Ensure the alerts are relevant to the user's current location and provide actionable information to help them take extra precautions.
  `,
});

const dangerZoneAlertsFlow = ai.defineFlow(
  {
    name: 'dangerZoneAlertsFlow',
    inputSchema: DangerZoneAlertsInputSchema,
    outputSchema: DangerZoneAlertsOutputSchema,
  },
  async input => {
    const {output} = await dangerZoneAlertsPrompt(input);
    return output!;
  }
);
