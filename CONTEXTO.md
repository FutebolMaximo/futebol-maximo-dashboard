# Futebol Máximo — Dashboard de Performance YouTube

## O que é esse projeto
Dashboard single-file (tudo em um único `index.html`) que carrega um `dados.csv`
e renderiza gráficos e tabelas de análise de performance de vídeos do YouTube.
Hospedado no GitHub Pages. Desenvolvido ao longo de meses de iteração.

## Regra mais importante
NUNCA separar o `index.html` em múltiplos arquivos.
Tudo — HTML, CSS, JavaScript — deve permanecer em um único arquivo.

---

## Arquivos do projeto
- `index.html` — dashboard completo (HTML/CSS/JS em um único arquivo)
- `dados.csv` — base de dados dos vídeos (~2330 registros)
- `fantasy.csv` — interações Fantasy (~2249 registros)
- `CONTEXTO.md` — este arquivo

---

## Estrutura do CSV (24 colunas nessa ordem)
```
Data Publicação, Mês_Ano, Ano, Semana, Content, Video title, Tipo,
Categoria, Creator, Duração, Avg Viewed %, Avg View Duration,
Impressões, CTR% YT, CTR%, Views, Likes, Inscritos,
Conversão Inscritos, Shares, Total Comments, Conversão Comments,
Link, Gancho
```

### Detalhes importantes do CSV
- **Tipo**: "Long Form" ou "Shorts"
- **Gancho**: decimal puro (ex: 0.74 = 74%) — só Long Form, ~538 vídeos preenchidos
- **Datas**: podem vir em ISO `YYYY-MM-DD` ou US `M/D/YYYY` — o parser normaliza ambos
- **CSV carregado com cache-busting**: `fetch('dados.csv?v=' + Date.now(), { cache: 'no-store' })`

---

## Abas do Dashboard (ordem)
1. **Long Form** — KPIs, Evolução Temporal, Scatter, Performance, Heatmaps
2. **Shorts** — KPIs, Temporal, Scatter, Performance, Heatmap, Feedback
3. **Feedbacks** — Classificação automática Long Form e Shorts
4. **Base de Dados** — Tabela completa com filtros por coluna
5. **VELHO** — Galeria de cards (main dataset)
6. **Fantasy** — KPIs, breakdown e ranking a partir de `fantasy.csv`

---

## Fluxo de dados (variáveis principais)
```
allData          → todos os vídeos parseados de dados.csv
filteredData     → Long Form filtrados pelos filtros globais
filteredLong     → mesmo que filteredData (alias)
filteredShorts   → Shorts filtrados pelos filtros globais
filteredAll      → todos os tipos (usado só na Base de Dados)
```

---

## Filtros globais (sticky, afetam todas as abas)
Criador | Categoria | Tipo | Data Início | Data Fim | Semana | Título

- **Default**: Data Início = 01/01/ano atual, Data Fim = hoje
- **Limpar**: reseta para o mesmo default (não para todo o histórico)
- Botão 👁️ ao lado de Limpar: expande/recolhe todas as seções
- **Tipo no Main**: continua afetando Base / VELHO conforme a lógica existente (não redefine Long Form / Shorts)
- **Ranges numéricos** (Views, Outlier, CTR, Avg View Duration, Gancho, Avg Viewed): afetam o pipeline Main; na aba Fantasy ficam disabled e são ignorados

---

## Seções colapsáveis
Todas as seções têm `onclick="toggleSection(this)"` no `.section-header`.
- Default: todas expandidas
- `expandAllSections()` / `collapseAllSections()` controladas pelo botão 👁️
- `section-desc` (descrição) sempre visível mesmo quando recolhida

---

## Gráficos (Chart.js)
- Instâncias guardadas em `chartInstances{}` — sempre destruir antes de recriar
- `destroyChart(id)` antes de `new Chart(...)`
- Cores por categoria em `CAT_COLORS{}`
- Fantasy: `fantasyBreakdownChart` com destroy próprio antes de recriar

---

## KPI Cards — Dashboard (2 linhas × 5)
**Linha 1**: Views | CTR% | Avg View Duration | Avg Viewed % | Minutagem Média
**Linha 2**: Impressões | Inscritos | Likes | Comentários | Gancho

- Gancho KPI: só Long Form com valor não-nulo
- IDs: kViews, kCTR, kAvgDur, kAvgPct, kDurMedia / kImpr, kInsc, kLikes, kComm, kGancho

