"use client";

import * as React from "react";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "lime" | "violet";
}

export function Divider({ color = "lime", ...props }: DividerProps) {
  return (
    <div
      {...props}
      className={color === "lime" ? "divider-lime" : ""}
    />
  );
}
