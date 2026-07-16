import * as cheerio from "cheerio";

/**
 * Attribute/tag pairs that commonly reference downloadable assets.
 */
const ASSET_SELECTORS = [
  { selector: "link[rel='stylesheet']", attr: "href", type: "css" },
  { selector: "link[rel='icon']", attr: "href", type: "icon" },
  { selector: "link[rel='shortcut icon']", attr: "href", type: "icon" },
  { selector: "link[rel='apple-touch-icon']", attr: "href", type: "icon" },
  { selector: "script[src]", attr: "src", type: "js" },
  { selector: "img[src]", attr: "src", type: "image" },
  { selector: "img[data-src]", attr: "data-src", type: "image" },
  { selector: "source[src]", attr: "src", type: "media" },
  { selector: "source[srcset]", attr: "srcset", type: "media-srcset" },
  { selector: "img[srcset]", attr: "srcset", type: "media-srcset" },
  { selector: "video[poster]", attr: "poster", type: "image" },
  { selector: "video[src]", attr: "src", type: "video" },
  { selector: "audio[src]", attr: "src", type: "audio" },
  { selector: "embed[src]", attr: "src", type: "media" },
  { selector: "object[data]", attr: "data", type: "media" },
];

/**
 * Parses HTML and returns:
 *  - $ (cheerio instance, for later rewriting)
 *  - assets: [{selector info, url}]
 *  - inlineStyleUrls: css url() references found inside <style> tags / style attrs
 */
export function parseHtml(html) {
  const $ = cheerio.load(html);
  const found = [];

  for (const { selector, attr, type } of ASSET_SELECTORS) {
    $(selector).each((_, el) => {
      const val = $(el).attr(attr);
      if (!val) return;
      if (type === "media-srcset") {
        // srcset="url1 1x, url2 2x"
        const urls = val.split(",").map((part) => part.trim().split(/\s+/)[0]).filter(Boolean);
        for (const u of urls) found.push({ el, attr, type: "image", url: u, isSrcset: true, rawSrcset: val });
      } else {
        found.push({ el, attr, type, url: val });
      }
    });
  }

  // Inline <style> blocks and style="" attributes may contain url(...)
  const inlineStyleUrls = [];
  $("style").each((_, el) => {
    const css = $(el).html() || "";
    for (const url of extractCssUrls(css)) inlineStyleUrls.push({ el, kind: "style-tag", url });
  });
  $("[style]").each((_, el) => {
    const css = $(el).attr("style") || "";
    for (const url of extractCssUrls(css)) inlineStyleUrls.push({ el, kind: "style-attr", url });
  });

  // Favicon fallback if none declared
  const hasIcon = $("link[rel*='icon']").length > 0;

  return { $, assets: found, inlineStyleUrls, hasIcon };
}

/**
 * Extracts url(...) references from a chunk of CSS text.
 */
export function extractCssUrls(cssText) {
  const urls = [];
  const regex = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  let m;
  while ((m = regex.exec(cssText)) !== null) {
    const url = m[2].trim();
    if (url && !url.startsWith("data:")) urls.push(url);
  }
  return urls;
}
