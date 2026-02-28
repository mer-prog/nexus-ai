"use client";

import { useCallback } from "react";
import { useLocaleStore } from "@/stores/locale-store";

const JPY_RATE = 100;

export function useFormat() {
  const locale = useLocaleStore((s) => s.locale);

  const formatCurrency = useCallback(
    (amount: number): string => {
      if (locale === "ja") {
        return new Intl.NumberFormat("ja-JP", {
          style: "currency",
          currency: "JPY",
          maximumFractionDigits: 0,
        }).format(Math.round(amount * JPY_RATE));
      }
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(amount);
    },
    [locale]
  );

  const formatNumber = useCallback(
    (value: number): string => {
      return new Intl.NumberFormat(locale === "ja" ? "ja-JP" : "en-US").format(value);
    },
    [locale]
  );

  const formatPercent = useCallback(
    (value: number): string => {
      return `${value}%`;
    },
    []
  );

  const formatDate = useCallback(
    (date: Date | string): string => {
      const d = typeof date === "string" ? new Date(date) : date;
      if (locale === "ja") {
        return new Intl.DateTimeFormat("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(d);
      }
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(d);
    },
    [locale]
  );

  const formatDateLong = useCallback(
    (date: Date | string): string => {
      const d = typeof date === "string" ? new Date(date) : date;
      if (locale === "ja") {
        return new Intl.DateTimeFormat("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(d);
      }
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    },
    [locale]
  );

  const formatDateTime = useCallback(
    (date: Date | string): string => {
      const d = typeof date === "string" ? new Date(date) : date;
      if (locale === "ja") {
        return new Intl.DateTimeFormat("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d);
      }
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    },
    [locale]
  );

  return { formatCurrency, formatNumber, formatPercent, formatDate, formatDateLong, formatDateTime, locale };
}
