import type en from "@/i18n/messages/en.json";

// Autocomplete + error saat key i18n salah ketik.
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof en;
  }
}
