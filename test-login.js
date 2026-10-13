const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext({
    storageState: 'youtube-auth.json'
  });

  const page = await context.newPage();

  await page.goto('https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/videos/upload', {
    waitUntil: 'domcontentloaded'
  });

  console.log('Se o YouTube Studio abriu já logado, o teste funcionou.');

  await page.waitForTimeout(30000);

  await browser.close();
}

main();