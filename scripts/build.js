const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const baseFiles = [
  "index.html",
  "style.css",
  "app.js",
  "catalog-data.js",
  "robots.txt",
  "sitemap.xml",
  "vercel.json"
];

const assetReferences = new Set();
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
  const ref = match[1].split("?")[0].split("#")[0];
  if (!ref || /^(?:https?:|mailto:|tel:|\/$)/i.test(ref)) continue;
  assetReferences.add(ref);
}

assetReferences.add("components/AnimatedShowcaseWindows.js");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(dist, relativePath);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing build file: ${relativePath}`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

for (const file of baseFiles) copyFile(file);
for (const file of assetReferences) {
  if (file.startsWith("#")) continue;
  if (fs.existsSync(path.join(root, file))) copyFile(file);
}

const copiedFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolute);
    } else {
      copiedFiles.push(path.relative(dist, absolute).replace(/\\/g, "/"));
    }
  }
}
walk(dist);

console.log(`Build complete: ${copiedFiles.length} files copied to dist.`);
