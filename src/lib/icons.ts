import {
  Building2,
  Eye,
  Gem,
  GraduationCap,
  KeyRound,
  PenTool,
  Rocket,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

/**
 * Peta emoji CMS → ikon garis Lucide.
 *
 * Murni lapisan tampilan: kolom `icon` di database tidak diubah sama sekali,
 * cuma dirender sebagai ikon teknik alih-alih emoji. Alasannya warna: emoji
 * dirender oleh font sistem dengan paletnya SENDIRI (👤 biru, 🔑 kuning), jadi
 * empat kartu benefit menyuntikkan empat warna asing ke palet yang seluruh
 * aturannya dibangun untuk menahan diri. Ikon garis mewarisi `currentColor`,
 * jadi ia ikut token seperti elemen lain.
 *
 * Dulu peta ini tinggal di dalam ServiceCard, padahal BenefitGrid dan
 * ExploreColumns membaca kolom `icon` yang sama dan sama-sama merendernya
 * mentah. Satu peta di sini, tiga pemakai — bukan tiga salinan yang bisa
 * melenceng.
 */
const ICONS: Record<string, LucideIcon> = {
  "💍": Gem,
  "🚀": Rocket,
  "🏢": Building2,
  "🎓": GraduationCap,
  "⚙️": Settings,
  "✎": PenTool,
  "👤": User,
  "🪟": Eye,
  "🔑": KeyRound,
};

/**
 * `null` untuk emoji yang tidak dikenal, bukan ikon cadangan: pemakainya
 * berbeda-beda maunya. ServiceCard jatuh ke `Shapes`, sedangkan ExploreColumns
 * jatuh ke monogram huruf yang memang sudah dipakainya untuk produk.
 */
export function iconFor(emoji: string): LucideIcon | null {
  return ICONS[emoji] ?? null;
}
