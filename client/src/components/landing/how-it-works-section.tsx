import { Container } from "@/components/landing/container";
import { HOW_IT_WORKS_STEPS } from "@/constants/landing";
import { SECTIONS } from "@/constants/routes";

export function HowItWorksSection() {
  return (
    <section
      id={SECTIONS.howItWorks}
      className="scroll-mt-16 border-b border-border bg-muted py-20"
    >
      <Container>
        <h2 className="text-center font-heading text-2xl font-bold tracking-tight">
          Як це працює
        </h2>

        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="font-mono text-xs text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
