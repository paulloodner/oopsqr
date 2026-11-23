"use client";

import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ ...props }: InputProps) {
  return <input className="input" {...props} />;
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ ...props }: TextareaProps) {
  return <textarea className="textarea" {...props} />;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ ...props }: SelectProps) {
  return (
    <div className="relative">
      <select className="input appearance-none pr-10" {...props}>
        {props.children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-midnight/35">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
