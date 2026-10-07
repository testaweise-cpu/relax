"use server";

import { headers } from "next/headers";
import { clientIpFrom } from "@/lib/client-ip";
import { getJobs } from "@/lib/content";
import { env } from "@/lib/env";
import {
  applicationSchema,
  fieldErrors,
  validatePhotos,
  type ApplicationState,
} from "@/lib/jobs/schema";
import { getTransport, mailConfigured } from "@/lib/mail";
import { createRateLimiter } from "@/lib/rate-limit";

const limiter = createRateLimiter({
  limit: env.RATE_LIMIT_PER_HOUR,
  windowMs: 3600_000,
});

async function clientIp() {
  const h = await headers();
  return clientIpFrom((n) => h.get(n), env.TRUST_PROXY);
}

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/**
 * Bewerbung annehmen: prüfen, Spam abwehren, per SMTP versenden.
 * Es wird NICHTS gespeichert – Fotos gehen nur als Anhang in die E-Mail.
 */
export async function submitApplication(
  _prev: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  // Honeypot: Bots füllen das versteckte Feld aus → stillschweigend "Erfolg"
  if (String(formData.get("website") ?? "").length > 0)
    return { status: "success" };

  const { minAge } = await getJobs();
  const parsed = applicationSchema(minAge).safeParse(
    Object.fromEntries(formData),
  );
  const photos = validatePhotos(
    formData.getAll("photos").filter((f): f is File => f instanceof File),
  );
  if (!parsed.success || !photos.ok) {
    return {
      status: "error",
      reason: "invalid",
      fields: {
        ...(parsed.success ? {} : fieldErrors(parsed.error)),
        ...(photos.ok ? {} : { photos: "photos" }),
      },
    };
  }

  if (!limiter.check(await clientIp()))
    return { status: "error", reason: "rateLimited" };
  if (!mailConfigured()) {
    console.error(
      "[jobs] SMTP nicht konfiguriert (SMTP_HOST, SMTP_FROM, JOBS_MAIL_TO)",
    );
    return { status: "error", reason: "notConfigured" };
  }

  const d = parsed.data;
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Alter", String(d.age)],
    ["Kontakt", d.contact],
    ["Sprachen", d.languages],
    ["Zeitraum", d.period],
    ["Nachricht", d.message],
  ];
  try {
    await getTransport().sendMail({
      from: env.SMTP_FROM,
      to: env.JOBS_MAIL_TO,
      replyTo: d.contact.includes("@") ? d.contact : undefined,
      subject: `Bewerbung über mona-roses.com: ${d.name}`,
      text: rows.map(([k, v]) => `${k}: ${v || "–"}`).join("\n"),
      html: `<table>${rows
        .map(
          ([k, v]) =>
            `<tr><th align="left" valign="top">${k}</th><td>${esc(v || "–").replace(/\n/g, "<br>")}</td></tr>`,
        )
        .join("")}</table>`,
      attachments: await Promise.all(
        photos.files.map(async (f, i) => ({
          filename: `foto-${i + 1}.${f.type.split("/")[1].replace("jpeg", "jpg")}`,
          content: Buffer.from(await f.arrayBuffer()),
          contentType: f.type,
        })),
      ),
    });
    return { status: "success" };
  } catch (error) {
    console.error("[jobs] Versand fehlgeschlagen:", error);
    return { status: "error", reason: "error" };
  }
}
