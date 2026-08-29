-- Existing CMS testimonials were already public before moderation existed.
UPDATE `Testimonial` SET `isActive` = true WHERE `createdAt` = `updatedAt`;
