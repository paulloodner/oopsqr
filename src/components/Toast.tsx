"use client";

import * as React from "react";

export interface ToastProps {
  open: boolean;
  message: string;
}

export function Toast({ open, message }: ToastProps) {
  if (!open) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
