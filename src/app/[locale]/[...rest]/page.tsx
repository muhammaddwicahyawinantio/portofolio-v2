import { notFound } from "next/navigation";

// Tanpa catch-all ini, path tak dikenal jatuh ke 404 bawaan Next (tanpa layout
// dan tanpa terjemahan) alih-alih ke [locale]/not-found.tsx.
export default function CatchAllPage() {
  notFound();
}
