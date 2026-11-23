"use client";

import * as React from "react";

export type Variant =
  | "primary"
  | "secondary"
  | "violet"
  | "outline"
  | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  fullWidth = false,
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base = [
    "btn",
    variant === "primary" ? "btn-primary" : "",
    variant === "secondary" ? "btn-secondary" : "",
    variant === "violet" ? "btn-violet" : "",
    variant === "outline" ? "btn-outline" : "",
    variant === "ghost" ? "btn-ghost" : "",
    size === "sm" ? "btn-sm" : "",
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <button className={base} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
