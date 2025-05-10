// src/ai/flows/guardian-angel-mode.ts
'use server';

/**
 * @fileOverview Implements the Guardian Angel Mode, which uses AI to monitor audio and location for distress signals.
 *
 * - analyzeUserContext - Analyzes user audio and location data to detect distress.
 * - AnalyzeUserContextInput - Input type for analyzeUserContext function.
 * - AnalyzeUserContextOutput - Output type for analyzeUserContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUserContextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The user's current audio stream, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
  movementData: z.string().describe('Data about user movement, e.g. speed, acceleration'),
});
export type AnalyzeUserContextInput = z.infer<typeof AnalyzeUserContextInputSchema>;

const AnalyzeUserContextOutputSchema = z.object({
  isDistressed: z
    .boolean()
    .describe(
      'True if the AI detects signs of distress based on audio and location data.'
    ),
  reason: z.string().describe('The reason for the distress detection, if any.'),
});
export type AnalyzeUserContextOutput = z.infer<typeof AnalyzeUserContextOutputSchema>;

export async function analyzeUserContext(
  input: AnalyzeUserContextInput
): Promise<AnalyzeUserContextOutput> {
  return analyzeUserContextFlow(input);
}

const analyzeUserContextPrompt = ai.definePrompt({
  name: 'analyzeUserContextPrompt',
  input: {schema: AnalyzeUserContextInputSchema},
  output: {schema: AnalyzeUserContextOutputSchema},
  prompt: `You are an AI assistant designed to identify signs of distress in users based on audio and location data.

You will receive the user's audio stream, location (latitude and longitude), and movement data.

Analyze the provided data to determine if the user is in distress. Consider factors such as erratic movements, stops in isolated areas, and concerning audio cues (e.g., shouting, sounds of a struggle).

Audio Data: {{media url=audioDataUri}}
Latitude: {{{latitude}}}
Longitude: {{{longitude}}}
Movement Data: {{{movementData}}}

Based on your analysis, determine if the user is distressed and provide a reason for your determination.
Set isDistressed to true if distress is detected; otherwise, set it to false.
`,
});

const analyzeUserContextFlow = ai.defineFlow(
  {
    name: 'analyzeUserContextFlow',
    inputSchema: AnalyzeUserContextInputSchema,
    outputSchema: AnalyzeUserContextOutputSchema,
  },
  async input => {
    const {output} = await analyzeUserContextPrompt(input);
    return output!;
  }
);
