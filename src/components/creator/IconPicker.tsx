"use client";

import {
  Camera,
  Coffee,
  Eye,
  Flame,
  Gift,
  Ghost,
  Heart,
  Music,
  Smile,
  Sparkles,
  Star,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import { QR_ICON_OPTIONS, type QrIconKey } from "@/lib/qr-icons";

const ICONS: Record<QrIconKey, LucideIcon> = {
  wifi: Wifi,
  gift: Gift,
  eye: Eye,
  sparkles: Sparkles,
  ghost: Ghost,
  camera: Camera,
  heart: Heart,
  music: Music,
  coffee: Coffee,
  flame: Flame,
  star: Star,
  smile: Smile,
};

interface IconPickerProps {
  label: string;
  value: QrIconKey | null;
  onChange: (value: QrIconKey | null) => void;
  disabled?: boolean;
  hint?: string;
}

export function IconPicker({
  label,
  value,
  onChange,
  disabled = false,
  hint,
}: IconPickerProps) {
  return (
    <fieldset className="icon-picker" disabled={disabled}>
      <legend className="field-label">{label}</legend>
      {hint && <p className="icon-picker__hint">{hint}</p>}
      <div className="icon-picker__row" role="radiogroup" aria-label={label}>
        <button
          type="button"
          className={`icon-picker__button ${value === null ? "icon-picker__button--active" : ""}`}
          aria-label="Aucune icône"
          aria-pressed={value === null}
          title="Aucune icône"
          onClick={() => onChange(null)}
        >
          <X size={17} />
        </button>
        {QR_ICON_OPTIONS.map((option) => {
          const Icon = ICONS[option.key];
          const active = value === option.key;
          return (
            <button
              key={option.key}
              type="button"
              className={`icon-picker__button ${active ? "icon-picker__button--active" : ""}`}
              aria-label={option.label}
              aria-pressed={active}
              title={option.label}
              onClick={() => onChange(option.key)}
            >
              <Icon size={17} strokeWidth={2.2} />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
