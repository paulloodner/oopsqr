import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Surprise } from "@/lib/types";
import { categoryMeta } from "@/components/category-meta";

interface SurpriseCardProps {
  surprise: Surprise;
  index?: number;
}

export function SurpriseCard({ surprise }: SurpriseCardProps) {
  const { Icon, bg, fg, tint } = categoryMeta(surprise.category);
  return (
    <Link
      href={`/creer?surprise=${encodeURIComponent(surprise.id)}`}
      className="surprise-card group"
      style={{ background: tint }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ background: bg, color: fg }}
        >
          <Icon size={20} strokeWidth={2.2} />
        </span>
        <span className="category-pill" style={{ background: `${fg}14`, color: fg }}>
          {surprise.category}
        </span>
      </div>
      <h3 className="mt-3 text-lg leading-tight">{surprise.title}</h3>
      <p className="text-xs leading-relaxed text-midnight/55">{surprise.description}</p>
      <div className="mt-3 rounded-xl bg-white/75 p-2.5">
        <p className="line-clamp-2 whitespace-pre-line font-display text-[0.8rem] font-bold leading-snug text-midnight/75">
          {surprise.text}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between text-[0.7rem] font-bold">
        <span className="text-midnight/40">QR personnalisable</span>
        <span className="inline-flex items-center gap-1 text-violet-deep">
          Utiliser <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}