---

## Lógica de Classificação — Feedback Long Form (classifyVideo)

```javascript
const THRESHOLDS = {
  views:        48000,   // gate OBRIGATÓRIO
  ctr:          0.076,   // 7.6%
  avgViewedPct: 40,      // 40%
  gancho:       0.70,    // 70%
  avgViewDurSec:360,     // 6:00
};

// Gate obrigatório: Views >= 48K
// Score >= 3 entre os outros 4 critérios (null = ignorado)
```

**Status possíveis**:
- 🟢 **Escalar** — Views ≥48K + score ≥3 → diag: "Estudar & Replicar"
- 🔵 **Reembalar** — baixo volume/CTR + gancho e retenção fortes → diag: "Trocar Thumb & Título"
- 🔴 **Rever Formato** — fraco em tudo → diag: "Aperfeiçoar Formato"
- 🟡 **Ajustar Entrega** — casos intermediários → diag: "Ajuste necessário"

---

## Lógica de Classificação — Feedback Shorts (classifyVideoShorts)
```javascript
const THRESHOLDS_SHORTS = { views: 98100, ctr: 0.70, avgViewedPct: 75 };
// Lógica AND estrita: todos os 3 devem ser atingidos para Escalar
```

---

## Parsing do Gancho
```javascript
// Valor com % (formato antigo): '74%' → 0.74
// Decimal puro (formato atual): 0.74 → 0.74
gancho: (obj.gancho && obj.gancho.trim())
  ? (obj.gancho.includes('%')
      ? parseFloat(obj.gancho.replace('%',''))/100
      : parseFloat(obj.gancho))
  : null,
```

---

## Análise de Distribuição Ideal (Análise Avançada)
- Default: granularidade = **Categorias**, ordenado por Nº Vídeos decrescente
- Granularidades: Faixas de Duração | Criadores | Categorias (clicável no título)
- Colunas: Nº Vídeos | Views Média | Retenção Média | Avg View Dur | Gancho Médio | Inscritos/1K | Coment./1K
- Todas as colunas são ordenáveis

---

## Base de Dados — 21 colunas (ordem exata)
```
Data | Semana | Mês_Ano | Título | Tipo | Criador | Categoria |
Views | CTR% | Avg View Dur | Gancho | Duração | Avg View % |
Impr. | CTR% YT | Likes | Inscritos | Conv. Insc. | Shares |
Coment. | Conv. Comm.
```

---

## Fantasy (pipeline independente)

### Pipelines
```
dados.csv
→ parseCSVText()
→ allData
→ filtros Main
→ Long Form / Shorts / Feedbacks / Base / VELHO

fantasy.csv
→ parseFantasyCSV()
→ allFantasyData
→ applyFantasyFilters()
→ filteredFantasy
→ KPIs / breakdown / ranking Fantasy
```

- Carregamento paralelo e isolado (`loadData()` + `loadFantasyData()`).
- **Sem** `Promise.all` obrigatório entre os dois.
- Falha em `fantasy.csv` **não** derruba o Main; Fantasy mostra erro próprio.
- Fantasy **nunca** entra em `allData` / `filteredLong` / `filteredShorts` / `filteredAll`.
- Outlier continua calculado só com dados Main.

### Headers de fantasy.csv
```
Data Publicação, Mês_Ano, Ano, Semana, Video title, Tipo, Categoria,
Creator, Views, Link, URL Video, ID do Vídeo, Formato, Dispositivo,
Visitor ID, Destino
```

- Cada linha = uma interação com `Visitor ID`.
- Cache-busting: `fetch('fantasy.csv?v=' + Date.now(), { cache: 'no-store' })`.

### kind (classificação)
- `bio` → `videoIdRaw === 'BIO'`
- `video` → ID válido + title + Views numérico + Data Publicação válidos
- `unidentified` → demais (sem ID, ou ID sem metadados mínimos)

Counts de referência atuais (`allFantasyData` = 2249):
- video rows = 1774
- bio = 82
- unidentified = 393

### Filtros compartilhados que afetam Fantasy
Data | Semana | Categoria | Creator | Tipo | Título

- Mesmos controles sticky do dashboard.
- Opções reconstruídas por aba (`allData` ↔ `allFantasyData`).
- Seleções preservadas ao trocar de aba (incluindo ghost/indisponível).
- Master **Todos/Todas** = sem restrição semântica (`catAllSelected` / `weekAllSelected` / `titleAllSelected`).

