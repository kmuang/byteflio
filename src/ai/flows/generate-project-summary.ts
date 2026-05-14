
'use server';
/**
 * @fileOverview A Genkit flow for generating concise and engaging summaries of project details.
 *
 * - generateProjectSummary - A function that generates an AI-powered summary for a given project.
 * - GenerateProjectSummaryInput - The input type for the generateProjectSummary function.
 * - GenerateProjectSummaryOutput - The return type for the generateProjectSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectSummaryInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  description: z.string().describe('A detailed description of the project.'),
  stack: z.string().describe('The technologies and tech stack used in the project.'),
  features: z.string().describe('Key features and functionalities of the project.'),
  challenges: z.string().describe('Significant challenges encountered and solutions implemented.'),
  demoLink: z.string().url().optional().describe('An optional URL to the project demo.'),
  githubLink: z.string().url().optional().describe('An optional URL to the project\'s GitHub repository.'),
});
export type GenerateProjectSummaryInput = z.infer<typeof GenerateProjectSummaryInputSchema>;

const GenerateProjectSummaryOutputSchema = z.string().describe('A concise, engaging AI-generated summary of the project details.');
export type GenerateProjectSummaryOutput = z.infer<typeof GenerateProjectSummaryOutputSchema>;

export async function generateProjectSummary(input: GenerateProjectSummaryInput): Promise<GenerateProjectSummaryOutput> {
  return generateProjectSummaryFlow(input);
}

const projectSummaryPrompt = ai.definePrompt({
  name: 'projectSummaryPrompt',
  input: {schema: GenerateProjectSummaryInputSchema},
  output: {schema: GenerateProjectSummaryOutputSchema},
  prompt: `You are an AI assistant tasked with generating a professional and concise summary for a software project. 

Highlight the project's purpose, key technologies, notable features, and any unique challenges. 

IMPORTANT: You MUST include a dedicated "LINKS" section at the VERY END of the summary if they are provided.
Use this EXACT format for links:

---
LINKS:
{{#if demoLink}}LIVE DEMO: {{{demoLink}}}{{/if}}
{{#if githubLink}}SOURCE CODE: {{{githubLink}}}{{/if}}

Context Data:
Project Name: {{{projectName}}}
Description: {{{description}}}
Stack: {{{stack}}}
Features: {{{features}}}
Challenges: {{{challenges}}}

Generate a concise summary (under 200 words):
`,
});

const generateProjectSummaryFlow = ai.defineFlow(
  {
    name: 'generateProjectSummaryFlow',
    inputSchema: GenerateProjectSummaryInputSchema,
    outputSchema: GenerateProjectSummaryOutputSchema,
  },
  async (input) => {
    const {output} = await projectSummaryPrompt(input);
    return output!;
  }
);
