const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

const REPORTS = [
  {
    name: 'DB 2023',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1678863600000%2C1704096000000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: DOWNLOADS_DIR,
    outputFile: 'DB 2023.csv'
  },
  {
    name: 'DB 2024',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1704096000000%2C1735718400000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: DOWNLOADS_DIR,
    outputFile: 'DB 2024.csv'
  },
  {
    name: 'DB 2025',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=minus_1_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: DOWNLOADS_DIR,
    outputFile: 'DB 2025.csv'
  },
  {
    name: 'DB 2026',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=current_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: DOWNLOADS_DIR,
    outputFile: 'DB 2026.csv'
  },
  {
    name: 'Shorts DB 2023',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1678863600000%2C1704096000000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: DOWNLOADS_DIR,
    outputFile: 'Shorts DB 2023.csv'
  },
  {
    name: 'Shorts DB 2024',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1704096000000%2C1735718400000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: DOWNLOADS_DIR,
    outputFile: 'Shorts DB 2024.csv'
  },
  {
    name: 'Shorts DB 2025',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=minus_1_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: DOWNLOADS_DIR,
    outputFile: 'Shorts DB 2025.csv'
  },
  {
    name: 'Shorts DB 2026',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=current_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: DOWNLOADS_DIR,
    outputFile: 'Shorts DB 2026.csv'
  },
  {
    name: 'Lives DB 2026',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27LIVE_STREAM%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=current_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: DOWNLOADS_DIR,
    outputFile: 'Lives DB 2026.csv'
  }
];

const TEMP_FOLDER = path.join(__dirname, 'temp-downloads');

function ensureFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

function validateCsvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('CSV final não foi criado.');
  }

  const stats = fs.statSync(filePath);
  if (stats.size < 100) {
    throw new Error(`CSV final parece vazio. Tamanho: ${stats.size} bytes.`);
  }

  const preview = fs.readFileSync(filePath, 'utf8').slice(0, 1000);
  if (preview.includes('<html') || preview.includes('<!DOCTYPE') || preview.includes('<body')) {
    throw new Error('CSV final parece HTML, não CSV.');
  }
}

function extractTableDataCsvFromZip(zipPath, finalCsvPath) {
  if (!fs.existsSync(zipPath)) {
    throw new Error('Arquivo ZIP temporário não encontrado.');
  }

  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  const tableEntry = entries.find(entry => {
    const normalizedName = entry.entryName.toLowerCase().replace(/\\/g, '/');
    return normalizedName.endsWith('table data.csv') || normalizedName.endsWith('dados da tabela.csv');
  });

  if (!tableEntry) {
    throw new Error('Não encontrei o arquivo CSV dentro do ZIP.');
  }

  const csvBuffer = tableEntry.getData();
  if (fs.existsSync(finalCsvPath)) {
    fs.unlinkSync(finalCsvPath);
  }

  fs.writeFileSync(finalCsvPath, csvBuffer);
  validateCsvFile(finalCsvPath);
  console.log(`CSV final salvo em: ${finalCsvPath}`);
}

async function clickDownloadButton(page) {
  console.log('Procurando botão de download...');

  const downloadSelectors = [
    'tp-yt-paper-icon-button[aria-label="Download"]',
    'tp-yt-paper-icon-button[aria-label="Fazer download"]',
    'ytcp-icon-button[aria-label="Download"]',
    'ytcp-icon-button[aria-label="Fazer download"]',
    'button[aria-label="Download"]',
    '[aria-label="Download"]',
    '[aria-label="Fazer download"]'
  ];

  for (const selector of downloadSelectors) {
    try {
      const locator = page.locator(selector).last();
      if (await locator.count() > 0 && await locator.isVisible()) {
        await locator.click({ timeout: 10000 });
        console.log(`Cliquei no botão de download usando: ${selector}`);
        await page.waitForTimeout(3000);
        return;
      }
    } catch (error) {
      // Tenta o próximo seletor
    }
  }

  const viewport = page.viewportSize();
  if (viewport) {
    await page.mouse.click(viewport.width - 45, 85);
    await page.waitForTimeout(3000);
  }
}

async function clickCsvAndDownload(page) {
  console.log('Procurando opção CSV...');

  if (page.url().includes('accounts.google.com') || page.url().includes('signin')) {
    throw new Error('Sessão expirada! O YouTube redirecionou para a tela de login do Google.');
  }

  const csvSelectors = [
    'text=Comma-separated values (.csv)',
    'text=Valores separados por vírgula (.csv)',
    'text=Comma-separated values',
    'text=Valores separados por vírgula',
    'text=.csv'
  ];

  for (const selector of csvSelectors) {
    try {
      const option = page.locator(selector).first();
      if (await option.count() > 0 && await option.isVisible()) {
        const downloadPromise = page.waitForEvent('download', { timeout: 120000 });
        await option.click({ timeout: 10000 });
        const download = await downloadPromise;

        const failure = await download.failure();
        if (failure) {
          throw new Error(`Download falhou: ${failure}`);
        }

        return download;
      }
    } catch (error) {
      // Tenta o próximo seletor
    }
  }

  throw new Error('Não consegui encontrar a opção CSV no menu suspenso.');
}

async function downloadReportWithRetry(context, report, isFirstReport) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log('-----------------------------');
      console.log(`Tentativa ${attempt}/${maxAttempts} para: ${report.name}`);
      await downloadReportOnce(context, report, isFirstReport);
      return true;
    } catch (error) {
      console.log(`Falha na tentativa ${attempt}/${maxAttempts}: ${error.message}`);
      if (attempt === maxAttempts) return false;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return false;
}

async function downloadReportOnce(context, report, isFirstReport) {
  ensureFolderExists(report.outputFolder);
  ensureFolderExists(TEMP_FOLDER);

  const finalCsvPath = path.join(report.outputFolder, report.outputFile);
  const tempZipPath = path.join(TEMP_FOLDER, `${report.name}.temp.zip`);

  const page = await context.newPage();

  try {
    await page.goto(report.url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForTimeout(isFirstReport ? 15000 : 8000);

    await clickDownloadButton(page);
    const download = await clickCsvAndDownload(page);

    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }

    await download.saveAs(tempZipPath);
    extractTableDataCsvFromZip(tempZipPath, finalCsvPath);
    if (fs.existsSync(tempZipPath)) fs.unlinkSync(tempZipPath);
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  const isCI = !!process.env.CI;
  const browser = await chromium.launch({ headless: true });

  const authFile = 'youtube-auth.json';
  const hasAuth = fs.existsSync(authFile);

  if (!hasAuth && isCI) {
    throw new Error('Arquivo youtube-auth.json não foi encontrado no ambiente CI.');
  }

  const context = await browser.newContext({
    storageState: hasAuth ? authFile : undefined,
    acceptDownloads: true,
    viewport: { width: 1600, height: 1000 },
    locale: 'pt-BR'
  });

  let successCount = 0;
  for (let i = 0; i < REPORTS.length; i++) {
    const isFirstReport = i === 0;
    const success = await downloadReportWithRetry(context, REPORTS[i], isFirstReport);
    if (success) successCount++;
  }

  console.log('-----------------------------');
  if (successCount === 0) {
    await browser.close();
    throw new Error('Nenhum relatório foi baixado. A sessão pode ter expirado.');
  }

  console.log(`Sucesso: ${successCount} de ${REPORTS.length} relatórios foram baixados.`);
  await browser.close();
}

main().catch(error => {
  console.error('Erro técnico no script:');
  console.error(error.message);
  process.exit(1);
});