### Ranges numéricos na Fantasy
Views | Outlier | CTR | Avg View Duration | Gancho | Avg Viewed

- Visualmente disabled na aba Fantasy.
- Valores preservados.
- **Não** entram em `applyFantasyFilters()`.

### Regra de Data
- Com Data preenchida (início e/ou fim): registros **sem** `dataPublicacao` ficam fora (inclui BIO / unidentified sem data).
- Com ambos os inputs vazios (all-time real): registros sem Data podem entrar.

### KPIs Fantasy (sobre `filteredFantasy`)
1. **UNIQUE VISITORS** — `COUNT DISTINCT visitorId` (inclui video + bio + unidentified)
2. **VÍDEOS QUE GERARAM VISITANTES** — `COUNT DISTINCT` vídeo válido (`kind === 'video'`)
3. **CONVERSION RATE** — UV total ÷ SUM Views **1× por vídeo válido**
4. **APP UNIQUE VISITORS** — UV com `destino === 'App'`
5. **WEB UNIQUE VISITORS** — UV com `destino === 'Web'`

Conversion Rate:
- Numerador: todos os Unique Visitors do recorte (BIO/unidentified incluídos).
- Denominador: Views deduplicadas só de `kind === 'video'`.
- BIO/unidentified **não** somam Views.
- Formatter: `fmtFantasyCR()` (preserva CRs muito pequenos; não virar 0%).

### Breakdown (1 gráfico)
Dimensões: Creator | Categoria | Tipo | Destino | Dispositivo  
Métrica: `COUNT DISTINCT visitorId` por grupo (overlap permitido; soma das barras pode > KPI global).

Labels de fallback:
- BIO sem Creator/Categoria/Tipo → **BIO**
- unidentified / vídeo sem dimensão → **Não identificado**
- Destino vazio → **Não rastreado**
- Dispositivo vazio → **Não identificado**

Estado: `fantasyBreakdownDimension` (default `creator`) · `fantasyBreakdownChart`

### Ranking de vídeos
- Somente `kind === 'video'` a partir de `filteredFantasy`.
- Card: thumbnail · título · data · Unique Visitors · Conversion Rate · Views.
- Link (thumb + título): YouTube Studio (`r.link`), `target="_blank"` `rel="noopener noreferrer"`.
- Thumb: `maxresdefault` → fallback `hqdefault` (`velhoThumbFallback`).
- Sort (`fantasySort`): visitors | conversion | views | date (todos DESC; nulls no fim).
- Paginação (`fantasyVisibleCount`): 30 + Carregar mais (+30).
- Empty state quando não há vídeos válidos (mesmo se UV > 0 só com BIO/unidentified).

### Estados Fantasy principais
```
allFantasyData
filteredFantasy
fantasyLoaded
fantasyLoadError
fantasySort                 // default: 'visitors'
fantasyVisibleCount         // default: 30
fantasyBreakdownDimension   // default: 'creator'
fantasyBreakdownChart
```

### Counts de referência
```
allData            = 2330
allFantasyData     = 2249

Default 2026:
  filteredFantasy  = 1586
  Unique Visitors  = 1586
  vídeos válidos   = 122
  Views únicas     = 61702805
  App UV / Web UV  = 360 / 344

All-time (Data vazia):
  filteredFantasy  = 2249
  Unique Visitors  = 2249
  vídeos válidos   = 159
  Views únicas     = 126193509
  App UV / Web UV  = 567 / 533
```

---

## Correções de bugs conhecidas (não reverter)
1. **Fuso horário nos labels do gráfico temporal**: usar `new Date(+y, +m-1, 1)` e NÃO `new Date(k+'-01')` para evitar labels com mês errado
2. **Gancho zerado**: parser detecta formato automaticamente (com % ou decimal)
3. **Cache do CSV**: sempre usar `?v=Date.now()` + `cache: 'no-store'`
4. **Datas US format**: normalizar M/D/YYYY → YYYY-MM-DD no parse

---

## Como fazer alterações com segurança
1. Sempre testar no browser após cada mudança (servidor local: `python -m http.server 8765 --bind 127.0.0.1`)
2. Verificar console (F12) para erros JS
3. Nunca remover `destroyChart()` / destroy do chart Fantasy antes de criar novo gráfico
4. Manter sempre exatamente 3 `<script>` e 3 `</script>` no arquivo
5. Não misturar `fantasy.csv` no pipeline `allData`
