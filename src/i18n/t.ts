import en from "./messages/en.json";
import id from "./messages/id.json";

export type Messages = typeof en;

// Compile-time check: id.json wajib punya key yang sama persis dengan en.json.
const _idMatchesEn: Messages = id;
void _idMatchesEn;

// ponytail: reader statis EN — diganti next-intl useTranslations di Fase 2.
export const messages: Messages = en;
