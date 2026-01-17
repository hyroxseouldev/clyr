"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SESSION_TITLE_PRESETS, type SessionTitlePreset } from "@/lib/constants/workout";

interface SessionTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export function SessionTitleInput({
  value,
  onChange,
  label,
  disabled = false,
}: SessionTitleInputProps) {
  const t = useTranslations("sessionTitle");

  // Get all preset display values for comparison
  const presetDisplayValues = useMemo(() => {
    return Object.values(SESSION_TITLE_PRESETS).reduce((acc, presetKey) => {
      if (presetKey !== SESSION_TITLE_PRESETS.CUSTOM) {
        acc[t(`presets.${presetKey}`)] = presetKey;
      }
      return acc;
    }, {} as Record<string, string>);
  }, [t]);

  // Determine if current value is a preset or custom
  const isEmpty = !value;
  const isCustom = !isEmpty && !presetDisplayValues[value];
  const currentPresetKey = isEmpty ? "" : isCustom ? SESSION_TITLE_PRESETS.CUSTOM : presetDisplayValues[value];

  const handleSelectChange = (newValue: string) => {
    if (newValue === SESSION_TITLE_PRESETS.CUSTOM) {
      onChange("\u00A0"); // Use non-breaking space to distinguish from empty
    } else {
      onChange(t(`presets.${newValue}`)); // Store translated display value
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <Select
        value={currentPresetKey}
        onValueChange={handleSelectChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("label")} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SESSION_TITLE_PRESETS).map(([key, val]) => (
            <SelectItem key={val} value={val}>
              {t(`presets.${val}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentPresetKey === SESSION_TITLE_PRESETS.CUSTOM && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value || "\u00A0")}
          placeholder={t("customPlaceholder")}
          disabled={disabled}
          autoFocus
        />
      )}
    </div>
  );
}
