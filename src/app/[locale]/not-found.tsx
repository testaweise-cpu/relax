import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("nav");
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="font-mono text-sm tracking-widest text-gold">404</p>
      <h1 className="mt-4 text-5xl text-ink">Nicht gefunden · Not found</h1>
      <p className="mt-8">
        <Link href="/">{t("home")}</Link>
      </p>
    </main>
  );
}
