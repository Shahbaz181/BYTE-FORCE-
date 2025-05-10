// src/ai/flows/guardian-angel-mode.ts
'use server';

/**
 * @fileOverview Implements the Guardian Angel Mode, which uses AI to analyze user-provided text describing their situation and provide safety tips.
 *
 * - analyzeSituationText - Analyzes user-provided text to assess the situation and offer safety tips.
 * - AnalyzeSituationTextInput - Input type for analyzeSituationText function.
 * - AnalyzeSituationTextOutput - Output type for analyzeSituationText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSituationTextInputSchema = z.object({
  situationText: z.string().min(5, "Please describe your situation in a bit more detail (minimum 5 characters).").max(1000, "Description is too long (maximum 1000 characters).").describe('Textual description of the user\'s current situation or concern.'),
});
export type AnalyzeSituationTextInput = z.infer<typeof AnalyzeSituationTextInputSchema>;

const AnalyzeSituationTextOutputSchema = z.object({
  assessment: z
    .string()
    .describe(
      'A brief assessment of the situation based on the provided text.'
    ),
  safetyTips: z.array(z.string()).describe('Actionable safety tips relevant to the described situation. Could be general if the situation is unclear.'),
});
export type AnalyzeSituationTextOutput = z.infer<typeof AnalyzeSituationTextOutputSchema>;

export async function analyzeSituationText(
  input: AnalyzeSituationTextInput
): Promise<AnalyzeSituationTextOutput> {
  return analyzeSituationTextFlow(input);
}

const analyzeSituationTextPrompt = ai.definePrompt({
  name: 'analyzeSituationTextPrompt',
  input: {schema: AnalyzeSituationTextInputSchema},
  output: {schema: AnalyzeSituationTextOutputSchema},
  prompt: `You are an AI assistant designed to help users who describe a potentially unsafe or concerning situation by providing an assessment and safety tips.

The user has provided the following description of their situation:
"{{{situationText}}}"

Analyze this text to understand the context and potential risks.
Provide:
1. A brief 'assessment' of the situation.
2. A list of 2-4 actionable 'safetyTips' tailored to the described situation.

If the situation seems safe or lacks detail, your assessment should reflect that, and you should provide general safety advice.
If the text is very short, vague, or does not seem to describe a safety concern, indicate that in the assessment and provide general safety tips.
Focus on practical, actionable advice. If the situation sounds like an immediate emergency, one of the tips should be to contact emergency services.
`,
  // Example configuration for safety settings, adjust as needed
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const analyzeSituationTextFlow = ai.defineFlow(
  {
    name: 'analyzeSituationTextFlow',
    inputSchema: AnalyzeSituationTextInputSchema,
    outputSchema: AnalyzeSituationTextOutputSchema,
  },
  async (input: AnalyzeSituationTextInput): Promise<AnalyzeSituationTextOutput> => {
    try {
      const {output} = await analyzeSituationTextPrompt(input);
      
      if (!output) {
        console.error('analyzeSituationTextPrompt returned no output for input:', input.situationText);
        return {
          assessment: "AI analysis could not be completed or returned an unexpected result. Please try rephrasing your concern.",
          safetyTips: ["Ensure you are in a safe location.", "If you feel in danger, contact emergency services or a trusted person immediately."],
        };
      }
      return { ...output, safetyTips: output.safetyTips || ["Be aware of your surroundings.", "Trust your instincts."] };
    } catch (error: any) {
        console.error("Error in analyzeSituationTextFlow:", error.message || error, "Input:", input.situationText);
        
        let assessmentMessage = `AI analysis failed. ${error.message || 'An unexpected issue occurred.'}`;
         if (error.errors && Array.isArray(error.errors)) { 
          assessmentMessage = `AI analysis failed due to invalid input: ${error.errors.map((e: any) => `${e.path.join('.')} - ${e.message}`).join(', ')}. Please check your input.`;
        } else if (error.message && error.message.includes("Request contains an invalid argument")) {
            assessmentMessage = "AI analysis failed: The provided text was considered invalid by the analysis service. This might be due to formatting or content issues. Please try rephrasing.";
        }

        return {
            assessment: assessmentMessage,
            safetyTips: ["If you're concerned, reach out to a trusted person.", "If you are in immediate danger, contact emergency services."],
        };
    }
  }
);
