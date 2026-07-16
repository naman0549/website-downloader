import { extractCssUrls } from "./parser.js";

/**
 * Resolves a possibly-relative URL against the page's base URL.
 * Returns null for things we shouldn't try to download (data:, mailto:, javascript:, empty anchors).
 */
export function resolveUrl(rawUrl, baseUrl) {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("tel:")
  ) {
    return null;
  }
  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return null;
  }
}

/**
 * Rewrites every url(...) reference inside a CSS string using the provided
 * lookup map (absoluteUrl -> localRelativePath). cssBaseUrl is used to resolve
 * relative urls found inside the CSS file itself.
 */
export function rewriteCssUrls(cssText, cssBaseUrl, urlMap, cssFileDepth = 0) {
  const prefix = "../".repeat(cssFileDepth); // css/ is one level deep from root, assets are siblings of css/
  return cssText.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, quote, rawUrl) => {
    if (rawUrl.startsWith("data:")) return match;
    const abs = resolveUrl(rawUrl, cssBaseUrl);
    if (!abs) return match;
    const local = urlMap.get(abs);
    if (!local) return match;
    return `url(${quote}${prefix}${local}${quote})`;
  });
}
