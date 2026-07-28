import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'images');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const SECTIONS = [
  { name: 'dashboard',  selector: null,                          file: 'dashboard.png' },
  { name: 'tasks',      selector: 'text=Tasks',                  file: 'tasks.png' },
  { name: 'pomodoro',   selector: 'text=Pomodoro Timer',         file: 'pomodoro.png' },
  { name: 'notes',      selector: 'text=Notes',                  file: 'notes.png' },
  { name: 'analytics',  selector: 'text=Analytics',              file: 'analytics.png' },
  { name: 'calendar',   selector: 'text=Calendar',               file: 'calendar.png' },
  { name: 'music',      selector: 'text=Focus Music',            file: 'music.png' },
  { name: 'assistant',  selector: 'text=AI Assistant',           file: 'ai_assistant.png' },
  { name: 'settings',   selector: 'text=Settings',               file: 'settings.png' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1536, height: 864 });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  for (const section of SECTIONS) {
    if (section.selector) {
      console.log(`Clicking sidebar: ${section.name}`);
      try {
        await page.click(section.selector, { timeout: 5000 });
      } catch {
        // Try partial match
        const el = page.locator(`nav >> text=${section.name.charAt(0).toUpperCase() + section.name.slice(1)}`).first();
        await el.click({ timeout: 5000 });
      }
      await page.waitForTimeout(1500);
    }

    const dest = path.join(OUTPUT_DIR, section.file);
    await page.screenshot({ path: dest, fullPage: false });
    console.log(`✅  Saved: ${dest}`);
  }

  await browser.close();
  console.log('\n🎉 All screenshots saved to ./images/');
})();
