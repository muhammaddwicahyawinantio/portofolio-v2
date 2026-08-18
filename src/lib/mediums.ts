/**
 * Lima medium studio, dipetakan ke satu tangga nilai monokrom (gelap -> terang).
 * Dipakai bersama oleh ValueRail (rail kiri) dan Medium Index di home,
 * supaya urutan tonal di rail selalu sama dengan urutan di konten.
 */
export const MEDIUMS = [
  { key: "web", tone: "bg-ink-raised", label: "text-silver" },
  { key: "motion", tone: "bg-graphite", label: "text-paper" },
  { key: "threeD", tone: "bg-ash", label: "text-ink" },
  { key: "sound", tone: "bg-silver", label: "text-ink" },
  { key: "film", tone: "bg-paper", label: "text-ink" },
] as const;
