// src/ai/flows/guardian-angel-mode.ts
'use server';

/**
 * @fileOverview Implements the Guardian Angel Mode, which uses AI to monitor audio, location name, and movement for distress signals.
 *
 * - analyzeUserContext - Analyzes user audio, location name, and movement data to detect distress.
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
  placeName: z.string().describe('The name of the user\'s current location (e.g., "City Park", "123 Main St, Anytown").'),
  movementData: z.string().describe('Data about user movement, e.g. speed, acceleration, or a description like "walking fast", "stationary".'),
});
export type AnalyzeUserContextInput = z.infer<typeof AnalyzeUserContextInputSchema>;

const AnalyzeUserContextOutputSchema = z.object({
  isDistressed: z
    .boolean()
    .describe(
      'True if the AI detects signs of distress based on audio, location name, and movement data.'
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
  prompt: `You are an AI assistant designed to identify signs of distress in users based on audio, location name, and movement data.

You will receive the user's audio stream, location name, and movement data.

Analyze the provided data to determine if the user is in distress. Consider factors such as their reported location name, erratic movements, and concerning audio cues (e.g., shouting, sounds of a struggle).
If the location name suggests an isolated or potentially dangerous area, factor this into your analysis.

Audio Data: {{media url=audioDataUri}}
Location Name: {{{placeName}}}
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

