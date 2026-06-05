const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match ? match[1] : "";
}

if (!/<title>[^<]{20,70}<\/title>/i.test(html)) fail("Title missing or outside recommended length.");
if (!/<meta\s+name=["']description["']\s+content=["'][^"']{70,180}["']/i.test(html)) fail("Meta description missing or outside recommended length.");
if (!/<link\s+rel=["']canonical["']\s+href=["']https:\/\/fitnesslinefajas\.com\/["']/i.test(html)) fail("Canonical URL missing or unexpected.");
for (const property of ["og:title", "og:description", "og:image", "og:url", "og:type"]) {
  if (!html.includes(`property="${property}"`)) fail(`Missing Open Graph tag: ${property}`);
}
if ((html.match(/<h1\b/gi) || []).length !== 1) fail("Page must contain exactly one h1.");
if (!exists("robots.txt")) fail("robots.txt is missing.");
if (!exists("sitemap.xml")) fail("sitemap.xml is missing.");
if (!exists("style.css")) fail("style.css is missing.");
if (!exists("app.js")) fail("app.js is missing.");
if (!exists("catalog-data.js")) fail("catalog-data.js is missing.");

for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
  const tag = match[0];
  const src = attr(tag, "src");
  const alt = attr(tag, "alt");
  const isHidden = /aria-hidden=["']true["']/i.test(tag);
  const isDynamicImage = /id=["'](?:detailMainImage|zoomImage)["']/i.test(tag);
  if (!src && !isDynamicImage) fail("Image without src found.");
  if (!isHidden && !isDynamicImage && alt.trim() === "") fail(`Image missing descriptive alt: ${src}`);
  if (src && !/^(?:https?:)?\/\//i.test(src) && !exists(src.split("?")[0])) fail(`Local image not found: ${src}`);
  const isHero = /fetchpriority=["']high["']/i.test(tag);
  if (!isHero && !/loading=["']lazy["']/i.test(tag) && !/id=["'](?:detailMainImage|zoomImage)["']/i.test(tag)) {
    warn(`Image without lazy loading: ${src}`);
  }
}

for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)) {
  const ref = match[1].split("?")[0];
  if (/^(?:https?:|mailto:|tel:|#|\/$)/i.test(ref)) continue;
  if (!exists(ref)) fail(`Referenced local file not found: ${ref}`);
}

for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']*)["'][^>]*>/gi)) {
  const href = match[1].trim();
  if (href === "#" || href === "") fail(`Non-indexable or empty link found: ${match[0].slice(0, 120)}`);
  if (href.startsWith("#") && !html.includes(`id="${href.slice(1)}"`)) fail(`Anchor target not found: ${href}`);
}

for (const match of html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
  const tag = match[0];
  const text = match[1].replace(/<[^>]+>/g, "").trim();
  if (!text && !/aria-label=["'][^"']+["']/i.test(tag)) fail("Icon-only button without aria-label found.");
}

const sensitivePattern = /(sk_live|sk_test|AIza[0-9A-Za-z_-]{20,}|BEGIN PRIVATE KEY|password\s*=|secret\s*=|auth[_-]?token\s*=|access[_-]?token\s*=)/i;
for (const file of ["index.html", "style.css", "app.js", "catalog-data.js", "robots.txt", "sitemap.xml"]) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  if (sensitivePattern.test(content)) fail(`Possible sensitive value found in ${file}`);
}

const context = { window: {}, console };
vm.createContext(context);
try {
  vm.runInContext(fs.readFileSync(path.join(root, "catalog-data.js"), "utf8"), context);
  const catalog = context.window.FITNESS_LINE_CATALOG;
  if (!catalog || !Array.isArray(catalog.products) || catalog.products.length === 0) {
    fail("Catalog data did not load products.");
  }
} catch (error) {
  fail(`catalog-data.js is not valid JavaScript: ${error.message}`);
}

if (warnings.length) {
  console.warn("Warnings:");
  warnings.forEach((message) => console.warn(`- ${message}`));
}

if (errors.length) {
  console.error("Validation failed:");
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("Validation passed.");
