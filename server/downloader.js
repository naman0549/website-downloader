import axios from "axios";
import fs from "fs";
import path from "path";
import { parseHtml, extractCssUrls } from "./parser.js";
import { resolveUrl, rewriteCssUrls } from "./rewrite.js";
import { downloadAsset } from "./assets.js";

/**
 * Downloads a full page (HTML + CSS + JS + images + fonts + video + icons),
 * rewrites all references to point at the local copies, and writes the
 * result to outputDir.
 *
 * @param {string} pageUrl - the page to download
 * @param {string} outputDir - folder to write the offline copy into
 * @param {(info: {stage:string, current?:number, total?:number, label?:string}) => void} onProgress
 * @param {{ html?: string, timeout?: number }} [options] - pass `html` to skip the
 *   internal fetch (e.g. when it was already obtained via a headless-browser render)
 */
export async function downloadWebsite(pageUrl, outputDir, onProgress = () => {}, options = {}) {
  fs.mkdirSync(outputDir, { recursive: true });

  let html = options.html;
  if (!html) {
    onProgress({ stage: "fetch-html", label: pageUrl });
    const htmlRes = await axios.get(pageUrl, {
      timeout: options.timeout || 20000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WebsiteDownloader/1.0)" },
    });
    html = htmlRes.data;
  }

  const { $, assets, inlineStyleUrls } = parseHtml(html);

  // Build the full list of (absoluteUrl) -> download job, deduped.
  const urlMap = new Map(); // absoluteUrl -> localRelativePath
  const jobs = new Map(); // absoluteUrl -> true (to dedupe)

  const registerUrl = (rawUrl) => {
    const abs = resolveUrl(rawUrl, pageUrl);
    if (abs && !jobs.has(abs)) jobs.set(abs, true);
    return abs;
  };

  for (const a of assets) registerUrl(a.url);
  for (const s of inlineStyleUrls) registerUrl(s.url);

  // Always try the conventional favicon location too.
  const faviconGuess = resolveUrl("/favicon.ico", pageUrl);
  if (faviconGuess) jobs.set(faviconGuess, true);

  const allUrls = Array.from(jobs.keys());
  onProgress({ stage: "downloading", total: allUrls.length, current: 0 });

  let completed = 0;
  const cssFilesToPostProcess = []; // { absUrl, localPath }

  for (const absUrl of allUrls) {
    const local = await downloadAsset(absUrl, outputDir);
    completed += 1;
    onProgress({ stage: "downloading", total: allUrls.length, current: completed, label: absUrl, ok: !!local });
    if (local) {
      urlMap.set(absUrl, local);
      if (local.startsWith("css/")) cssFilesToPostProcess.push({ absUrl, localPath: local });
    }
  }

  // Second pass: rewrite url(...) references *inside* downloaded CSS files
  // (e.g. @font-face src, background-image) so fonts/images referenced from
  // CSS also resolve locally.
  onProgress({ stage: "processing-css", total: cssFilesToPostProcess.length, current: 0 });
  let cssDone = 0;
  for (const { absUrl, localPath } of cssFilesToPostProcess) {
    const fullPath = path.join(outputDir, localPath);
    let cssText = fs.readFileSync(fullPath, "utf-8");
    const nestedUrls = extractCssUrls(cssText);
    for (const nested of nestedUrls) {
      const nestedAbs = resolveUrl(nested, absUrl);
      if (!nestedAbs || urlMap.has(nestedAbs) || jobs.has(nestedAbs)) continue;
      jobs.set(nestedAbs, true);
      const local = await downloadAsset(nestedAbs, outputDir);
      if (local) urlMap.set(nestedAbs, local);
    }
    cssText = rewriteCssUrls(cssText, absUrl, urlMap, 1); // css/ folder is 1 level deep
    fs.writeFileSync(fullPath, cssText);
    cssDone += 1;
    onProgress({ stage: "processing-css", total: cssFilesToPostProcess.length, current: cssDone });
  }

  // Rewrite the HTML DOM to point at local files.
  onProgress({ stage: "rewriting-html" });
  for (const a of assets) {
    const abs = resolveUrl(a.url, pageUrl);
    const local = abs && urlMap.get(abs);
    if (!local) continue;
    if (a.isSrcset) {
      // rewrite each url within the srcset attribute
      const newSrcset = a.rawSrcset
        .split(",")
        .map((part) => {
          const trimmed = part.trim();
          const [u, descriptor] = trimmed.split(/\s+/, 2);
          const uAbs = resolveUrl(u, pageUrl);
          const uLocal = uAbs && urlMap.get(uAbs);
          const replacement = uLocal || u;
          return descriptor ? `${replacement} ${descriptor}` : replacement;
        })
        .join(", ");
      $(a.el).attr(a.attr, newSrcset);
    } else {
      $(a.el).attr(a.attr, local);
    }
  }

  for (const s of inlineStyleUrls) {
    const abs = resolveUrl(s.url, pageUrl);
    const local = abs && urlMap.get(abs);
    if (!local) continue;
    if (s.kind === "style-tag") {
      const current = $(s.el).html() || "";
      $(s.el).html(rewriteCssUrls(current, pageUrl, urlMap, 0));
    } else {
      const current = $(s.el).attr("style") || "";
      $(s.el).attr("style", rewriteCssUrls(current, pageUrl, urlMap, 0));
    }
  }

  // Inject favicon link if the page didn't declare one but we found one at /favicon.ico
  if (faviconGuess && urlMap.has(faviconGuess) && $("link[rel*='icon']").length === 0) {
    $("head").prepend(`<link rel="icon" href="${urlMap.get(faviconGuess)}">`);
  }

  const finalHtml = $.html();
  fs.writeFileSync(path.join(outputDir, "index.html"), finalHtml, "utf-8");

  onProgress({ stage: "done" });

  return {
    outputDir,
    totalAssets: allUrls.length,
    downloadedAssets: urlMap.size,
    htmlPath: path.join(outputDir, "index.html"),
  };
}
