// src/ai/flows/danger-zone-alerts.ts
'use server';

/**
 * @fileOverview Implements the danger zone alerts feature using AI to analyze community incident reports based on a location name.
 *
 * - `getDangerZoneAlerts` - A function that retrieves danger zone alerts based on a location name.
 * - `DangerZoneAlertsInput` - The input type for the `getDangerZoneAlerts` function.
 * - `DangerZoneAlertsOutput` - The return type for the `getDangerZoneAlerts` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DangerZoneAlertsInputSchema = z.object({
  locationName: z.string().describe('The name of the location to check for danger alerts (e.g., "City Park", "123 Main St, Anytown").'),
});
export type DangerZoneAlertsInput = z.infer<typeof DangerZoneAlertsInputSchema>;

const DangerZoneAlertsOutputSchema = z.object({
  alerts: z.array(
    z.object({
      location: z.string().describe('The location of the danger zone.'),
      description: z.string().describe('A description of the incident.'),
      severity: z.enum(['low', 'medium', 'high']).describe('The severity of the incident.'),
    })
  ).describe('A list of danger zone alerts near the specified location.'),
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

  Given the user's specified location name: "{{{locationName}}}", analyze recent incident reports and identify any potential danger zones in or very near that location.
  Provide a list of alerts, including the location of the danger zone (be specific if possible), a description of the incident, and a severity level (low, medium, or high).
  Consider factors such as the type of incident, time of day, and relevance to the user's specified location when determining the severity level.
  Do not include any alerts that are more than 24 hours old.
  Ensure the alerts are relevant to the user's specified location and provide actionable information to help them take extra precautions.
  If the location name is ambiguous or too broad, try to provide general alerts for the most likely interpretation or state that the location is too broad for specific alerts.
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

