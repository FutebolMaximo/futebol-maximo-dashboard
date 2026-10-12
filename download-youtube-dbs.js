const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const REPORTS = [
  {
    name: 'DB 2023',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1678863600000%2C1704096000000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'downloads',
    outputFile: 'DB 2023.csv'
  },
  {
    name: 'DB 2024',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1704096000000%2C1735718400000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'downloads',
    outputFile: 'DB 2024.csv'
  },
  {
    name: 'DB 2025',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=minus_1_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'downloads',
    outputFile: 'DB 2025.csv'
  },
  {
    name: 'DB 2026',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=current_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'downloads',
    outputFile: 'DB 2026.csv'
  },
  {
    name: 'Shorts DB 2023',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1678863600000%2C1704096000000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'downloads',
    outputFile: 'Shorts DB 2023.csv'
  },
  {
    name: 'Shorts DB 2024',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1704096000000%2C1735718400000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'downloads',
    outputFile: 'Shorts DB 2024.csv'
  },
  {
    name: 'Shorts DB 2025',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=minus_1_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'downloads',
    outputFile: 'Shorts DB 2025.csv'
  },
  {
    name: 'Shorts DB 2026',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=current_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'downloads',
    outputFile: 'Shorts DB 2026.csv'
  }
];

const TEMP_FOLDER = path.join(__dirname, 'temp-downloads');

function ensureFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

function extractTableDataCsvFromZip(zipPath, finalCsvPath) {
  console.log('Extraindo table data.csv do ZIP...');
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  
  const tableEntry = entries.find(entry => entry.entryName.toLowerCase().endsWith('table data.csv'));

  if (!tableEntry) {
    throw new Error('Não encontrei o arquivo "table data.csv" dentro do ZIP.');
  }

  const csvBuffer = tableEntry.getData();

  if (fs.existsSync(finalCsvPath)) {
    fs.unlinkSync(finalCsvPath);
  }

  fs.writeFileSync(finalCsvPath, csvBuffer);
  console.log(`CSV final salvo com sucesso em: ${finalCsvPath}`);
}

async function downloadReportOnce(context, report) {
  console.log('-----------------------------');
  console.log(`Iniciando download via Injeção DOM: ${report.name}`);

  ensureFolderExists(report.outputFolder);
  ensureFolderExists(TEMP_FOLDER);

  const finalCsvPath = path.join(report.outputFolder, report.outputFile);
  const tempZipPath = path.join(TEMP_FOLDER, `${report.name}.temp.zip`);

  const page = await context.newPage();

  try {
    await page.goto(report.url, { waitUntil: 'load', timeout: 90000 });
    console.log('Relatório carregado. Preparando execução JavaScript no DOM...');
    await page.waitForTimeout(15000); // Aguarda o carregamento dos elementos no DOM

    // 1. Clique direto via DOM no botão de Exportar
    await page.evaluate(() => {
      const exportBtn = document.querySelector('#export-button, ytcp-icon-button[aria-label*="Export"], [aria-label*="Exportar"]');
      if (exportBtn) exportBtn.click();
    });
    console.log('Cliquei no botão de Exportar via JavaScript.');
    await page.waitForTimeout(3000);

    // 2. Preparar a escuta do Download ANTES do clique
    const downloadPromise = page.waitForEvent('download', { timeout: 120000 });

    // 3. Clique direto via DOM na opção CSV
    await page.evaluate(() => {
      const menuItems = Array.from(document.querySelectorAll('tp-yt-paper-item, ytcp-text-menu-item'));
      const csvOption = menuItems.find(item => {
        const text = item.textContent.toLowerCase();
        return text.includes('.csv') || text.includes('comma') || text.includes('vírgula');
      });
      if (csvOption) csvOption.click();
    });
    console.log('Cliquei na opção CSV via JavaScript. Aguardando download...');

    const download = await downloadPromise;
    const failure = await download.failure();
    if (failure) throw new Error(`Download falhou: ${failure}`);

    if (fs.existsSync(tempZipPath)) fs.unlinkSync(tempZipPath);
    await download.saveAs(tempZipPath);
    console.log(`ZIP salvo. Processando extração...`);

    extractTableDataCsvFromZip(tempZipPath, finalCsvPath);
    fs.unlinkSync(tempZipPath);

  } finally {
    await page.close().catch(() => {});
  }
}

async function downloadReportWithRetry(context, report) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await downloadReportOnce(context, report);
      console.log(`Relatório ${report.name} concluído com sucesso.`);
      return;
    } catch (error) {
      console.log(`Falha na tentativa ${attempt} para ${report.name}: ${error.message}`);
      if (attempt === maxAttempts) {
        console.log(`Erro definitivo no relatório ${report.name}.`);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: 'youtube-auth.json',
    acceptDownloads: true
  });

  for (const report of REPORTS) {
    await downloadReportWithRetry(context, report);
  }

  await browser.close();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});