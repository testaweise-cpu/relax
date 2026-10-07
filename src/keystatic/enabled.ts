/**
 * Der Keystatic-Admin ist in der Entwicklung immer erreichbar.
 * In Produktion nur im GitHub-Modus – im lokalen Modus würden Änderungen im
 * Container landen und beim nächsten Deployment verloren gehen.
 */
export const keystaticEnabled =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github";
