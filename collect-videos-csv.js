const { chromium } = require('playwright');
const fs = require('fs');

const MODE = 'historical';
// Use:
// 'historical' = coletar todos os vídeos históricos
// 'incremental' = coletar apenas vídeos novos + atualizar vídeos not_available_yet

const MAX_VIDEOS_HISTORICAL = 500;
const MAX_NEW_VIDEOS_INCREMENTAL = 200;
const CSV_FILE = 'retention-results.csv';

const CONTENT_URL =
  'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/videos/upload?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

function getVideoIdFromUrl(url) {
  const match = url.match(/video\/([^/]+)/);
  return match ? match[1] : '';
}

function escapeCsv(value) {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);
  const escapedValue = stringValue.replace(/"/g, '""');

  return `"${escapedValue}"`;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function readExistingCsv() {
  if (!fs.existsSync(CSV_FILE)) {
    return new Map();
  }

  const content = fs.readFileSync(CSV_FILE, 'utf8').trim();

  if (!content) {
    return new Map();
  }

  const lines = content.split(/\r?\n/);

  if (lines.length <= 1) {
    return new Map();
  }

  const headers = parseCsvLine(lines[0]);
  const map = new Map();

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    if (row.video_id) {
      map.set(row.video_id, row);
    }
  }

  return map;
}

function saveCsvFromMap(existingMap) {
  const headers = [
    'video_id',
    'video_title',
    'retention_30s',
    'status',
    'reason',
    'analytics_url',
    'first_collected_at',
    'last_collected_at'
  ];

  const lines = [headers.join(',')];

  const rows = Array.from(existingMap.values());

  for (const row of rows) {
    lines.push([
      escapeCsv(row.video_id),
      escapeCsv(row.video_title),
      escapeCsv(row.retention_30s),
      escapeCsv(row.status),
      escapeCsv(row.reason),
      escapeCsv(row.analytics_url),
      escapeCsv(row.first_collected_at),
      escapeCsv(row.last_collected_at)
    ].join(','));
  }

  fs.writeFileSync(CSV_FILE, lines.join('\n'), 'utf8');
}

async function collectVisibleVideoLinks(page, videos, seenUrls, existingMap, stopAtExisting) {
  const rows = page.locator('ytcp-video-row');
  const count = await rows.count();

  console.log(`Vídeos visíveis nesta página: ${count}`);

  let foundExistingVideo = false;

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);

    try {
      const title = await row.locator('#video-title').innerText({
        timeout: 5000
      });

      await row.hover();
      await page.waitForTimeout(300);

      const href = await row.locator('a[href*="/analytics"]').first().getAttribute('href', {
        timeout: 5000
      });

      if (!href) continue;

      const analyticsUrl = href.startsWith('http')
        ? href
        : `https://studio.youtube.com${href}`;

      const videoId = getVideoIdFromUrl(analyticsUrl);

      if (!videoId) continue;

      if (existingMap.has(videoId) && stopAtExisting) {
        console.log(`Encontrei vídeo já existente no CSV: ${title}`);
        foundExistingVideo = true;
        break;
      }

      if (seenUrls.has(analyticsUrl)) continue;

      seenUrls.add(analyticsUrl);

      videos.push({
        videoTitle: title,
        analyticsUrl,
        videoId
      });

      console.log(`${videos.length}. ${title}`);
    } catch (error) {
      console.log(`Não consegui coletar uma linha da página: ${error.message}`);
    }
  }

  return foundExistingVideo;
}

async function clickNextPage(page) {
  console.log('Tentando ir para a próxima página...');

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

        console.log(`Cliquei na próxima página usando: ${selector}`);
        await page.waitForTimeout(10000);
        return true;
      }
    } catch {
      // tenta o próximo seletor
    }
  }

  console.log('Não encontrei o botão de próxima página.');
  return false;
}

async function collectVideoLinksFromStudio(page, existingMap) {
  console.log('Abrindo página de vídeos...');

  await page.goto(CONTENT_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log('Aguardando carregar...');
  await page.waitForTimeout(10000);

  const videos = [];
  const seenUrls = new Set();

  let pageNumber = 1;

  const maxVideos =
    MODE === 'historical'
      ? MAX_VIDEOS_HISTORICAL
      : MAX_NEW_VIDEOS_INCREMENTAL;

  const stopAtExisting = MODE === 'incremental';

  while (videos.length < maxVideos) {
    console.log('-----------------------------');
    console.log(`Página ${pageNumber}`);
    console.log(`Vídeos novos coletados até agora: ${videos.length}/${maxVideos}`);

    const foundExistingVideo = await collectVisibleVideoLinks(
      page,
      videos,
      seenUrls,
      existingMap,
      stopAtExisting
    );

    if (foundExistingVideo && MODE === 'incremental') {
      console.log('Modo incremental: parei porque encontrei um vídeo que já existe no CSV.');
      break;
    }

    if (videos.length >= maxVideos) {
      break;
    }

    const clicked = await clickNextPage(page);

    if (!clicked) {
      console.log('Não foi possível avançar para outra página. Encerrando coleta de links.');
      break;
    }

    pageNumber++;
  }

  console.log('-----------------------------');
  console.log(`Total de links novos coletados: ${videos.length}`);
  console.log('-----------------------------');

  return videos;
}

function getNotAvailableVideos(existingMap) {
  const rows = Array.from(existingMap.values());

  return rows
    .filter(row => row.status === 'not_available_yet')
    .map(row => ({
      videoId: row.video_id,
      videoTitle: row.video_title,
      analyticsUrl: row.analytics_url
    }))
    .filter(row => row.videoId && row.analyticsUrl);
}

async function collectRetentionFromAnalytics(context, video) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await collectRetentionFromAnalyticsOnce(context, video, attempt);
    } catch (error) {
      console.log(`Tentativa ${attempt}/${maxAttempts} falhou para o vídeo: ${video.videoTitle}`);
      console.log(`Erro: ${error.message}`);

      if (attempt === maxAttempts) {
        throw error;
      }

      console.log('Aguardando 10 segundos antes de tentar novamente...');
      await sleep(10000);
    }
  }
}

