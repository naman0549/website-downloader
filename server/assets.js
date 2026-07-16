import axios from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const EXT_TO_FOLDER = {
  css: "css",
  js: "js", mjs: "js",
  png: "images", jpg: "images", jpeg: "images", gif: "images",
  webp: "images", bmp: "images", avif: "images", ico: "images",
  svg: "images",
  mp4: "videos", webm: "videos", ogv: "videos", mov: "videos",
  mp3: "audio", wav: "audio", ogg: "audio",
  woff: "fonts", woff2: "fonts", ttf: "fonts", otf: "fonts", eot: "fonts",
  pdf: "pdfs",
};

const CONTENT_TYPE_TO_EXT = {
  "text/css": "css",
  "application/javascript": "js",
  "text/javascript": "js",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "font/woff": "woff",
  "font/woff2": "woff2",
  "font/ttf": "ttf",
  "font/otf": "otf",
  "application/pdf": "pdf",
};

export function guessExt(urlStr, contentType) {
  try {
    const u = new URL(urlStr);
    const base = path.basename(u.pathname);
    const ext = path.extname(base).replace(".", "").toLowerCase();
    if (ext && EXT_TO_FOLDER[ext]) return ext;
  } catch {
    /* ignore */
  }
  if (contentType) {
    const clean = contentType.split(";")[0].trim().toLowerCase();
    if (CONTENT_TYPE_TO_EXT[clean]) return CONTENT_TYPE_TO_EXT[clean];
  }
  return "bin";
}

export function folderForExt(ext) {
  return EXT_TO_FOLDER[ext] || "misc";
}

export function safeFileName(urlStr, ext) {
  let base;
  try {
    const u = new URL(urlStr);
    base = path.basename(u.pathname) || "file";
  } catch {
    base = "file";
  }
  base = base.split("?")[0].split("#")[0];
  if (!base || base === "/") base = "file";
  const hasExt = path.extname(base).replace(".", "").toLowerCase() === ext;
  const nameNoExt = hasExt ? base.slice(0, -(ext.length + 1)) : base;
  const cleanName = nameNoExt.replace(/[^a-zA-Z0-9_\-\.]/g, "_").slice(0, 60) || "file";
  const hash = crypto.createHash("md5").update(urlStr).digest("hex").slice(0, 8);
  return `${cleanName}-${hash}.${ext}`;
}

export async function downloadAsset(urlStr, outputDir, { timeout = 20000 } = {}) {
  try {
    const res = await axios.get(urlStr, {
      responseType: "arraybuffer",
      timeout,
      maxRedirects: 5,
      validateStatus: (s) => s >= 200 && s < 400,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WebsiteDownloader/1.0)" },
    });
    const contentType = res.headers["content-type"];
    const ext = guessExt(urlStr, contentType);
    const folder = folderForExt(ext);
    const filename = safeFileName(urlStr, ext);
    const folderPath = path.join(outputDir, folder);
    fs.mkdirSync(folderPath, { recursive: true });
    const filePath = path.join(folderPath, filename);
    fs.writeFileSync(filePath, res.data);
    return `${folder}/${filename}`;
  } catch (err) {
    return null;
  }
}
