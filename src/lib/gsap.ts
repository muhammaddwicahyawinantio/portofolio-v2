import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Registrasi sekali di titik ini; komponen animasi import dari sini, bukan dari "gsap".
// SplitText sudah ikut paket gsap publik sejak 3.13, jadi tidak perlu lisensi Club.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Bilah URL ponsel yang muncul/hilang saat digulir MENGUBAH TINGGI VIEWPORT,
  // dan tiap perubahan itu memicu ScrollTrigger.refresh(): semua pin dihitung
  // ulang di tengah scroll, dan section yang sedang dipaku tersentak. Ini
  // penyebab paling umum "animasi ngelag di HP" pada situs ber-pin.
  // ignoreMobileResize membuat ScrollTrigger mengabaikan resize yang HANYA
  // mengubah tinggi di perangkat sentuh; rotasi layar (yang mengubah lebar)
  // tetap memicu refresh seperti biasa.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText };
