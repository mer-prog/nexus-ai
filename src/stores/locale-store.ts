import { create } from "zustand";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

interface LocaleState {
  locale: Locale;
  messages: Record<string, unknown>;
  setLocale: (locale: Locale) => Promise<void>;
  initLocale: () => Promise<void>;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: defaultLocale,
  messages: {},
  setLocale: async (locale) => {
    const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
    set({ locale, messages });
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus-locale", locale);
      setCookie("nexus-locale", locale, 365);
      document.documentElement.lang = locale;
    }
  },
  initLocale: async () => {
    let raw: string | null = null;
    if (typeof window !== "undefined") {
      raw = localStorage.getItem("nexus-locale") ?? getCookie("nexus-locale");
    }
    const locale: Locale = isValidLocale(raw) ? raw : defaultLocale;
    const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
    set({ locale, messages });
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale;
      localStorage.setItem("nexus-locale", locale);
      setCookie("nexus-locale", locale, 365);
    }
  },
}));
