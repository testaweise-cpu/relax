import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "./env";

export function mailConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_FROM && env.JOBS_MAIL_TO);
}

let transport: Transporter | undefined;

export function getTransport() {
  transport ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
    requireTLS: !env.SMTP_SECURE,
  });
  return transport;
}
