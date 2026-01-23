"use client";

import { useTranslations } from "next-intl";
import { SESSION_TITLE_PRESETS } from "@/lib/constants/workout";

interface SessionTitleDisplayProps {
  title: string;
}

/**
 * Displays a session title with translation support for preset values.
 * - If the title is a preset enum value (e.g., "warm_up"), it translates it
 * - If the title is a custom value or existing translated data, it displays as-is
 */
export function SessionTitleDisplay({ title }: SessionTitleDisplayProps) {
  const t = useTranslations("sessionTitle");

  // If it's a preset value, translate it
  if (Object.values(SESSION_TITLE_PRESETS).includes(title as any)) {
    return <>{t(`presets.${title}`)}</>;
  }

  // Otherwise return as-is (custom titles or existing translated data)
  return <>{title}</>;
}
