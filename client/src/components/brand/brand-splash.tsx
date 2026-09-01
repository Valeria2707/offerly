import { LogoMark } from "@/components/brand/logo";

export function BrandSplash() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24">
      <LogoMark className="size-10 animate-pulse text-foreground" />

      <div className="grid gap-2 text-center">
        <span className="font-heading text-2xl font-bold tracking-[0.22em] uppercase">
          Offerly
        </span>
        <span className="font-mono text-[10px] tracking-[0.22em] text-subtle uppercase">
          AI career assistant
        </span>
      </div>
    </div>
  );
}
