import type { WeddingPreviewData } from "@/components/wedding/types";
import Eyebrow from "@/components/wedding/shared/Eyebrow";
import CopyButton from "@/components/wedding/shared/CopyButton";
import SafeImage from "@/components/wedding/shared/SafeImage";

export default function GiftSlide({ gifts }: { gifts: WeddingPreviewData["gifts"] }) {
  if (gifts.length === 0) return null;
  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>Wedding Gift</Eyebrow>
        <p className="mb-8 text-center text-sm leading-relaxed opacity-80">
          Doa restu Anda merupakan karunia yang sangat berarti. Jika memberi lebih, Anda dapat mengirim tanda kasih
          melalui:
        </p>
        <div className="flex flex-col gap-4">
          {gifts.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl border border-[var(--w-accent)]/30 bg-white/40 p-6 text-center backdrop-blur-sm"
            >
              {g.providerName ? <p className="font-medium text-[var(--w-primary)]">{g.providerName}</p> : null}
              {g.accountNumber ? (
                <>
                  <p className="mt-2 font-[family-name:var(--w-font-display)] text-2xl tracking-wider">
                    {g.accountNumber}
                  </p>
                  {g.accountName ? <p className="text-xs opacity-70">a.n. {g.accountName}</p> : null}
                  <div className="mt-3 flex justify-center">
                    <CopyButton value={g.accountNumber} />
                  </div>
                </>
              ) : null}
              {g.address ? <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{g.address}</p> : null}
              {g.qrImage ? (
                <SafeImage src={g.qrImage} alt="QRIS" className="mx-auto mt-3 h-48 w-48 object-contain" />
              ) : null}
              {g.notes ? <p className="mt-3 text-xs opacity-60">{g.notes}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
