import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MobileNav } from "@/components/site/MobileNav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="pb-20 md:pb-0">{children}</div>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
