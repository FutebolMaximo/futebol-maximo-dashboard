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

  if (count === 0) {
    console.log('Nenhum vídeo encontrado.');
    await browser.close();
    return;
  }

  const firstRow = rows.nth(0);

  const title = await firstRow.locator('#video-title').innerText({
    timeout: 5000
  });

  console.log(`Primeiro vídeo encontrado: ${title}`);

  console.log('Passando o mouse sobre o primeiro vídeo...');
  await firstRow.hover();
  await page.waitForTimeout(2000);

  console.log('Tentando clicar no botão de Analytics...');

  const analyticsLink = firstRow.locator('a[href*="/analytics"]').first();

  await analyticsLink.click({
    timeout: 10000
  });

  console.log('Clique realizado. Aguardando página de Analytics carregar...');
  await page.waitForTimeout(15000);

  console.log('URL atual:');
  console.log(page.url());

  console.log('Teste finalizado. O navegador vai fechar em 60 segundos.');
  await page.waitForTimeout(60000);

  await browser.close();
}

main();