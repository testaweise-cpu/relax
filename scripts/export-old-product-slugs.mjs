#!/usr/bin/env node
/**
 * Exportiert die Produkt-Slugs der alten WooCommerce-Seite als Vorlage für
 * redirects/products.json (alt → neu). Die neuen Slugs kommen aus VyceON und
 * werden von Hand eingetragen; leere Einträge leiten auf /mieterinnen.
 *
 *   node scripts/export-old-product-slugs.mjs > redirects/products.todo.json
 *
 * Hinweis: Die Liste enthält Namen echter Mieterinnen – nur lokal verwenden.
 */
const BASE = process.env.OLD_SITE ?? "https://www.mona-roses.com";
const slugs = [];
for (let page = 1; ; page++) {
  const res = await fetch(
    `${BASE}/wp-json/wp/v2/product?per_page=100&page=${page}&_fields=slug`,
  );
  if (!res.ok) break;
  const items = await res.json();
  if (!Array.isArray(items) || items.length === 0) break;
  slugs.push(...items.map((i) => i.slug));
  if (items.length < 100) break;
}
const map = Object.fromEntries(slugs.sort().map((s) => [s, ""]));
process.stdout.write(JSON.stringify({ map }, null, 2) + "\n");
console.error(`${slugs.length} alte Produkt-Slugs exportiert.`);
