const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const REPORTS = [
  {
    name: 'DB 2023',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1678863600000%2C1704096000000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'C:\\Users\\jose\\Desktop\\Suporte Knime\\Futebol Maximo',
    outputFile: 'DB 2023.csv'
  },
  {
    name: 'DB 2024',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1704096000000%2C1735718400000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'C:\\Users\\jose\\Desktop\\Suporte Knime\\Futebol Maximo',
    outputFile: 'DB 2024.csv'
  },
  {
    name: 'DB 2025',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=minus_1_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'C:\\Users\\jose\\Desktop\\Suporte Knime\\Futebol Maximo',
    outputFile: 'DB 2025.csv'
  },
  {
    name: 'DB 2026',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=current_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'C:\\Users\\jose\\Desktop\\Suporte Knime\\Futebol Maximo',
    outputFile: 'DB 2026.csv'
  },
  {
    name: 'Shorts DB 2023',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1678863600000%2C1704096000000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'C:\\Users\\jose\\Desktop\\Suporte Knime\\Futebol Maximo',
    outputFile: 'Shorts DB 2023.csv'
  },
  {
    name: 'Shorts DB 2024',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1704096000000%2C1735718400000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'C:\\Users\\jose\\Desktop\\Suporte Knime\\Futebol Maximo',
    outputFile: 'Shorts DB 2024.csv'
  },
  {
    name: 'Shorts DB 2025',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=minus_1_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'C:\\Users\\jose\\Desktop\\Suporte Knime\\Futebol Maximo',
    outputFile: 'Shorts DB 2025.csv'
  },
  {
    name: 'Shorts DB 2026',
    url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=current_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC',
    outputFolder: 'C:\\Users\\jose\\Desktop\\Suporte Knime\\Futebol Maximo',
    outputFile: 'Shorts DB 2026.csv'
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

  console.log('Arquivos encontrados dentro do ZIP:');

  for (const entry of entries) {
    console.log(`- ${entry.entryName}`);
  }

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
    console.log('Arquivo CSV anterior removido.');
  }

  fs.writeFileSync(finalCsvPath, csvBuffer);

  validateCsvFile(finalCsvPath);

  console.log(`CSV final salvo com sucesso em: ${finalCsvPath}`);
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
      console.log(`Não funcionou com seletor ${selector}: ${error.message}`);
    }
  }

  console.log('Tentando clicar por posição no canto superior direito...');

  const viewport = page.viewportSize();

  if (!viewport) {
    throw new Error('Não consegui identificar o tamanho da janela.');
  }

  await page.mouse.click(viewport.width - 45, 85);
  await page.waitForTimeout(3000);
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
        console.log(`Opção CSV encontrada usando: ${selector}`);

        const downloadPromise = page.waitForEvent('download', {
          timeout: 120000
        });

        await option.click({ timeout: 10000 });

        console.log('Cliquei em CSV. Aguardando download terminar...');

        const download = await downloadPromise;

        const failure = await download.failure();

        if (failure) {
          throw new Error(`Download falhou: ${failure}`);
        }

        console.log(`Nome original baixado pelo YouTube: ${download.suggestedFilename()}`);

        return download;
      }
    } catch (error) {
      console.log(`Falhou tentando opção ${selector}: ${error.message}`);
    }
  }

  throw new Error('Não consegui encontrar a opção CSV.');
}

async function downloadReportWithRetry(context, report) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log('-----------------------------');
      console.log(`Tentativa ${attempt}/${maxAttempts} para: ${report.name}`);

      await downloadReportOnce(context, report);

      console.log(`Relatório ${report.name} concluído com sucesso.`);
      return;
    } catch (error) {
      console.log(`Falha na tentativa ${attempt}/${maxAttempts} para ${report.name}: ${error.message}`);

      if (attempt === maxAttempts) {
        console.log(`Erro definitivo no relatório ${report.name}: ${error.message}`);
        return;
      }

      console.log('Aguardando 10 segundos antes de tentar novamente...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

async function downloadReportOnce(context, report) {
  console.log('-----------------------------');
  console.log(`Iniciando download: ${report.name}`);

  ensureFolderExists(report.outputFolder);
  ensureFolderExists(TEMP_FOLDER);

  const finalCsvPath = path.join(report.outputFolder, report.outputFile);
  const tempZipPath = path.join(TEMP_FOLDER, `${report.name}.temp.zip`);

  const page = await context.newPage();

  try {
    await page.goto(report.url, {
      waitUntil: 'load',
      timeout: 90000
    });

    console.log('Relatório aberto. Aguardando carregar completamente...');
    await page.waitForTimeout(25000);

    await clickDownloadButton(page);

    const download = await clickCsvAndDownload(page);

    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }

    await download.saveAs(tempZipPath);

    console.log(`ZIP temporário salvo em: ${tempZipPath}`);

    extractTableDataCsvFromZip(tempZipPath, finalCsvPath);

    fs.unlinkSync(tempZipPath);
    console.log('ZIP temporário removido.');
  } finally {
    await page.close().catch(() => {});
  }
}



async function main() {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    storageState: 'youtube-auth.json',
    acceptDownloads: true,
    viewport: {
      width: 1600,
      height: 1000
    }
  });

  for (const report of REPORTS) {
    await downloadReportWithRetry(context, report);
  }

  console.log('-----------------------------');
  console.log('Processo finalizado.');
  console.log('O navegador vai fechar em 20 segundos.');

  await new Promise(resolve => setTimeout(resolve, 20000));

  await browser.close();
}

main().catch(error => {
  console.error('Erro técnico no script:');
  console.error(error);
  process.exit(1);
});