import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registrasi sekali di titik ini; komponen animasi import dari sini, bukan dari "gsap".
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
