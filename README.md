# 🌐 Website Downloader

Download an entire website for offline viewing.

Website Downloader downloads a webpage together with all of its assets—including HTML, CSS, JavaScript, images, videos, audio, fonts, and icons—then automatically rewrites all links so everything works locally without an internet connection.

> Perfect for creating offline backups, studying website source code, testing layouts locally, or archiving publicly accessible static websites.

---

## 🌍 Online Version (GUI)

Don't want to install Node.js or use the command line?

Use the web version directly in your browser.

### 👉 https://websited-downloder-web-xi.vercel.app/

Simply:

1. Paste the website URL.
2. Click **Download**.
3. Wait for the download to complete.
4. Save the generated ZIP file.

✅ No installation required  
✅ No command line needed  
✅ Easy-to-use graphical interface

---

# ✨ Features

- 🌐 Download complete webpages
- 📄 Download HTML
- 🎨 Download CSS
- ⚡ Download JavaScript
- 🖼 Download images
- 🎥 Download videos
- 🔊 Download audio files
- 🔤 Download fonts
- ⭐ Download favicons & icons
- 🔗 Automatically rewrite all asset URLs
- 📁 Organize downloaded files into folders
- 📦 Optional ZIP export
- ⚛ Support React, Vue, Angular, Next.js and other JavaScript-rendered websites using Playwright
- 📊 Live download progress
- 💻 Cross-platform (Windows, Linux & macOS)

---

# 📦 Installation

Clone the repository and install the dependencies.

```bash
git clone https://github.com/yourusername/Website-downloader.git
cd Website-downloader
npm install
```

---

# 🚀 Usage

```bash
node cli.js <url> [options]
```

## Options

| Option | Description |
|---------|-------------|
| `--out <folder>` | Specify output folder |
| `--zip` | Create a ZIP archive |
| `--render` | Render JavaScript before downloading |

---

## Examples

### Download a normal website

```bash
node cli.js https://example.com
```

### Save into a custom folder

```bash
node cli.js https://example.com --out my-site
```

### Download and create a ZIP archive

```bash
node cli.js https://example.com --zip
```

### Download a React/Vue/Angular website

```bash
node cli.js https://app.example.com --render
```

---

# ⚛ JavaScript Rendering (`--render`)

Many modern websites built with frameworks like:

- React
- Vue
- Angular
- Next.js
- Nuxt
- SvelteKit

don't send the full HTML immediately. Instead, they send a small HTML shell such as:

```html
<div id="root"></div>
```

The page is then built in the browser using JavaScript.

Using the `--render` option launches a headless Chromium browser with Playwright to fully render the page before downloading.

The downloader will:

- Launch Chromium
- Open the webpage
- Wait until network requests finish
- Scroll once to trigger lazy-loaded content
- Capture the rendered HTML
- Download all discovered assets
- Rewrite every asset link for offline use

---

## Install Playwright

Playwright only needs to be installed once.

```bash
npx playwright install chromium
```

---

# 📂 Output Structure

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

Open `index.html` in your browser to view the downloaded website offline.

---

# 🔄 How It Works

```
Website URL
      │
      ▼
 Download HTML
      │
      ▼
 Parse Resources
      │
      ▼
Download Assets
      │
      ├── CSS
      ├── JavaScript
      ├── Images
      ├── Videos
      ├── Audio
      ├── Fonts
      └── Icons
      │
      ▼
 Rewrite URLs
      │
      ▼
 Save Offline Website
      │
      ▼
(Optional)
Create ZIP Archive
```

---

# 📁 Project Structure

```
Website-downloader/
│
├── cli.js
├── package.json
├── package-lock.json
│
├── server/
│   ├── downloader.js
│   ├── parser.js
│   ├── assets.js
│   ├── rewrite.js
│   └── zip.js
│
└── README.md
```

---

# 📚 Module Overview

### `cli.js`

Command-line interface that parses arguments and displays a live progress bar.

---

### `server/downloader.js`

Downloads the webpage, coordinates asset discovery, and generates the final offline version.

---

### `server/parser.js`

Uses Cheerio to locate downloadable assets from:

- `<img>`
- `<script>`
- `<link>`
- `<video>`
- `<audio>`
- `<source>`
- Inline CSS
- `srcset`
- CSS `url(...)`

---

### `server/assets.js`

Downloads every discovered resource, detects its type, avoids filename collisions, and stores it in the correct directory.

---

### `server/rewrite.js`

Converts every remote asset URL into a local relative path so the downloaded website works offline.

---

### `server/zip.js`

Creates a ZIP archive of the completed download.

---

# ✅ Supported Assets

- HTML
- CSS
- JavaScript
- Images
- SVG
- WebP
- GIF
- PNG
- JPEG
- Fonts
- Favicons
- Icons
- Audio
- Video
- CSS `url(...)`
- `@font-face`
- Inline styles
- Background images
- `srcset`
- Relative URLs
- Absolute URLs

---

# ⚠ Limitations

This project creates a **static snapshot** of a website.

Some websites cannot work completely offline.

Examples include:

- Login-protected websites
- User dashboards
- Infinite scrolling pages
- Live chats
- Streaming services
- Websites requiring API requests
- Dynamic databases
- Websites protected by anti-bot systems

Even with `--render`, only the content visible during page rendering is downloaded.

Interactions that happen later (clicking buttons, submitting forms, logging in, etc.) are not automatically captured.

---

# 🛣 Roadmap

Planned features include:

- Multi-page crawling
- Download entire websites
- Cookie & session support
- Login support
- Sitemap crawling
- Resume interrupted downloads
- Parallel downloading
- Retry failed downloads
- Download statistics
- Configuration file support
- Browser extension
- Docker support

---

# 🤝 Contributing

Contributions are welcome!

If you'd like to improve Website Downloader:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a Pull Request.

Bug reports and feature requests are always appreciated.

---

# ⚖ Disclaimer

This project is intended for:

- Educational purposes
- Website archiving
- Offline backups
- Learning frontend development
- Testing static websites

Please respect:

- Website Terms of Service
- Copyright laws
- Applicable local regulations

Do not use this project to download or redistribute copyrighted content without permission.

---

# 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support the Project

If you found this project useful, please consider giving it a **⭐ Star** on GitHub.

It helps the project reach more developers and motivates future improvements.

Happy Coding! 🚀