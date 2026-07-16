# Website Downloader

Downloads a webpage together with its CSS, JS, images, videos, fonts, and
icons, rewrites all the links to point at the local copies, and saves a
folder (optionally zipped) that opens and works offline.

## Setup

```bash
npm install
```

## Usage

```bash
node cli.js <url> [--out <folder>] [--zip]
```

Examples:

```bash
node cli.js https://example.com
node cli.js https://example.com --out my-site --zip
```

If `--out` is omitted, the folder is named after the site's hostname.
Pass `--zip` to also produce `<folder>.zip`.

## Output structure

```
website/
├── index.html
├── css/
├── js/
├── images/
├── fonts/
├── videos/
└── audio/
```

All `<link href>`, `<script src>`, `<img src>`, `srcset`, inline
`style="background:url(...)"`, and CSS `url(...)` references (including
`@font-face` and `background-image` inside downloaded `.css` files) are
rewritten to the local relative paths.

## How it works

1. **server/downloader.js** – fetches the HTML, orchestrates asset
   discovery/download, and writes the final rewritten HTML.
2. **server/parser.js** – uses Cheerio to find every asset-referencing tag
   and attribute in the HTML, plus `url(...)` refs inside `<style>` and
   `style=""`.
3. **server/assets.js** – downloads a single asset with axios, guesses its
   type by extension/content-type, and saves it into the right subfolder
   with a collision-safe filename.
4. **server/rewrite.js** – resolves relative URLs against the page's base
   URL and rewrites `url(...)` references inside CSS text.
5. **server/zip.js** – zips the output folder with `archiver`.
6. **cli.js** – command-line interface with a live progress bar
   (`cli-progress`).

## Limitations

This is a static, single-page downloader. It will **not** fully work on
sites that:
- Render their content with client-side JavaScript (React/Vue apps, etc.)
- Require a login/session to load resources
- Load data from APIs after the page runs
- Stream media rather than serving downloadable files
- Actively block automated scraping

For JS-rendered pages, swap the `axios.get` HTML fetch in
`server/downloader.js` for a headless browser (Playwright/Puppeteer) that
renders the page first, then feed the rendered HTML into the same
parsing/downloading pipeline. Multi-page crawling can be added by queuing
same-origin links found in each downloaded page.
