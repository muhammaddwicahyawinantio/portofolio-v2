import "server-only";

import { prisma } from "@/lib/prisma";
import Reveal from "@/components/animations/Reveal";
import ShareYourStoryForm from "@/components/contact/ShareYourStoryForm";
import TestimonialsCarousel, {
  type StoryTestimonial,
} from "@/components/contact/TestimonialsCarousel";

/**
 * Isi section #contact homepage. ContactForm lama sengaja tidak dirender di
 * beranda lagi: di bawah "Ready to begin?" sekarang langsung masuk ke form
 * Share Your Story, lalu carousel testimonial yang sudah di-approve.
 */
export default async function ContactPanel({ locale }: { locale: string }) {
  const rows = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const testimonials: StoryTestimonial[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    position: row.position,
    content: row.content,
    rating: row.rating,
    avatar: row.avatar,
  }));

  return (
    <>
      <Reveal>
        <ShareYourStoryForm locale={locale} />
      </Reveal>

      <Reveal delay={0.1}>
        <TestimonialsCarousel testimonials={testimonials} locale={locale} />
      </Reveal>
    </>
  );
}
