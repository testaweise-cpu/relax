"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState, type ReactNode } from "react";
import { submitApplication } from "@/app/[locale]/jobs/actions";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import {
  applicationSchema,
  fieldErrors,
  PHOTO_TYPES,
  validatePhotos,
  type ApplicationState,
  type FieldName,
} from "@/lib/jobs/schema";
import { Button } from "../ui/button";

const input =
  "mt-2 block w-full rounded-lg border bg-night px-4 py-3 text-ink placeholder:text-muted/70 focus-visible:outline-2 focus-visible:outline-gold";

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-label text-sm tracking-wide text-ink">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-sunset" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ApplicationForm({ minAge }: { minAge: number }) {
  const t = useTranslations("jobs.form");
  const [state, action, pending] = useActionState<ApplicationState, FormData>(
    submitApplication,
    {
      status: "idle",
    },
  );
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<FieldName, string>>
  >({});
  const [files, setFiles] = useState<string[]>([]);
  const errors = {
    ...(state.status === "error" ? state.fields : {}),
    ...clientErrors,
  };
  const msg = (key: FieldName) =>
    errors[key] ? t(`errors.${key}`, { min: minAge }) : undefined;
  const aria = (key: FieldName, hint = false) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key]
      ? `${key}-error`
      : hint
        ? `${key}-hint`
        : undefined,
    className: cn(input, errors[key] ? "border-sunset" : "border-line"),
  });

  // Dieselbe Prüfung wie auf dem Server, schon vor dem Absenden
  const validate = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const parsed = applicationSchema(minAge).safeParse(Object.fromEntries(fd));
    const photos = validatePhotos(
      fd.getAll("photos").filter((f): f is File => f instanceof File),
    );
    const next = {
      ...(parsed.success ? {} : fieldErrors(parsed.error)),
      ...(photos.ok ? {} : { photos: "photos" }),
    };
    setClientErrors(next);
    return Object.keys(next).length === 0;
  };

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-card border border-mint/60 bg-panel p-6 text-lg text-mint"
      >
        {t("success")}
      </div>
    );
  }

  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        if (!validate(e.currentTarget)) e.preventDefault();
      }}
      className="grid gap-5 sm:grid-cols-2"
    >
      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-sunset/60 bg-panel p-4 text-sunset sm:col-span-2"
        >
          {t(state.reason)}
        </p>
      )}

      <Field id="name" label={t("name")} error={msg("name")} required>
        <input
          id="name"
          name="name"
          autoComplete="nickname"
          required
          maxLength={60}
          {...aria("name")}
        />
      </Field>
      <Field
        id="age"
        label={t("age")}
        hint={t("ageHint", { min: minAge })}
        error={msg("age")}
        required
      >
        <input
          id="age"
          name="age"
          type="number"
          inputMode="numeric"
          min={minAge}
          max={99}
          required
          {...aria("age", true)}
        />
      </Field>
      <Field
        id="contact"
        label={t("contact")}
        hint={t("contactHint")}
        error={msg("contact")}
        required
      >
        <input
          id="contact"
          name="contact"
          autoComplete="tel"
          required
          maxLength={120}
          {...aria("contact", true)}
        />
      </Field>
      <Field
        id="languages"
        label={t("languages")}
        hint={t("languagesHint")}
        error={msg("languages")}
      >
        <input
          id="languages"
          name="languages"
          maxLength={120}
          {...aria("languages", true)}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field
          id="period"
          label={t("period")}
          hint={t("periodHint")}
          error={msg("period")}
        >
          <input
            id="period"
            name="period"
            maxLength={120}
            {...aria("period", true)}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="message" label={t("message")} error={msg("message")}>
          <textarea
            id="message"
            name="message"
            rows={5}
            maxLength={2000}
            {...aria("message")}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field
          id="photos"
          label={t("photos")}
          hint={t("photosHint")}
          error={msg("photos")}
        >
          {/* eigener Knopf: der des Browsers folgt dessen Sprache, nicht der Seite */}
          <div
            className={cn(
              "mt-2 flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-night px-4 py-3 focus-within:outline-2 focus-within:outline-gold",
              errors.photos ? "border-sunset" : "border-line",
            )}
          >
            <input
              id="photos"
              name="photos"
              type="file"
              accept={PHOTO_TYPES.join(",")}
              multiple
              {...aria("photos", true)}
              className="sr-only"
              onChange={(e) =>
                setFiles(
                  Array.from(e.currentTarget.files ?? []).map((f) => f.name),
                )
              }
            />
            <label
              htmlFor="photos"
              className="cursor-pointer rounded-card border border-gold/45 px-4 py-2 font-label text-xs tracking-[0.2em] text-ink uppercase transition-colors hover:border-gold"
            >
              {t("photosChoose")}
            </label>
            <span className="min-w-0 truncate text-sm text-muted">
              {files.length > 0 ? files.join(", ") : t("photosNone")}
            </span>
          </div>
        </Field>
      </div>

      {/* Honeypot – für Menschen unsichtbar */}
      <div
        aria-hidden
        className="absolute left-[-10000px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">{t("honeypot")}</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="sm:col-span-2">
        <label className="flex gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-1 size-5 shrink-0 accent-red"
          />
          <span>
            {t("consent")} <Link href="/datenschutz">{t("consentLink")}</Link>.
            <span className="text-gold"> *</span>
          </span>
        </label>
        {errors.consent && (
          <p
            id="consent-error"
            className="mt-1 text-sm text-sunset"
            role="alert"
          >
            {msg("consent")}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? t("sending") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
