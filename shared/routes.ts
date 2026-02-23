import { z } from 'zod';
import { insertCheckinSchema, checkins, insertExerciseCompletionSchema, exerciseCompletions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  checkins: {
    list: {
      method: 'GET' as const,
      path: '/api/checkins' as const,
      responses: {
        200: z.array(z.custom<typeof checkins.$inferSelect>()),
        401: z.object({ message: z.string() }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/checkins' as const,
      input: insertCheckinSchema,
      responses: {
        201: z.custom<typeof checkins.$inferSelect>(),
        400: errorSchemas.validation,
        401: z.object({ message: z.string() }),
      },
    },
  },
  exercises: {
    list: {
      method: 'GET' as const,
      path: '/api/exercises' as const,
      responses: {
        200: z.array(z.custom<typeof exerciseCompletions.$inferSelect>()),
        401: z.object({ message: z.string() }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/exercises' as const,
      input: insertExerciseCompletionSchema,
      responses: {
        201: z.custom<typeof exerciseCompletions.$inferSelect>(),
        400: errorSchemas.validation,
        401: z.object({ message: z.string() }),
      },
    },
    resetToday: {
      method: 'DELETE' as const,
      path: '/api/exercises/today' as const,
      responses: {
        200: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
      },
    },
  },
  ai: {
    analyze: {
      method: 'POST' as const,
      path: '/api/ai/analyze' as const,
      input: z.object({
        checkinId: z.number(),
      }),
      responses: {
        200: z.object({ analysis: z.string() }),
        401: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
