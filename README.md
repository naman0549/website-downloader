# 🌐 Website Downloader

Download an entire website for offline viewing.

This tool downloads a webpage along with all of its assets—including CSS, JavaScript, images, videos, fonts, icons, and audio files—then automatically rewrites all asset links so everything works locally without an internet connection.

> Perfect for creating offline copies of websites, testing layouts locally, learning frontend code, or archiving static webpages.

---

## ✨ Features

- 📄 Downloads HTML pages
- 🎨 Downloads CSS files
- ⚡ Downloads JavaScript files
- 🖼 Downloads images
- 🎥 Downloads videos
- 🔊 Downloads audio files
- 🔤 Downloads fonts
- 🖼 Downloads favicons and icons
- 🔗 Automatically rewrites asset URLs
- 📦 Optional ZIP export
- ⚛ Supports JavaScript-rendered websites using Playwright (`--render`)
- 📁 Organizes assets into separate folders
- 📊 Live download progress

---

# Installation

Clone the repository and install dependencies.

```bash
git clone <repo-url>
cd Website-downloader
npm install
```

---

# Usage

```bash
node cli.js <url> [options]
```

### Options

| Option | Description |
|---------|-------------|
| `--out <folder>` | Output folder name |
| `--zip` | Create a ZIP archive after downloading |
| `--render` | Render JavaScript using Playwright before downloading |

---

## Examples

Download a normal website:

```bash
node cli.js https://example.com
```

Download and save into a custom folder:

```bash
node cli.js https://example.com --out my-site
```

Download and automatically create a ZIP archive:

```bash
node cli.js https://example.com --zip
```

Download a React, Vue, Angular, or Next.js website:

```bash
node cli.js https://app.example.com --render
```

---

# JavaScript Rendering (`--render`)

Modern frameworks like:

- React
- Vue
- Angular
- Next.js
- Nuxt
- SvelteKit

usually send an almost empty HTML page and generate the real content using JavaScript.

A normal HTTP request only receives something like:

```html
<div id="root"></div>
```

Using the `--render` option launches a headless Chromium browser through **Playwright**, allowing the page to fully load before downloading.

The downloader will:

- Launch Chromium
- Load the webpage
- Wait for network activity to finish
- Scroll once to trigger lazy-loaded assets
- Capture the fully rendered HTML
- Download all discovered resources

---

## Playwright Setup

Playwright only needs to be installed once.

```bash
npx playwright install chromium
```

---

# Output Structure

```
website/
│
├── index.html
├── css/
├── js/
├── images/
├── videos/
├── audio/
├── fonts/
└── icons/
```

Every downloaded asset is automatically linked from the local HTML.

You can simply open:

```
index.html
```

inside your browser to browse the website offline.

---

# How It Works

```
Website
      │
      ▼
 Download HTML
      │
      ▼
 Parse Assets
      │
      ▼
 Download CSS
 Download JS
 Download Images
 Download Videos
 Download Fonts
 Download Icons
      │
      ▼
 Rewrite URLs
      │
      ▼
 Save Offline Website
      │
      ▼
 Optional ZIP Archive
```

---

# Project Structure

```
server/
│
├── downloader.js
├── parser.js
├── assets.js
├── rewrite.js
├── zip.js

cli.js
```

### `server/downloader.js`

Downloads the webpage, coordinates asset discovery, and generates the final offline version.

### `server/parser.js`

Parses HTML using **Cheerio** and discovers all downloadable resources.

### `server/assets.js`

Downloads individual assets, determines their type, and stores them in the correct folder.

### `server/rewrite.js`

Converts every remote URL into a local relative path.

### `server/zip.js`

Creates a ZIP archive of the downloaded website.

### `cli.js`

Provides the command-line interface with a live progress bar.

---

# Supported Assets

✅ HTML

✅ CSS

✅ JavaScript

✅ Images

✅ SVG

✅ Fonts

✅ Icons

✅ Audio

✅ Video

✅ CSS `url(...)`

✅ `@font-face`

✅ Inline styles

✅ `background-image`

✅ `srcset`

✅ Relative URLs

✅ Absolute URLs

---

# Limitations

This tool downloads **static snapshots** of websites.

Some websites may not work perfectly offline.

Examples include:

- Login-protected websites
- Infinite scrolling pages
- Live dashboards
- Streaming media
- Pages requiring API requests
- Sites protected by anti-bot systems

Even with `--render`, only the content visible during rendering is downloaded.

Dynamic interactions after page load (clicks, forms, user sessions, etc.) are **not** automatically captured.

---

# Future Improvements

- Multi-page website crawling
- Download entire domains
- Cookie/session support
- Login support
- Sitemap crawling
- Retry failed downloads
- Parallel downloads
- Resume interrupted downloads
- Download statistics
- Config file support

---

# Disclaimer

This tool is intended for educational purposes, offline backups, testing, and archiving publicly accessible websites.

Always respect website terms of service, robots.txt policies where applicable, and copyright laws before downloading content.

---

# License

MIT License
