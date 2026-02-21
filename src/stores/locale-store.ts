import { create } from "zustand";
import type { Locale } from "@/i18n/config";

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
    const stored =
      typeof window !== "undefined"
        ? (localStorage.getItem("nexus-locale") as Locale | null)
        : null;
    const locale = stored ?? "en";
    const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
    set({ locale, messages });
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale;
    }
  },
}));
