/**
 * Signature "Kertas Kalkir": satu hairline vertikal di tepi kiri kolom konten,
 * setinggi halaman — tepi jilid satu set gambar teknik.
 *
 * Tidak ada tanda silang yang digambar sendiri: border atas tiap section sudah
 * melintang penuh, jadi di tiap pertemuan section garis ini terpotong olehnya
 * dan salibnya terbentuk sendiri dari dua garis yang memang sudah ada.
 *
 * Geometrinya SENGAJA menyalin Container (`max-w-[80rem]` + padding yang sama),
 * jadi garisnya jatuh persis di tepi konten berapa pun lebar layar. Kalau
 * Container berubah, dua nilai ini harus ikut — itu satu-satunya sambungan yang
 * perlu dijaga, dan lebih murah daripada menambah prop ke Container yang
 * dipakai di puluhan tempat.
 *
 * Disembunyikan di bawah md: di sana gutter cuma 20px, dan garisnya akan
 * menempel ke tepi layar alih-alih membingkai apa pun.
 *
 * Induknya WAJIB `relative`.
 */
export default function GutterRule() {
  return (
    <div
      aria-hidden
      // z-10: section penutup memasang latar `position: fixed` (ReadyPanel),
      // dan elemen berposisi yang datang belakangan di DOM melukis di atas yang
      // lebih dulu — tanpa ini garisnya tertutup di sana dan spine setinggi
      // halaman terlihat putus tepat di section terakhir. Ia lewat di atas tepi
      // kiri kartu yang kebetulan mulai persis di tepi konten, tapi ini garis
      // 1px beropacity 8%: tak terlihat sebagai tumpukan.
      className="pointer-events-none absolute inset-x-0 inset-y-0 z-10 mx-auto hidden max-w-[80rem] px-5 md:block md:px-8 lg:px-12"
    >
      <div className="bg-line h-full w-px" />
    </div>
  );
}
