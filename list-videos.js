const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext({
    storageState: 'youtube-auth.json',
    viewport: {
      width: 1600,
      height: 1000
    }
  });

  const page = await context.newPage();

  await page.goto('https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/videos/upload?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log('Página de vídeos aberta. Aguardando carregar...');

  await page.waitForTimeout(10000);

  const rows = page.locator('ytcp-video-row');
  const count = await rows.count();

  console.log(`Quantidade de vídeos encontrados na tela: ${count}`);

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);

    let title = '';

    try {
      title = await row.locator('#video-title').innerText({
        timeout: 5000
      });
    } catch (error) {
      title = 'Não consegui ler o título';
    }

    console.log(`${i + 1}. ${title}`);
  }

  console.log('Teste finalizado. O navegador vai fechar em 30 segundos.');

  await page.waitForTimeout(30000);

  await browser.close();
}

main();