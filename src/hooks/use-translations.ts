"use client";

import { useCallback } from "react";
import { useLocaleStore } from "@/stores/locale-store";

/**
 * Client-side translation hook.
 * Usage: const t = useT("dashboard");
 *        t("title") => "Dashboard" or "ダッシュボード"
 */
export function useT(namespace?: string) {
  const messages = useLocaleStore((s) => s.messages);

  return useCallback(
    (key: string, params?: Record<string, string | number>) => {
      // Navigate to the namespace
      let scope: unknown = messages;
      if (namespace) {
        for (const part of namespace.split(".")) {
          if (scope && typeof scope === "object" && part in scope) {
            scope = (scope as Record<string, unknown>)[part];
          } else {
            return key;
          }
        }
      }

      // Get the value
      const parts = key.split(".");
      let value: unknown = scope;
      for (const part of parts) {
        if (value && typeof value === "object" && part in value) {
          value = (value as Record<string, unknown>)[part];
        } else {
          return key;
        }
      }

      if (typeof value !== "string") return key;

      // Replace params
      if (params) {
        let result = value;
        for (const [pKey, pValue] of Object.entries(params)) {
          result = result.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pValue));
        }
        return result;
      }

      return value;
    },
    [messages, namespace]
  );
}
