#!/usr/bin/env node
import path from "path";
import cliProgress from "cli-progress";
import { downloadWebsite } from "./server/downloader.js";
import { zipDirectory } from "./server/zip.js";

function parseArgs(argv) {
  const args = { zip: false, render: false };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--zip") args.zip = true;
    else if (a === "--render") args.render = true;
    else if (a === "--out" || a === "-o") args.out = argv[++i];
    else positional.push(a);
  }
  args.url = positional[0];
  return args;
}

async function main() {
  const { url, out, zip, render } = parseArgs(process.argv.slice(2));

  if (!url) {
    console.error("Usage: node cli.js <url> [--out <folder>] [--zip] [--render]");
    console.error("Example: node cli.js https://example.com --out website --zip");
    console.error("Example (React/Vue/JS-heavy site): node cli.js https://app.example.com --render");
    process.exit(1);
  }

  let outputDir = out;
  if (!outputDir) {
    try {
      outputDir = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      outputDir = "website";
    }
  }
  outputDir = path.resolve(process.cwd(), outputDir);

  console.log(`Downloading ${url}`);
  console.log(`Output folder: ${outputDir}\n`);

  const bar = new cliProgress.SingleBar(
    { format: "{stage} |{bar}| {value}/{total} {label}" },
    cliProgress.Presets.shades_classic
  );
  let barStarted = false;

  const onProgress = (info) => {
    if (info.stage === "fetch-html") {
      console.log("Fetching HTML...");
    } else if (info.stage === "downloading") {
      if (!barStarted) {
        bar.start(info.total || 0, 0, { stage: "Assets", label: "" });
        barStarted = true;
      }
      bar.update(info.current, { stage: "Assets", label: shorten(info.label) });
      if (info.current === info.total) {
        bar.stop();
        barStarted = false;
      }
    } else if (info.stage === "processing-css") {
      if (info.total === 0) return;
      if (!barStarted) {
        bar.start(info.total, 0, { stage: "CSS refs", label: "" });
        barStarted = true;
      }
      bar.update(info.current, { stage: "CSS refs", label: "" });
      if (info.current === info.total) {
        bar.stop();
        barStarted = false;
      }
    } else if (info.stage === "rewriting-html") {
      console.log("Rewriting HTML links...");
    } else if (info.stage === "done") {
      console.log("Done downloading assets.");
    }
  };

  let html;
  let effectiveUrl = url;
  if (render) {
    console.log("Launching headless browser to render JavaScript...");
    const { renderPage } = await import("./server/render.js");
    const rendered = await renderPage(url);
    html = rendered.html;
    effectiveUrl = rendered.finalUrl;
    console.log("Rendered page captured. Downloading assets...\n");
  }

  const result = await downloadWebsite(effectiveUrl, outputDir, onProgress, { html });

  console.log(
    `\nSaved ${result.downloadedAssets}/${result.totalAssets} assets.\nHTML: ${result.htmlPath}`
  );

  if (zip) {
    const zipPath = `${outputDir}.zip`;
    console.log(`\nZipping to ${zipPath} ...`);
    await zipDirectory(outputDir, zipPath);
    console.log(`Zip created: ${zipPath}`);
  }

  console.log("\nOpen the folder's index.html in a browser to view it offline.");
}

function shorten(url) {
  if (!url) return "";
  return url.length > 50 ? url.slice(0, 47) + "..." : url;
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
