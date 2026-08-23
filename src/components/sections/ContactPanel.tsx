import "server-only";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/ui/ContactForm";
import TestimonialMarquee from "@/components/sections/TestimonialMarquee";
import Reveal from "@/components/animations/Reveal";

/**
 * Menggantikan blok CTA lama di beranda ("Have something to make?" + tombol ke
 * /contact). Formulirnya kini langsung di sini, jadi pengunjung tidak perlu
 * pindah halaman untuk mengirim pesan.
 *
 * ContactForm dipakai ulang apa adanya, tanpa diubah: ia client component yang
 * memanggil server action submitMessage — keduanya tidak terikat rute mana pun,
 * dan NextIntlClientProvider di [locale]/layout.tsx sudah mengirim seluruh
 * pesan i18n ke setiap halaman.
 *
 * Halaman /contact TIDAK disentuh — ia tetap punya formulirnya sendiri.
 *
 * QR code dikelola dari CMS: Settings → Contact.
 */
export default async function ContactPanel({ locale }: { locale: string }) {
  const id = locale === "id";
  const [row, contact] = await Promise.all([
    prisma.contactSettings.findFirst(),
    getTranslations("contact"),
  ]);

  const qrLabel = (id ? row?.qrLabel_id : row?.qrLabel_en) ?? contact("qrFallback");

  return (
    <>
      {/* Tanpa eyebrow dan judul sendiri: ReadyPanel — section yang membungkus
          komponen ini — sudah membawa "+ CONTACT" dan "Ready to begin?". Dua
          kepala untuk satu ajakan adalah pengulangan, bukan penekanan. */}
      <div
        className={
          // Kolom kanan baru muncul kalau QR-nya memang sudah diunggah; sebelum
          // itu formulir memakai lebar penuh, bukan menyisakan kotak kosong.
          // items-stretch: kartu QR mengikuti tinggi formulir, jadi keduanya
          // benar-benar satu ukuran, bukan cuma sebaris.
          row?.qrImage ? "grid items-stretch gap-6 lg:grid-cols-2" : "grid gap-6"
        }
      >
        <ContactForm privacy={contact("privacy")} compact />

        {row?.qrImage ? (
          <div className="border-line bg-card rounded-card shadow-card flex h-full flex-col items-center justify-center gap-5 border p-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
            <img
              src={row.qrImage}
              alt={qrLabel}
              className="border-line rounded-card w-full max-w-[240px] border"
            />
            <p className="text-ink-soft text-[11px] font-semibold tracking-[0.2em] uppercase">
              {qrLabel}
            </p>
          </div>
        ) : null}
      </div>

      {/* Bukti sosial menutup section — dan sekaligus menutup beranda. Ditaruh
          SESUDAH formulir, bukan sebelum: yang di atas adalah ajakannya, dan
          pita yang bergerak di antara judul dan formulir akan menarik mata
          menjauh dari kolom isian. */}
      <div className="border-line mt-14 border-t pt-10 md:mt-20 md:pt-14">
        {/* Intro masuk untuk "What clients say": naik + memudar sekali saat
            pitanya menyentuh viewport. Tanpa `targets`: kartunya sudah berjalan
            sendiri lewat animasi CSS marquee, dan menganimasikannya satu per
            satu di atas itu membuat dua gerak bertabrakan. Reveal juga sudah
            membungkus matchMedia, jadi reduced-motion dapat versi diamnya. */}
        <Reveal>
          <TestimonialMarquee locale={locale} title={contact("trustedBy")} />
        </Reveal>
      </div>
    </>
  );
}
