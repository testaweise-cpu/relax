/** Seite hinter Vollbild-Dialogen (Menü, Lightbox) nicht mitscrollen lassen. */
export function setScrollLock(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
