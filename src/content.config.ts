import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).optional(),
    author: z.enum(['Tyrian Murex', 'Violet']).default('Tyrian Murex'),
  }),
});

const updates = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/updates' }),
  schema: z.object({
    date: z.coerce.date(),
    tag: z.string(),
    tagColor: z.string(),
    title: z.string(),
    desc: z.string(),
  }),
});

export const collections = { blog, updates };
