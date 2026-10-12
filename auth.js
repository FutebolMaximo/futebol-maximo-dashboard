const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://studio.youtube.com/', {
    waitUntil: 'domcontentloaded'
  });

  console.log('Faça login no YouTube Studio no navegador que abriu.');
  console.log('Quando terminar e o Studio carregar, volte aqui no terminal e aperte ENTER.');

  process.stdin.resume();

  process.stdin.on('data', async () => {
    await context.storageState({ path: 'youtube-auth.json' });
    console.log('Login salvo com sucesso no arquivo youtube-auth.json');
    await browser.close();
    process.exit(0);
  });
}

main();