"use client";

import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ children, hover = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "card",
        hover ? "card-hover" : "",
        className,
      ].filter(Boolean).join(" ").trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
}

export function CardHeader({ title, ...props }: CardHeaderProps) {
  return (
    <div {...props} className="px-4 py-3 border-b border-midnight/10">
      <h3 className="font-display font-semibold text-midnight-2 text-lg">{title}</h3>
    </div>
  );
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardBody({ children, ...props }: CardBodyProps) {
  return <div className="px-4 py-4" {...props}>{children}</div>;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardFooter({ children, ...props }: CardFooterProps) {
  return (
    <div className="px-4 py-3 border-t border-midnight/10 bg-midnight/20" {...props}>
      {children}
    </div>
  );
}