async function collectRetentionFromAnalyticsOnce(context, video, attempt) {
  console.log('-----------------------------');
  console.log(`Coletando Analytics: ${video.videoTitle}`);
  console.log(`Tentativa: ${attempt}`);
  console.log(`URL: ${video.analyticsUrl}`);

  const analyticsPage = await context.newPage();

  try {
    await analyticsPage.goto(video.analyticsUrl, {
      waitUntil: 'load',
      timeout: 90000
    });

    console.log('Aguardando Analytics carregar...');
    await analyticsPage.waitForTimeout(25000);

    const currentUrl = analyticsPage.url();
    const videoId = getVideoIdFromUrl(currentUrl) || video.videoId;

    const pageText = await analyticsPage.locator('body').innerText({
      timeout: 20000
    });

    const retentionResult = extractRetention30s(pageText);

    const now = new Date().toISOString();

    const finalResult = {
      video_id: videoId,
      video_title: video.videoTitle,
      retention_30s: retentionResult.retention30s,
      status: retentionResult.status,
      reason: retentionResult.reason,
      analytics_url: video.analyticsUrl,
      last_collected_at: now
    };

    console.log(`Video ID: ${finalResult.video_id}`);
    console.log(`Status: ${finalResult.status}`);
    console.log(`Retenção 30s: ${finalResult.retention_30s || 'Não disponível'}`);
    console.log(`Motivo: ${finalResult.reason || '-'}`);

    return finalResult;
  } finally {
    await analyticsPage.close().catch(() => {});
  }
}

function upsertResult(existingMap, result) {
  const existing = existingMap.get(result.video_id);

  const now = new Date().toISOString();

  existingMap.set(result.video_id, {
    video_id: result.video_id,
    video_title: result.video_title || existing?.video_title || '',
    retention_30s: result.retention_30s || '',
    status: result.status || '',
    reason: result.reason || '',
    analytics_url: result.analytics_url || existing?.analytics_url || '',
    first_collected_at: existing?.first_collected_at || now,
    last_collected_at: result.last_collected_at || now
  });
}

async function main() {
  console.log(`Modo selecionado: ${MODE}`);

  const existingMap = readExistingCsv();

  console.log(`Vídeos já existentes no CSV: ${existingMap.size}`);

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

  const listingPage = await context.newPage();

  const newVideos = await collectVideoLinksFromStudio(listingPage, existingMap);

  await listingPage.close().catch(() => {});

  let videosToProcess = [...newVideos];

  if (MODE === 'incremental') {
    const notAvailableVideos = getNotAvailableVideos(existingMap);

    console.log(`Vídeos com status not_available_yet para reprocessar: ${notAvailableVideos.length}`);

    const alreadyInQueue = new Set(videosToProcess.map(video => video.videoId));

    for (const video of notAvailableVideos) {
      if (!alreadyInQueue.has(video.videoId)) {
        videosToProcess.push(video);
      }
    }
  }

  videosToProcess = videosToProcess.filter(video => {
    const existing = existingMap.get(video.videoId);

    if (existing && existing.status === 'success') {
      console.log(`Pulando vídeo já coletado com sucesso: ${video.videoTitle}`);
      return false;
    }

    return true;
  });

  console.log('-----------------------------');
  console.log(`Total de vídeos que serão processados agora: ${videosToProcess.length}`);
  console.log('-----------------------------');

  for (let i = 0; i < videosToProcess.length; i++) {
    try {
      console.log(`Processando ${i + 1}/${videosToProcess.length}`);

      const result = await collectRetentionFromAnalytics(context, videosToProcess[i]);

      upsertResult(existingMap, result);
      saveCsvFromMap(existingMap);

      console.log('CSV atualizado.');
    } catch (error) {
      console.log(`Erro ao coletar vídeo ${i + 1}: ${error.message}`);

      const video = videosToProcess[i];

      if (video.videoId) {
        upsertResult(existingMap, {
          video_id: video.videoId,
          video_title: video.videoTitle,
          retention_30s: '',
          status: 'error',
          reason: error.message,
          analytics_url: video.analyticsUrl,
          last_collected_at: new Date().toISOString()
        });

        saveCsvFromMap(existingMap);
      }
    }
  }

  console.log('-----------------------------');
  console.log('Finalizado.');
  console.log(`Total atual no CSV: ${existingMap.size}`);
  console.log(`Arquivo atualizado: ${CSV_FILE}`);
  console.log('O navegador vai fechar em 30 segundos.');

  await sleep(30000);

  await browser.close();
}

main().catch(error => {
  console.error('Erro técnico no script:');
  console.error(error);
  process.exit(1);
});