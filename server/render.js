import { chromium } from "playwright";

/**
 * Loads a page in headless Chromium, waits for it to finish rendering
 * (network idle + a short settle delay for late-mounting components),
 * and returns the fully rendered HTML — i.e. what a real browser would
 * show, not just the initial server response.
 *
 * This is what makes React/Vue/Angular/Next.js/etc. sites downloadable:
 * the plain HTTP fetch only sees an empty shell like <div id="root"></div>;
 * this function lets the app's JS actually run first.
 */
export async function renderPage(url, { timeout = 60000, waitAfterLoadMs = 2000 } = {}) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    });

    // "load" fires once the page and its initial resources are done, and is
    // reliable even on sites with endless background activity (analytics,
    // websockets, polling) that would make "networkidle" hang forever.
    await page.goto(url, { waitUntil: "load", timeout });

    // Then try to catch a quieter moment, but don't fail the whole run if
    // the network never truly goes idle.
    try {
      await page.waitForLoadState("networkidle", { timeout: 8000 });
    } catch {
      // fine — proceed with whatever has rendered so far
    }

    // Give client-side frameworks a moment to finish mounting/lazy-loading
    // content that doesn't block the load signal (e.g. things gated behind
    // requestAnimationFrame or a setTimeout).
    await page.waitForTimeout(waitAfterLoadMs);

    // Scroll to the bottom once to trigger lazy-loaded images/sections that
    // only load on scroll (a common pattern on JS sites).
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let total = 0;
        const step = 400;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          total += step;
          if (total >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    await page.waitForTimeout(500);

    const html = await page.content();
    const finalUrl = page.url(); // in case of client-side or server redirects
    return { html, finalUrl };
  } finally {
    await browser.close();
  }
}
