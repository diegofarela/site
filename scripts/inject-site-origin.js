"use strict";

const fs = require("fs");
const path = require("path");

function fail(message, err) {
  const detail = err && err.message ? ` (${err.message})` : "";
  console.error(`[inject-site-origin] ${message}${detail}`);
  process.exit(1);
}

function normalizeOrigin(raw) {
  if (!raw || typeof raw !== "string") {
    fail("Missing origin. Pass the public site URL, e.g. https://user.github.io/repo");
  }
  const trimmed = raw.trim().replace(/\/+$/, "");
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    fail(`Invalid origin: ${trimmed}`, err);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    fail(`Origin must be http(s): ${trimmed}`);
  }
  return trimmed;
}

function toAbsolute(origin, relative, hash) {
  const cleaned = String(relative || "")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
  const hashPart = hash || "";
  if (!cleaned) return `${origin}/${hashPart}`;
  return `${origin}/${cleaned}${hashPart}`;
}

function absolutizeAttr(html, attrPattern, origin) {
  return html.replace(attrPattern, (full, pre, value, post) => {
    if (/^https?:\/\//i.test(value)) return full;
    const match = value.match(/^([^#]*)(#.*)?$/);
    const rel = match ? match[1] : value;
    const hash = match && match[2] ? match[2] : "";
    return `${pre}${toAbsolute(origin, rel, hash)}${post}`;
  });
}

function pageUrl(origin, filename) {
  if (filename === "index.html") return `${origin}/`;
  return `${origin}/${filename}`;
}

function ensureMeta(html, property, content) {
  const re = new RegExp(
    `(<meta\\s+property="${property}"\\s+content=")[^"]*("\\s*/?>)`
  );
  if (re.test(html)) {
    return html.replace(re, `$1${content}$2`);
  }
  if (/<meta\s+property="og:type"/.test(html)) {
    return html.replace(
      /(<meta\s+property="og:type"[^>]*>)/,
      `$1\n    <meta property="${property}" content="${content}" />`
    );
  }
  return html;
}

function ensureCanonical(html, href) {
  if (/rel="canonical"/.test(html)) {
    return html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${href}$2`);
  }
  if (/rel="icon"/.test(html)) {
    return html.replace(
      /(<link\s+rel="icon"[^>]*>)/,
      `$1\n    <link rel="canonical" href="${href}" />`
    );
  }
  return html.replace("</head>", `    <link rel="canonical" href="${href}" />\n  </head>`);
}

function injectFile(filePath, origin) {
  const filename = path.basename(filePath);
  let html;
  try {
    html = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    fail(`Could not read ${filePath}`, err);
  }

  html = absolutizeAttr(
    html,
    /(<meta\s+property="og:image"\s+content=")([^"]+)(")/g,
    origin
  );
  html = absolutizeAttr(
    html,
    /(<meta\s+name="twitter:image"\s+content=")([^"]+)(")/g,
    origin
  );

  if (/property="og:type"/.test(html) || /property="og:url"/.test(html)) {
    html = ensureMeta(html, "og:url", pageUrl(origin, filename));
  }

  const canonical =
    filename === "psychology.html"
      ? `${origin}/approach.html#how-i-think`
      : pageUrl(origin, filename);
  html = ensureCanonical(html, canonical);

  try {
    fs.writeFileSync(filePath, html);
  } catch (err) {
    fail(`Could not write ${filePath}`, err);
  }
  return filename;
}

function main() {
  const origin = normalizeOrigin(process.argv[2]);
  const root = path.resolve(process.argv[3] || path.join(__dirname, ".."));
  let names;
  try {
    names = fs.readdirSync(root).filter((name) => name.endsWith(".html"));
  } catch (err) {
    fail(`Could not list HTML in ${root}`, err);
  }
  if (!names.length) {
    fail(`No HTML files found in ${root}`);
  }
  const injected = names.map((name) => injectFile(path.join(root, name), origin));
  console.log(
    `[inject-site-origin] Wrote absolute origin ${origin} into ${injected.length} files: ${injected.join(", ")}`
  );
}

main();
