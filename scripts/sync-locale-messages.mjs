import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const messagesDir = path.join(root, "src/messages");
const enPath = path.join(messagesDir, "en.json");

const allLocales = [
  "en",
  "zh",
  "hi",
  "es",
  "fr",
  "ar",
  "pt",
  "ru",
  "ja",
  "de",
  "ko",
  "tr",
  "vi",
  "it",
  "pl",
  "uk",
  "nl",
  "id",
  "ro",
  "sv",
];

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

for (const locale of allLocales) {
  if (locale === "en") continue;
  const target = path.join(messagesDir, `${locale}.json`);
  if (fs.existsSync(target) && locale === "tr") {
    console.log(`skip ${locale} (existing translation)`);
    continue;
  }
  if (fs.existsSync(target) && ["es", "de", "fr"].includes(locale)) {
    console.log(`skip ${locale} (existing file)`);
    continue;
  }
  fs.writeFileSync(target, `${JSON.stringify(en, null, 2)}\n`);
  console.log(`wrote ${locale}.json from en`);
}
