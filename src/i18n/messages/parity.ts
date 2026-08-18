import type en from "./en.json";
import id from "./id.json";

// Guard: `npm run typecheck` gagal kalau id.json kehilangan key yang ada di en.json.
export const _idMatchesEn: typeof en = id;
