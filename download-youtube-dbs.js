const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Salva na pasta 'downloads' dentro do repositório local
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

  if (
    preview.includes('<html') ||
    preview.includes('<!DOCTYPE') ||
    preview.includes('<body')
  ) {
    throw new Error('CSV final parece HTML, não CSV.');
  }

  if (!preview.includes(',') && !preview.includes('\n')) {
    throw new Error('CSV final não parece ter estrutura de CSV.');
  }
}

function extractTableDataCsvFromZip(zipPath, finalCsvPath) {
  console.log('Extraindo table data.csv do ZIP...');

  if (!fs.existsSync(zipPath)) {
    throw new Error('Arquivo ZIP temporário não encontrado.');
  }

  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  const tableEntry = entries.find(entry => {
    const normalizedName = entry.entryName.toLowerCase().replace(/\\/g, '/');
    return normalizedName.endsWith('table data.csv');
  });

  if (!tableEntry) {
    throw new Error('Não encontrei o arquivo "table data.csv" dentro do ZIP.');
  }

  const csvBuffer = tableEntry.getData();

  if (!csvBuffer || csvBuffer.length < 100) {
    throw new Error(`O arquivo table data.csv parece vazio. Tamanho: ${csvBuffer?.length || 0} bytes.`);
  }

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
    'ytcp-icon-button[aria-label="Download"]',
    'button[aria-label="Download"]',
    '[aria-label="Download"]'
  ];

  for (const selector of downloadSelectors) {
    try {
      const locator = page.locator(selector).last();
      const count = await locator.count();

      if (count > 0) {
        await locator.click({ timeout: 10000 });
        console.log(`Cliquei no botão de download usando: ${selector}`);
        await page.waitForTimeout(3000);
        return;
      }
    } catch (error) {
      console.log(`Falha no seletor ${selector}: ${error.message}`);
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

  const csvSelectors = [
    'text=Comma-separated values (.csv)',
    'text=Comma-separated values',
    'text=.csv'
  ];

  for (const selector of csvSelectors) {
    try {
      const option = page.locator(selector).first();
      const count = await option.count();

      if (count > 0) {
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
      console.log(`Falha na opção ${selector}: ${error.message}`);
    }
  }

  throw new Error('Não consegui encontrar a opção CSV.');
}

async function downloadReportWithRetry(context, report, isFirstReport) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log('-----------------------------');
      console.log(`Tentativa ${attempt}/${maxAttempts} para: ${report.name}`);
      await downloadReportOnce(context, report, isFirstReport);
      return;
    } catch (error) {
      console.log(`Falha na tentativa ${attempt}/${maxAttempts}: ${error.message}`);
      if (attempt === maxAttempts) return;
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

async function downloadReportOnce(context, report, isFirstReport) {
  ensureFolderExists(report.outputFolder);
  ensureFolderExists(TEMP_FOLDER);

  const finalCsvPath = path.join(report.outputFolder, report.outputFile);
  const tempZipPath = path.join(TEMP_FOLDER, `${report.name}.temp.zip`);

  const page = await context.newPage();

  try {
    await page.goto(report.url, { waitUntil: 'load', timeout: 90000 });
    const waitTime = isFirstReport ? 20000 : 10000;
    await page.waitForTimeout(waitTime);

    await clickDownloadButton(page);
    const download = await clickCsvAndDownload(page);

    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }

    await download.saveAs(tempZipPath);
    extractTableDataCsvFromZip(tempZipPath, finalCsvPath);
    fs.unlinkSync(tempZipPath);
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  const isCI = !!process.env.CI;

  const browser = await chromium.launch({
    headless: true
  });

  const authFile = 'youtube-auth.json';
  const hasAuth = fs.existsSync(authFile);

  if (!hasAuth && isCI) {
    throw new Error('Arquivo youtube-auth.json não foi encontrado no ambiente CI.');
  }

  const context = await browser.newContext({
    storageState: hasAuth ? authFile : undefined,
    acceptDownloads: true,
    viewport: { width: 1600, height: 1000 }
  });

  for (let i = 0; i < REPORTS.length; i++) {
    const isFirstReport = i === 0;
    await downloadReportWithRetry(context, REPORTS[i], isFirstReport);
  }

  console.log('-----------------------------');
  console.log('Processo de download concluído com sucesso.');
  await browser.close();
}

main().catch(error => {
  console.error('Erro técnico no script:');
  console.error(error);
  process.exit(1);
});