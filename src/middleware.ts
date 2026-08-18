import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

// Lewati /api, /admin (CMS satu bahasa), aset internal, dan file berekstensi.
// Titik ditulis [.] bukan \. — backslash tunggal di string TS adalah escape tak
// dikenal dan diam-diam luruh jadi ".", yang bikin regex menolak semua path.
export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*[.].*).*)"],
};
