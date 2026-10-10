import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AgeGate } from "@/components/age-gate/age-gate";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { StickyCall } from "@/components/layout/sticky-call";
import { clientMessages } from "@/i18n/client-messages";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { AGE_GATE_HEAD_SCRIPT } from "@/lib/age-gate";
import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: "Mona Roses",
    openGraph: {
      type: "website",
      siteName: "Mona Roses",
      locale: locale === "de" ? "de_DE" : "en_GB",
    },
    title: { default: t("defaultTitle"), template: `%s · ${t("siteName")}` },
    description: t("defaultDescription"),
  };
}

export const viewport: Viewport = {
  themeColor: "#0e0709",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const messages = clientMessages(await getMessages());

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Altersabfrage: Cookie vor dem ersten Malen prüfen (kein Aufblitzen) */}
        <script dangerouslySetInnerHTML={{ __html: AGE_GATE_HEAD_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider messages={messages}>
          <AgeGate />
          <div id="seite" className="flex min-h-dvh flex-col">
            <a
              href="#inhalt"
              className="sr-only z-50 rounded-full bg-gold px-4 py-2 font-label text-night focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
              {t("skipToContent")}
            </a>
            <Header />
            <main id="inhalt" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <StickyCall />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
