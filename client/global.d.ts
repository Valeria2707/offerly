import type messages from "./messages/uk.json";
import type { Locale } from "@/constants/i18n";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
