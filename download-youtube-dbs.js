const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
const AUTH_FILE = path.join(__dirname, 'youtube-auth.json');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const REPORTS = [
  { name: 'DB 2026.csv', url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=current_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC' },
  { name: 'DB 2025.csv', url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=minus_1_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC' },
  { name: 'DB 2024.csv', url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1704096000000%2C1735718400000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC' },
  { name: 'DB 2023.csv', url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27VIDEO_ON_DEMAND%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1678863600000%2C1704096000000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC' },
  { name: 'Shorts DB 2026.csv', url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=current_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC' },
  { name: 'Shorts DB 2025.csv', url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=minus_1_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC' },
  { name: 'Shorts DB 2024.csv', url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1704096000000%2C1735718400000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC' },
  { name: 'Shorts DB 2023.csv', url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27SHORTS%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=1678863600000%2C1704096000000&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=SHORTS_FEED_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC' },
  { name: 'Live DB 2026.csv', url: 'https://studio.youtube.com/channel/UCjbnazLwevrhQxGfbws_VmQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCjbnazLwevrhQxGfbws_VmQ&ur_dimensions=CREATOR_CONTENT_TYPE&ur_values=%27LIVE_STREAM%27&ur_inclusive_starts=&ur_exclusive_ends=&time_period=current_year&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=EXTERNAL_VIEWS&granularity=DAY&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&t_metrics=SUBSCRIBERS_NET_CHANGE&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=RATINGS_LIKES&t_metrics=SHARINGS&t_metrics=EXTERNAL_VIEWS&t_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&t_metrics=AVERAGE_WATCH_TIME&v_metrics=EXTERNAL_VIEWS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&v_metrics=AVERAGE_WATCH_TIME&dimension=VIDEO&o_column=EXTERNAL_VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC' }
];

(async () => {
  console.log('Iniciando processo de exportação do YouTube Studio...');

  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  if (!fs.existsSync(AUTH_FILE)) {
    console.error(`Erro crítico: Arquivo de autenticação ${AUTH_FILE} não encontrado!`);
    process.exit(1);
  }

  const rawAuth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  const cookies = Array.isArray(rawAuth) 
    ? rawAuth 
    : (rawAuth.cookies || rawAuth.session || []);

  if (cookies.length === 0) {
    console.error('Erro crítico: Nenhum cookie válido encontrado dentro do arquivo youtube-auth.json!');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setCookie(...cookies);

  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_DIR,
  });

  for (const report of REPORTS) {
    console.log(`\nProcessando: ${report.name}...`);
    try {
      await page.goto(report.url, { waitUntil: 'networkidle2', timeout: 60000 });
      await delay(5000);

      const clicked = await page.evaluate(() => {
        const exportBtn = document.querySelector('#export-button') ||
                          document.querySelector('ytcp-button[aria-label*="Export"]') ||
                          document.querySelector('ytcp-icon-button[icon="export"]') ||
                          document.querySelector('path[d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"]')?.closest('button') ||
                          document.querySelector('path[d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"]')?.closest('ytcp-icon-button');
                          
        if (exportBtn) {
          exportBtn.click();
          return true;
        }
        return false;
      });

      if (!clicked) {
        console.warn(`Aviso: Botão de exportação não encontrado para ${report.name}.`);
        continue;
      }

      await delay(2000);

      await page.evaluate(() => {
        const csvOption = Array.from(document.querySelectorAll('ytcp-text-menu-item, tp-yt-paper-item, paper-item'))
          .find(el => el.textContent.includes('CSV') || el.textContent.includes('Comma-separated values') || el.textContent.includes('Valores separados por vírgula'));
        if (csvOption) csvOption.click();
      });

      await delay(6000); // Tempo para o ZIP terminar de baixar

      // NOVO CÓDIGO: Lida com a extração do arquivo .zip
      const files = fs.readdirSync(DOWNLOAD_DIR);
      const latestZip = files
        .filter(f => f.endsWith('.zip') && !f.endsWith('.crdownload'))
        .map(f => ({ name: f, time: fs.statSync(path.join(DOWNLOAD_DIR, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time)[0];

      if (latestZip) {
        const zipPath = path.join(DOWNLOAD_DIR, latestZip.name);
        
        // 1. Descompacta o arquivo
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(DOWNLOAD_DIR, true);
        
        // 2. Exclui o arquivo .zip que já foi descompactado
        fs.unlinkSync(zipPath);

        // 3. Procura os arquivos CSV que acabaram de sair do zip
        const extractedFiles = fs.readdirSync(DOWNLOAD_DIR);
        const csvFiles = extractedFiles.filter(f => f.endsWith('.csv') && !REPORTS.some(r => r.name === f));
        
        // O YouTube geralmente separa em "Table data.csv" (a base real) e "Chart data.csv" (gráfico inútil).
        const tableDataCsv = csvFiles.find(f => f.toLowerCase().includes('table')) || csvFiles[0];

        if (tableDataCsv) {
          // Renomeia a tabela principal para o nome correto
          const oldPath = path.join(DOWNLOAD_DIR, tableDataCsv);
          const newPath = path.join(DOWNLOAD_DIR, report.name);
          if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
          fs.renameSync(oldPath, newPath);
          console.log(`Sucesso: Arquivo extraído e salvo como ${report.name}`);

          // Limpa o lixo que sobrou do zip (ex: Chart data.csv)
          const leftovers = fs.readdirSync(DOWNLOAD_DIR).filter(f => f.endsWith('.csv') && !REPORTS.some(r => r.name === f));
          for (const leftover of leftovers) {
            try { fs.unlinkSync(path.join(DOWNLOAD_DIR, leftover)); } catch (e) {}
          }
        } else {
          console.warn(`Aviso: Nenhum CSV encontrado dentro do zip para ${report.name}`);
        }
      } else {
        console.warn(`Aviso: Nenhum arquivo ZIP foi gerado para ${report.name}`);
      }
    } catch (err) {
      console.error(`Falha ao baixar ${report.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('\nProcesso finalizado com sucesso!');
})();
