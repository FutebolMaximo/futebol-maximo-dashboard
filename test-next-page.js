const { chromium } = require('playwright');

const CONTENT_URL =
  'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/videos/upload?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D';

async function listVisibleVideos(page, label) {
  const rows = page.locator('ytcp-video-row');
  const count = await rows.count();

  console.log('-----------------------------');
  console.log(label);
  console.log(`Vídeos visíveis: ${count}`);

  for (let i = 0; i < Math.min(count, 5); i++) {
    try {
      const title = await rows.nth(i).locator('#video-title').innerText({
        timeout: 5000
      });

      console.log(`${i + 1}. ${title}`);
    } catch {
      console.log(`${i + 1}. Não consegui ler o título`);
    }
  }
}

async function clickNextPage(page) {
  console.log('Tentando clicar no botão de próxima página...');

  const possibleButtons = [
    'tp-yt-paper-icon-button[aria-label*="Next"]',
    'tp-yt-paper-icon-button[aria-label*="next"]',
    'tp-yt-paper-icon-button[aria-label*="Próxima"]',
    'tp-yt-paper-icon-button[aria-label*="próxima"]',
    'ytcp-icon-button[aria-label*="Next"]',
    'ytcp-icon-button[aria-label*="next"]',
    'ytcp-icon-button[aria-label*="Próxima"]',
    'ytcp-icon-button[aria-label*="próxima"]',
    '#navigate-after'
  ];

  for (const selector of possibleButtons) {
    const button = page.locator(selector).last();

    try {
      const count = await button.count();

      if (count > 0) {
        await button.click({
          timeout: 5000
        });

        console.log(`Cliquei usando o seletor: ${selector}`);
        return true;
      }
    } catch {
      // tenta o próximo seletor
    }
  }

  console.log('Não consegui encontrar o botão de próxima página.');
  return false;
}

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

  await page.goto(CONTENT_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log('Página de vídeos aberta. Aguardando carregar...');
  await page.waitForTimeout(10000);

  await listVisibleVideos(page, 'Antes de clicar em próxima página');

  const clicked = await clickNextPage(page);

  if (!clicked) {
    console.log('Teste falhou: não encontrei o botão de próxima página.');
    await page.waitForTimeout(60000);
    await browser.close();
    return;
  }

  console.log('Aguardando a próxima página carregar...');
  await page.waitForTimeout(10000);

  await listVisibleVideos(page, 'Depois de clicar em próxima página');

  console.log('Teste finalizado. O navegador vai fechar em 60 segundos.');
  await page.waitForTimeout(60000);

  await browser.close();
}

main().catch(error => {
  console.error('Erro técnico no script:');
  console.error(error);
  process.exit(1);
});