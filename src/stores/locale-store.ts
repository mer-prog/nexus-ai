import { create } from "zustand";
import { locales, type Locale } from "@/i18n/config";

function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

interface LocaleState {
  locale: Locale;
  messages: Record<string, unknown>;
  setLocale: (locale: Locale) => Promise<void>;
  initLocale: () => Promise<void>;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "en",
  messages: {},
  setLocale: async (locale) => {
    const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
    set({ locale, messages });
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus-locale", locale);
      document.documentElement.lang = locale;
    }
  },
  initLocale: async () => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("nexus-locale")
        : null;
    const locale: Locale = isValidLocale(raw) ? raw : "en";
    const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
    set({ locale, messages });
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale;
    }
  },
}));
