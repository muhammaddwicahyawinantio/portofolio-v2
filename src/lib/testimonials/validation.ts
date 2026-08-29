import { z } from "zod";

const rating = z.coerce.number().int().min(1).max(5).default(5);

export const publicTestimonialSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters.").max(120),
  position: z
    .string()
    .trim()
    .max(160)
    .transform((value) => value || null),
  content: z.string().trim().min(10, "Story must be at least 10 characters.").max(4000),
  rating,
});

export const adminTestimonialSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters.").max(120),
  position: z.string().trim().min(2, "Position is required.").max(160),
  content: z.string().trim().min(10, "Content must be at least 10 characters.").max(4000),
  rating,
  isActive: z.coerce.boolean().default(true),
});

export type PublicTestimonialInput = z.infer<typeof publicTestimonialSchema>;
export type AdminTestimonialInput = z.infer<typeof adminTestimonialSchema>;
