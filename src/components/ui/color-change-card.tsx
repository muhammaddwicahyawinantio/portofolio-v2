"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useRouter } from "@/i18n/navigation";

export type ShowcaseCard = {
  slug: string;
  heading: string;
  description: string;
  image: string;
};

export default function ColorChangeCards({ cards }: { cards: ShowcaseCard[] }) {
  return (
    <div className="p-3 py-8 sm:p-4 md:p-8 md:py-12">
      {/* grid-cols-2 di semua breakpoint (bukan grid-cols-1 di mobile): satu
          kolom membuat 4 kartu menumpuk lebih tinggi dari satu layar, dan
          panel ini dipin dalam HorizontalScroll setinggi h-svh — kalau lebih
          tinggi dari layar, sisanya terpotong/tumpang tindih dengan section
          berikutnya. 2x2 tetap muat dalam satu layar di ponsel manapun. */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 sm:gap-4 md:gap-8">
        {cards.map((card) => (
          <Card key={card.slug} {...card} />
        ))}
      </div>
    </div>
  );
}

function Card({ slug, heading, description, image }: ShowcaseCard) {
  const router = useRouter();
  const [active, setActive] = useState(false);

  const openDetail = () => router.push(`/projects/${slug}`);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      transition={{ staggerChildren: 0.035 }}
      whileHover="hover"
      animate={active ? "hover" : "rest"}
      onClick={() => setActive((v) => !v)}
      onDoubleClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      }}
      className="group relative h-48 w-full cursor-pointer overflow-hidden bg-slate-300 sm:h-56 md:h-64"
    >
      <div
        className="absolute inset-0 saturate-100 transition-all duration-500 group-hover:scale-110 md:saturate-0 md:group-hover:saturate-100"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative z-20 flex h-full flex-col justify-between p-3 text-slate-300 transition-colors duration-500 group-hover:text-white md:p-4">
        <FiArrowRight className="ml-auto text-xl transition-transform duration-500 group-hover:-rotate-45 md:text-3xl" />
        <div>
          <h4>
            {heading.split("").map((letter, index) => (
              <AnimatedLetter letter={letter} key={index} />
            ))}
          </h4>
          <p className="line-clamp-2 text-xs md:text-base">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

const letterVariants: Variants = {
  rest: { y: "0%" },
  hover: { y: "-50%" },
};

function AnimatedLetter({ letter }: { letter: string }) {
  return (
    <div className="inline-block h-[22px] overflow-hidden text-lg font-semibold md:h-[36px] md:text-3xl">
      <motion.span
        className="flex min-w-[4px] flex-col"
        initial="rest"
        variants={letterVariants}
        transition={{ duration: 0.5 }}
      >
        <span>{letter}</span>
        <span>{letter}</span>
      </motion.span>
    </div>
  );
}
