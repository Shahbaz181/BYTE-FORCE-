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
    // Regex to validate a basic audio data URI structure.
    // It checks for 'data:audio/', a MIME subtype, ';base64,', 
    // and a non-empty, valid Base64 characters string.
    // The (?=.+) positive lookahead asserts that there is at least one character after 'base64,'.
    .refine(val => /^data:audio\/[a-zA-Z0-9.-]+;base64,(?=.+)([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}(==)?|[A-Za-z0-9+/]{3}=)?$/.test(val), {
        message: "Audio data URI must be a valid, non-empty Base64 encoded audio data URI (e.g., 'data:audio/webm;base64,R0VO...'). Ensure it's not empty or malformed."
    })
    .describe(
      "The user's current audio stream, as a data URI that must include a MIME type (e.g., audio/webm or audio/wav) and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. The encoded data part must not be empty."
    ),
  placeName: z.string().min(1, "Place name cannot be empty.").describe('The name of the user\'s current location (e.g., "City Park", "123 Main St, Anytown").'),
  movementData: z.string().min(1, "Movement data cannot be empty.").describe('Data about user movement, e.g. speed, acceleration, or a description like "walking fast", "stationary".'),
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

Based on your analysis, determine if the user is distressed and provide a concise reason for your determination.
Set isDistressed to true if distress is detected; otherwise, set it to false.
`,
});

const analyzeUserContextFlow = ai.defineFlow(
  {
    name: 'analyzeUserContextFlow',
    inputSchema: AnalyzeUserContextInputSchema,
    outputSchema: AnalyzeUserContextOutputSchema,
  },
  async (input: AnalyzeUserContextInput): Promise<AnalyzeUserContextOutput> => {
    try {
      // Genkit implicitly validates input against the schema before calling the flow handler.
      // If audioDataUri is invalid (e.g., empty Base64 part due to new regex), 
      // an error should be thrown by Genkit/Zod before this point, 
      // or the call to the prompt might fail if validation happens there.

      const {output} = await analyzeUserContextPrompt(input);
      
      if (!output) {
        // This case might occur if the model returns a non-parsable response or no response.
        console.error('analyzeUserContextPrompt returned no output or unparsable output for input:', { 
            placeName: input.placeName, 
            movementData: input.movementData, 
            audioDataUriLength: input.audioDataUri.length 
        });
        return {
          isDistressed: false,
          reason: "AI analysis could not be completed or returned an unexpected result. Please ensure all inputs are valid and the audio recording was successful.",
        };
      }
      return output;
    } catch (error: any) {
        // This catch block handles errors from the analyzeUserContextPrompt call (e.g., API errors from Google)
        // or Zod validation errors if they are not caught earlier by Genkit's infrastructure.
        console.error("Error in analyzeUserContextFlow:", error.message || error, "Input (audioDataUri possibly truncated):", { 
            placeName: input.placeName, 
            movementData: input.movementData, 
            audioDataUriLength: input.audioDataUri?.length,
            audioDataUriStart: input.audioDataUri?.substring(0, 80) + "..." // Log a bit more of the start
        });
        
        let reasonMessage = `AI analysis failed. ${error.message || 'The provided audio or other data might be invalid or an unexpected issue occurred.'}`;
        if (error.errors && Array.isArray(error.errors)) { // Check for Zod error structure
          reasonMessage = `AI analysis failed due to invalid input: ${error.errors.map((e: any) => `${e.path.join('.')} - ${e.message}`).join(', ')}. Please check your input, especially the audio recording.`;
        } else if (error.message && error.message.includes("Request contains an invalid argument")) {
            reasonMessage = "AI analysis failed: The recorded audio data was considered invalid by the analysis service. This might be due to an empty recording, unsupported audio format characteristics, or a very short/corrupted audio clip. Please try re-recording.";
        }

        return {
            isDistressed: false,
            reason: reasonMessage,
        };
    }
  }
);
