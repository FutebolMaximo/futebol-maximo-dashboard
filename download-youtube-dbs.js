const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
const AUTH_FILE = path.join(__dirname, 'youtube-auth.json');

// Função auxiliar para pausar a execução (substitui o deprecated page.waitForTimeout)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ID do Canal (pode ser passado por variável de ambiente ou definido diretamente)
const CHANNEL_ID = process.env.CHANNEL_ID || 'SEU_CHANNEL_ID_AQUI';

const REPORTS = [
  { name: 'DB 2023.csv', url: `https://studio.youtube.com/channel/${CHANNEL_ID}/analytics/tab-overview/time-2023` },
  { name: 'DB 2024.csv', url: `https://studio.youtube.com/channel/${CHANNEL_ID}/analytics/tab-overview/time-2024` },
  { name: 'DB 2025.csv', url: `https://studio.youtube.com/channel/${CHANNEL_ID}/analytics/tab-overview/time-2025` },
  { name: 'DB 2026.csv', url: `https://studio.youtube.com/channel/${CHANNEL_ID}/analytics/tab-overview/time-2026` },
  { name: 'Lives DB 2026.csv', url: `https://studio.youtube.com/channel/${CHANNEL_ID}/analytics/tab-live/time-2026` },
  { name: 'Shorts DB 2023.csv', url: `https://studio.youtube.com/channel/${CHANNEL_ID}/analytics/tab-shorts/time-2023` },
  { name: 'Shorts DB 2024.csv', url: `https://studio.youtube.com/channel/${CHANNEL_ID}/analytics/tab-shorts/time-2024` },
  { name: 'Shorts DB 2025.csv', url: `https://studio.youtube.com/channel/${CHANNEL_ID}/analytics/tab-shorts/time-2025` },
  { name: 'Shorts DB 2026.csv', url: `https://studio.youtube.com/channel/${CHANNEL_ID}/analytics/tab-shorts/time-2026` },
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

  const cookies = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));

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

  // Permite o download de arquivos em modo headless no Chromium
  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_DIR,
  });

  for (const report of REPORTS) {
    console.log(`\nProcessando: ${report.name}...`);
    try {
      await page.goto(report.url, { waitUntil: 'networkidle2', timeout: 60000 });
      await delay(3000);

      // Disparo do clique no botão de exportação
      const clicked = await page.evaluate(() => {
        const exportBtn = document.querySelector('#export-button') ||
                          document.querySelector('ytcp-button[aria-label*="Export"]') ||
                          document.querySelector('ytcp-icon-button[icon="export"]');
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

      // Clica na opção "CSV" do menu
      await page.evaluate(() => {
        const csvOption = Array.from(document.querySelectorAll('ytcp-text-menu-item, tp-yt-paper-item, paper-item'))
          .find(el => el.textContent.includes('CSV') || el.textContent.includes('Comma-separated values'));
        if (csvOption) csvOption.click();
      });

      // Aguarda a gravação do download
      await delay(6000);

      // Localiza o arquivo CSV recém-baixado (ignorando temporários .crdownload)
      const files = fs.readdirSync(DOWNLOAD_DIR);
      const latestDownloaded = files
        .filter(f => f.endsWith('.csv') && !f.endsWith('.crdownload') && !REPORTS.some(r => r.name === f))
        .map(f => ({ name: f, time: fs.statSync(path.join(DOWNLOAD_DIR, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time)[0];

      if (latestDownloaded) {
        const oldPath = path.join(DOWNLOAD_DIR, latestDownloaded.name);
        const newPath = path.join(DOWNLOAD_DIR, report.name);
        if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
        fs.renameSync(oldPath, newPath);
        console.log(`Sucesso: Arquivo salvo como ${report.name}`);
      } else {
        console.warn(`Aviso: Nenhum arquivo novo foi gerado para ${report.name}`);
      }
    } catch (err) {
      console.error(`Falha ao baixar ${report.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('\nProcesso finalizado.');
})();
