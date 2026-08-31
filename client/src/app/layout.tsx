import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Кар’єра — AI-асистент для пошуку роботи та співбесід",
  description:
    "Додайте вакансію за посиланням, і AI супроводжує вас на кожному етапі: Подано → HR → Технічна → Фінальна → Оффер.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={cn(
        "h-full font-sans antialiased",
        inter.variable,
        geistMono.variable
      )}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
