const { chromium } = require('playwright');
const fs = require('fs');

const VIDEO_ROW_NUMBER = 5; 
// Mude esse número para testar outro vídeo.
// 1 = primeiro vídeo da lista
// 2 = segundo vídeo
// 5 = quinto vídeo
// 10 = décimo vídeo

function extractRetention30s(text) {
  if (!text) {
    return {
      status: 'not_available_yet',
      retention30s: '',
      reason: 'No page text found'
    };
  }

  const retentionPatterns = [
    /(\d+(?:[.,]\d+)?)%\s+of viewers are still watching.*0:30/i,
    /(\d+(?:[.,]\d+)?)%\s+.*around.*0:30/i,
    /(\d+(?:[.,]\d+)?)%\s+.*0:30/i,
    /(\d+(?:[.,]\d+)?)%\s+dos espectadores.*0:30/i,
    /(\d+(?:[.,]\d+)?)%\s+.*marca.*0:30/i
  ];

  for (const pattern of retentionPatterns) {
    const match = text.match(pattern);

    if (match) {
      return {
        status: 'success',
        retention30s: `${match[1].replace(',', '.')}%`,
        reason: ''
      };
    }
  }

  const notAvailablePatterns = [
    /not enough data/i,
    /data is still processing/i,
    /processing/i,
    /check back later/i,
    /no data available/i,
    /dados insuficientes/i,
    /dados ainda.*processando/i,
    /processando/i,
    /volte mais tarde/i,
    /sem dados disponíveis/i
  ];

  for (const pattern of notAvailablePatterns) {
    if (pattern.test(text)) {
      return {
        status: 'not_available_yet',
        retention30s: '',
        reason: 'Retention 30s data is not available yet'
      };
    }
  }

  return {
    status: 'not_available_yet',
    retention30s: '',
    reason: 'Retention 30s card was not found on the page'
  };
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

  await page.goto(
    'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/videos/upload?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D',
    {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }
  );

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

  const index = VIDEO_ROW_NUMBER - 1;

  if (index >= count) {
    console.log(`Você escolheu o vídeo número ${VIDEO_ROW_NUMBER}, mas só existem ${count} vídeos carregados na tela.`);
    console.log('Escolha um número menor no campo VIDEO_ROW_NUMBER.');
    await browser.close();
    return;
  }

  const selectedRow = rows.nth(index);

  const title = await selectedRow.locator('#video-title').innerText({
    timeout: 5000
  });

  console.log(`Vídeo selecionado: ${title}`);
  console.log(`Linha selecionada: ${VIDEO_ROW_NUMBER}`);

  await selectedRow.hover();
  await page.waitForTimeout(2000);

  const analyticsLink = selectedRow.locator('a[href*="/analytics"]').first();

  await analyticsLink.click({
    timeout: 10000
  });

  console.log('Analytics aberto. Aguardando carregar...');
  await page.waitForTimeout(20000);

  const currentUrl = page.url();

  const videoIdMatch = currentUrl.match(/video\/([^/]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : '';

  console.log(`Video ID: ${videoId}`);

  const pageText = await page.locator('body').innerText({
    timeout: 15000
  });

  const result = extractRetention30s(pageText);

  console.log('-----------------------------');
  console.log('Resultado encontrado:');
  console.log(`Título: ${title}`);
  console.log(`Video ID: ${videoId}`);
  console.log(`Status: ${result.status}`);
  console.log(`Retenção aos 30s: ${result.retention30s || 'Não disponível'}`);
  console.log(`Motivo: ${result.reason || '-'}`);
  console.log('-----------------------------');

  if (result.status !== 'success') {
    fs.writeFileSync('page-text.txt', pageText, 'utf8');
    console.log('Como não encontramos o percentual, atualizei o arquivo page-text.txt para análise.');
  }

  console.log('O navegador vai fechar em 60 segundos.');
  await page.waitForTimeout(60000);

  await browser.close();
}

main().catch(error => {
  console.error('Erro técnico no script:');
  console.error(error);
  process.exit(1);
});