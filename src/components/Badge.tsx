"use client";

import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md";
}

export function Badge({
  children,
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.75 font-display font-semibold tracking-tight uppercase text-xs",
        size === "sm" ? "px-2 py-0.6 text-[0.7rem]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")
        .trim()}
      {...props}
    >
      {children}
    </span>
  );
}

export interface LabelProps extends React.HTMLAttributes<HTMLLabelElement> {}
export function Label({ children, ...props }: LabelProps) {
  return (
    <label {...props} className="field-label">
      {children}
    </label>
  );
}
