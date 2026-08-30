/**
 * Math indeks sirkular untuk slider Projects Gallery — satu definisi "jalan
 * terpendek di lingkaran", bukan diimplementasikan ulang ad hoc di komponen.
 */
export function wrapIndex(i: number, n: number): number {
  return ((i % n) + n) % n;
}

export function circularDelta(from: number, to: number, n: number): number {
  const raw = wrapIndex(to - from, n);
  return raw > n / 2 ? raw - n : raw;
}
