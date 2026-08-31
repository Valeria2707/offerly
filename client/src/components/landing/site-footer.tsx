import { Container } from "@/components/landing/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-wrap items-center justify-between gap-2 py-6 font-mono text-xs text-subtle">
        <span>Кар’єра · AI-асистент</span>
        <span>© 2026</span>
      </Container>
    </footer>
  );
}
