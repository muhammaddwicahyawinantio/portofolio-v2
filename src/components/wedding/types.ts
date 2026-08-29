import type {
  WeddingInvitation,
  WeddingEvent,
  WeddingGallery,
  WeddingGift,
  WeddingMessage,
} from "@prisma/client";

/**
 * Normalized shape the template renderer consumes. Both callers produce it:
 * the public route from its published-invitation query, and the admin preview
 * from a live draft. Derived from the Prisma models (not from a query result)
 * so templates never depend on the public read path — a new template is wired
 * up once, in one renderer.
 *
 * `messages` is whatever the caller decides to show: public passes visible-only,
 * admin preview can pass the full list.
 */
export type WeddingPreviewData = WeddingInvitation & {
  events: WeddingEvent[];
  gallery: WeddingGallery[];
  gifts: WeddingGift[];
  messages: WeddingMessage[];
};
