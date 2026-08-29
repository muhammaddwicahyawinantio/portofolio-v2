"use client";

import { deleteTestimonial } from "@/lib/testimonials/actions";

export default function TestimonialDeleteForm({ id }: { id: string }) {
  return (
    <form
      action={deleteTestimonial}
      onSubmit={(event) => {
        if (!window.confirm("Delete this testimonial permanently?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="__id" value={id} />
      <button type="submit" className="text-danger/75 hover:text-danger text-xs transition-colors">
        Delete
      </button>
    </form>
  );
}
