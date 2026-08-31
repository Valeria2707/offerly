import { Container } from "@/components/landing/container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FEATURES } from "@/constants/landing";
import { SECTIONS } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  return (
    <section id={SECTIONS.features} className="scroll-mt-16 py-20">
      <Container>
        <h2 className="sr-only">Можливості</h2>

        <ul className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <Card className="h-full">
                <CardHeader>
                  <span
                    aria-hidden
                    className={cn("mb-3 size-1.5 rounded-full", feature.accent)}
                  />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
