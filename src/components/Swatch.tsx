"use client";

import * as React from "react";

export interface SwatchProps {
  value: string;
  active: boolean;
  onSelect: (value: string) => void;
}

export function Swatch({ value, active, onSelect }: SwatchProps) {
  return (
    <button
      className="swatch"
      data-active={active}
      onClick={() => onSelect(value)}
      title={value}
      style={{ backgroundColor: value }}
    />
  );
}

export interface SegmentedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

export function SegmentedButton({ active, children, ...props }: SegmentedButtonProps) {
  return (
    <button className="segmented" data-active={active} {...props}>
      {children}
    </button>
  );
}

export interface BadgeColoredProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: "lime" | "violet" | "rose";
}

export function BadgeColored({
  children,
  color = "lime",
  className = "",
  ...props
}: BadgeColoredProps) {
  const colorMap: Record<string, string> = {
    lime: "bg-lime text-midnight",
    violet: "bg-violet text-white",
    rose: "bg-rose text-white",
  };
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.75 font-display font-semibold tracking-tight uppercase text-xs",
        colorMap[color],
        className,
      ].filter(Boolean).join(" ").trim()}
      {...props}
    >
      {children}
    </span>
  );
}
