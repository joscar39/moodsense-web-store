// Renders docs/sources/<name>.html → docs/<name>.pdf with Playwright's Chromium.
// Usage (from the repo root): node <this file> name1 name2 ...
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repo = process.cwd();
const require = createRequire(path.join(repo, "package.json"));
const { chromium } = require("@playwright/test");

const browser = await chromium.launch();
const page = await browser.newPage();
for (const name of process.argv.slice(2)) {
  const src = path.join(repo, "docs/sources", `${name}.html`);
  await page.goto(pathToFileURL(src).href, { waitUntil: "load" });
  const out = path.join(repo, "docs", `${name}.pdf`);
  await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log("ok", out);
}
await browser.close();
