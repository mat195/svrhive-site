import { defineCollection, z } from 'astro:content';

// Notes = the answer-engine corpus pages. Empty in v1; the Corpus Foundry brief
// publishes markdown entries here (each specced via skills/corpus-page-spec.md).
const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    targetQuery: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { notes };
