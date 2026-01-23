"use client";

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
import { SESSION_TITLE_PRESETS } from "@/lib/constants/workout";

// Type for preset values excluding "custom"
type SessionTitlePresetValue = "warm_up" | "cool_down" | "aerobics" | "main_workout" | "accessory";

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

  // All valid preset values (excluding CUSTOM which is for UI state)
  const validPresetValues: SessionTitlePresetValue[] = [
    SESSION_TITLE_PRESETS.WARM_UP,
    SESSION_TITLE_PRESETS.COOL_DOWN,
    SESSION_TITLE_PRESETS.AEROBICS,
    SESSION_TITLE_PRESETS.MAIN_WORKOUT,
    SESSION_TITLE_PRESETS.ACCESSORY,
  ];

  // Determine if current value is a preset or custom
  // Check if value is a valid preset enum value (e.g., "warm_up")
  const isPreset = validPresetValues.includes(value as SessionTitlePresetValue);
  const isEmpty = !value || value === "\u00A0"; // Also check for non-breaking space
  const currentPresetKey = isEmpty ? "" : isPreset ? value : SESSION_TITLE_PRESETS.CUSTOM;

  const handleSelectChange = (newValue: string) => {
    if (newValue === SESSION_TITLE_PRESETS.CUSTOM) {
      onChange("\u00A0"); // Use non-breaking space to distinguish from empty
    } else {
      onChange(newValue); // Store enum value directly (e.g., "warm_up")
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
