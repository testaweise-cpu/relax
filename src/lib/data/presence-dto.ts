import { z } from "zod";
import { imageSchema } from "./types";

/**
 * Antwortformat von GET /api/presence – schlank, nur was die
 * Jetzt-da-Leiste braucht. Wird auch im Browser mit zod geprüft.
 */
export const presentEntrySchema = z.object({
  slug: z.string(),
  name: z.string(),
  languages: z.array(z.string()),
  isNew: z.boolean(),
  isBack: z.boolean(),
  image: imageSchema.nullable(),
  since: z.string(),
  until: z.string().nullable(),
});

export const presenceResponseSchema = z.object({
  updatedAt: z.string(),
  present: z.array(presentEntrySchema),
});

export type PresentEntry = z.infer<typeof presentEntrySchema>;
export type PresenceResponse = z.infer<typeof presenceResponseSchema>;
