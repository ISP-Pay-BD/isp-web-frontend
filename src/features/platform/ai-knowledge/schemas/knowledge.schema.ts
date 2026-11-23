import { z } from 'zod';

/** Mirrors Rust `SaveKnowledgeRequest` + PHP AiKnowledgeController::save rules. */
export const knowledgeSchema = z.object({
  category: z.string().trim().min(1, 'Pick a category').max(50),
  question: z
    .string()
    .trim()
    .min(1, 'Question is required')
    .max(500, 'Keep the question under 500 characters'),
  answer: z
    .string()
    .trim()
    .min(1, 'Answer is required')
    .max(5000, 'Keep the answer under 5000 characters'),
  keywords: z.string().trim().max(500),
  matchType: z.enum(['exact', 'keywords', 'ai_context']),
  priority: z
    .number({ message: 'Enter a number' })
    .int()
    .min(0, 'Use 0 or more')
    .max(100, 'Use 100 or less'),
  status: z.enum(['active', 'inactive']),
});

export type KnowledgeFormValues = z.infer<typeof knowledgeSchema>;
