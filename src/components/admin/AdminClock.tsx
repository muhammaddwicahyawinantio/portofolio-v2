"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Makassar",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Jam realtime WITA di header dashboard — server-render tanggal saja tidak
    cukup, admin butuh jam berjalan tanpa reload. */
export default function AdminClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(FORMAT.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="admin-search-chip" suppressHydrationWarning>
      <span className="admin-search-icon" aria-hidden>
        <Clock className="h-4 w-4" strokeWidth={1.7} />
      </span>
      {time ?? "--:--:--"} WITA
    </span>
  );
}
