import { z } from 'zod';
import { env } from '../config/env.js';
import { createPetCareReply } from '../services/petCareChat.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(env.CHAT_MESSAGE_MAX_CHARS),
}).strict();

export const chatRequestSchema = z.object({
  body: z.object({
    messages: z.array(chatMessageSchema).min(1).max(env.CHAT_HISTORY_MAX_MESSAGES),
  }).strict().superRefine(({ messages }, context) => {
    const totalChars = messages.reduce((total, message) => total + message.content.length, 0);
    if (totalChars > env.CHAT_REQUEST_MAX_CHARS) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['messages'],
        message: `Conversation content must not exceed ${env.CHAT_REQUEST_MAX_CHARS} characters`,
      });
    }
    if (messages.at(-1)?.role !== 'user') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['messages'],
        message: 'The final conversation message must have the user role',
      });
    }
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const chat = asyncHandler(async (req, res) => {
  const result = await createPetCareReply(req.validated.body.messages);
  res.json({ data: result });
});
