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
- `dados.csv` — base de dados dos vídeos (**2336** registros)
- `fantasy.csv` — interações Fantasy (~2249 registros; **não é carregado** quando a feature flag está `false`)
- `CONTEXTO.md` — este arquivo

---

## Estrutura do CSV (dados.csv)
Colunas principais (ordem operacional atual inclui):
```
Data Publicação, Mês_Ano, Ano, Semana, Content, Video title, Tipo,
Categoria, Creator, Duração, Avg Viewed %, Avg View Duration,
Impressões, CTR% YT, CTR%, Views, Likes, Inscritos,
Conversão Inscritos, Shares, Total Comments, Conversão Comments,
Link, Gancho, Fantasy Clicks, Conversão Fantasy
```

### Detalhes importantes do CSV
- **Tipo**: "Long Form" ou "Shorts"
- **Gancho**: decimal puro (ex: 0.74 = 74%) — só Long Form, ~538 vídeos preenchidos
- **Fantasy Clicks**: `number | null` — vazio no CSV → `null` (NÃO zero)
- **Conversão Fantasy**: decimal `0–1 | null` — ex: `0.02177` = 2,177%; vazio → `null` (NÃO zero)
- **Datas**: podem vir em ISO `YYYY-MM-DD` ou US `M/D/YYYY` — o parser normaliza ambos
- **CSV carregado com cache-busting**: `fetch('dados.csv?v=' + Date.now(), { cache: 'no-store' })`

### Contagens atuais (dados.csv)
```
allData              = 2336
Long Form            = 1161
Shorts               = 1175
Fantasy Clicks preenchidos = 159
  Long Form          = 84 vídeos / 1370 clicks
  Shorts             = 75 vídeos / 404 clicks

Default 2026 (01/01 → hoje):
  vídeos com Fantasy = 122 / 1586 clicks
  Long Form          = 69 / 1297
  Shorts             = 53 / 289
```

---

## Abas do Dashboard (ordem)
1. **Long Form** — KPIs, Evolução Temporal, Scatter, Performance, Heatmaps, Funil
2. **Shorts** — KPIs, Temporal, Scatter, Performance, Heatmap, Funil, Feedback
3. **Feedbacks** — Classificação automática Long Form e Shorts
4. **Base de Dados** — Tabela completa com filtros por coluna
5. **VELHO** — Galeria de cards (main dataset)
6. **Fantasy** — KPIs, breakdown e ranking a partir de `fantasy.csv`  
   **Atualmente DESATIVADA** via `ENABLE_FANTASY_TAB = false` (código preservado; ver seção Fantasy V1)

---

## Fluxo de dados (variáveis principais)
```
allData          → todos os vídeos parseados de dados.csv
filteredData     → Long Form filtrados pelos filtros globais
filteredLong     → mesmo que filteredData (alias)
filteredShorts   → Shorts filtrados pelos filtros globais
filteredAll      → todos os tipos (usado só na Base de Dados)
```

Campos Fantasy no Main (por vídeo, vindos de `dados.csv`):
```
r.fantasyClicks      → number | null
r.fantasyConversion  → number (0–1) | null
```

---

## Fantasy Clicks + Conversão Fantasy (Main)

### Regras de null
- Sem valor no CSV → `null` → UI = `—`
- **Nunca** transformar `null` em `0`
- Ausência de tracking ≠ “zero clicks confirmados”

### Agregações (helpers)
```
sumFantasyClicks(rows)
  → SUM apenas dos fantasyClicks preenchidos
  → se nenhum preenchido: null

aggregateFantasyConversion(rows)
  → SUM(fantasyClicks) / SUM(views) dos vídeos onde fantasyClicks está preenchido
  → NÃO usar AVG(r.fantasyConversion)
  → se nenhum elegível ou denom ≤ 0: null

fmtFantasyCR(rate)  → formata decimal 0–1 como % (preserva CRs muito pequenos)
```

### Por vídeo
Usar diretamente `r.fantasyClicks` e `r.fantasyConversion` (Performance, VELHO card, Base).

### Onde aparecem no Main
**Long Form**
- KPI Fantasy Clicks + Fantasy Conversion
- Funil de Engajamento — **outcome/rodapé** (não é etapa do funil SVG)
- Evolução Temporal (dropdown)
- Performance (dropdown)
- Heatmap Indicadores

**Shorts**
- KPI Fantasy Clicks + Fantasy Conversion
- Funil — outcome/rodapé
- Evolução Temporal
- Performance
- Heatmap Indicadores

**VELHO**
- Card — 1ª linha: Views | Outlier | Fantasy Clicks | Fantasy Conversion  
  (2ª linha Long Form/Shorts permanece a antiga)
- Sort: Fantasy Clicks DESC · Fantasy Conversion DESC (nulls no fim)

**Base de Dados**
- Colunas Fantasy Clicks + Fantasy Conversion (após Views)
- Display: inteiro / `fmtFantasyCR()` · null = `—`
- Sort numérico no valor real · nulls no fim

### O que NÃO existe
- Range filters de Fantasy Clicks / Conversão Fantasy
- Fantasy nas regras de Feedback Automático
- Destino / Dispositivo no Main
- Aba temporal Fantasy separada no Main

### Referências de agregação (validação)
```
Default 2026 — Long Form:
  Fantasy Clicks = 1297
  Views elegíveis = 6.801.827
  Conversion ≈ 0,0191%

Default 2026 — Shorts:
  Fantasy Clicks = 289
  Views elegíveis = 54.900.978
  Conversion ≈ 0,00053%

All-time — Long Form:
  84 vídeos / 1370 clicks / denom 10.180.334 / CR ≈ 0,013457%

All-time — Shorts:
  75 vídeos / 404 clicks / denom 116.013.175 / CR ≈ 0,000348%
```

---

## Filtros globais (sticky, afetam todas as abas)
Criador | Categoria | Tipo | Data Início | Data Fim | Semana | Título

- **Default**: Data Início = 01/01/ano atual, Data Fim = hoje
- **Limpar**: reseta para o mesmo default (não para todo o histórico)
- Botão 👁️ ao lado de Limpar: expande/recolhe todas as seções
- **Tipo no Main**: continua afetando Base / VELHO conforme a lógica existente (não redefine Long Form / Shorts)
- **Ranges numéricos** (Views, Outlier, CTR, Avg View Duration, Gancho, Avg Viewed): afetam o pipeline Main; na aba Fantasy (quando ativa) ficam disabled e são ignorados
- **Sem** ranges Fantasy no Main

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
- Fantasy V1 (quando ativa): `fantasyBreakdownChart` com destroy próprio antes de recriar

---

## KPI Cards — Long Form
**Linhas principais**: Views | CTR% | Avg View Duration | Avg Viewed % | Minutagem Média  
Impressões | Inscritos | Likes | Comentários | Gancho  
**+ Fantasy**: Fantasy Clicks | Fantasy Conversion (`sumFantasyClicks` / `aggregateFantasyConversion`)

## KPI Cards — Shorts
Mesma família visual + Fantasy Clicks | Fantasy Conversion sobre `filteredShorts`.

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

Fantasy Clicks / Conversão Fantasy **não entram** nas regras automáticas.

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

## Heatmap Indicadores / Análise de Duração
- Granularidades: Faixas de Duração | Criadores | Categorias
- Colunas existentes + **Fantasy Clicks** (soma conhecida) + **Fantasy Conversion** (ponderada)
- Null → célula neutra `—`
- Sort numérico · nulls no fim

---

## Base de Dados — colunas (ordem operacional)
```
Data | Semana | Mês_Ano | Título | Tipo | Criador | Categoria |
Views | Fantasy Clicks | Fantasy Conversion | CTR% | Avg View Dur | Gancho |
Duração | Avg View % | Impr. | CTR% YT | Likes | Inscritos | Conv. Insc. |
Shares | Coment. | Conv. Comm.
```

---

## VELHO
- 1ª linha de métricas: Views | Outlier | Fantasy Clicks | Fantasy Conversion  
  (cores neutras nas métricas Fantasy — sem thresholds verde/amarelo/vermelho)
- 2ª linha: métricas Long Form (CTR / Gancho / Avg View Dur) ou Shorts (Gancho / Avg View Dur)
- Sorts adicionais: Fantasy Clicks · Fantasy Conversion (DESC, nulls no fim)
- Load more: 30 + 30 (inalterado)

---

## Fantasy V1 (pipeline independente — código preservado)

### Feature flag
```javascript
const ENABLE_FANTASY_TAB = false;  // estado FINAL operacional
```

| Flag | Comportamento |
|------|----------------|
| `false` | Aba escondida · **0 fetch** de `fantasy.csv` · ranges Main normais · código V1 preservado |
| `true` | Aba reaparece · `loadFantasyData()` · pipeline V1 completo (KPIs, breakdown, ranking) |

Reativar: alterar apenas `ENABLE_FANTASY_TAB` para `true`.  
Helpers: `isFantasyTabEnabled()`, `syncFantasyTabVisibility()`.

### Pipelines
```
dados.csv
→ parseCSVText()
→ allData (+ fantasyClicks / fantasyConversion)
→ filtros Main
→ Long Form / Shorts / Feedbacks / Base / VELHO

fantasy.csv                    ← só se ENABLE_FANTASY_TAB === true
→ parseFantasyCSV()
→ allFantasyData
→ applyFantasyFilters()
→ filteredFantasy
→ KPIs / breakdown / ranking Fantasy V1
```

- Carregamento isolado (`loadData()` sempre; `loadFantasyData()` só com flag true).
- Falha em `fantasy.csv` **não** derruba o Main; Fantasy mostra erro próprio.
- Pipeline Fantasy V1 **nunca** mistura linhas de `fantasy.csv` em `allData` / `filteredLong` / `filteredShorts` / `filteredAll`.
- Métricas Fantasy do Main vêm de colunas em `dados.csv`, não de `fantasy.csv`.

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

Counts de referência (`allFantasyData` = 2249, quando carregado):
- video rows = 1774
- bio = 82
- unidentified = 393

### Filtros compartilhados que afetam Fantasy V1 (quando ativa)
Data | Semana | Categoria | Creator | Tipo | Título

- Mesmos controles sticky do dashboard.
- Opções reconstruídas por aba (`allData` ↔ `allFantasyData`).
- Seleções preservadas ao trocar de aba (incluindo ghost/indisponível).
- Master **Todos/Todas** = sem restrição semântica (`catAllSelected` / `weekAllSelected` / `titleAllSelected`).

### Ranges numéricos na Fantasy V1 (quando ativa)
Views | Outlier | CTR | Avg View Duration | Gancho | Avg Viewed

- Visualmente disabled na aba Fantasy.
- Valores preservados.
- **Não** entram em `applyFantasyFilters()`.

### Regra de Data
- Com Data preenchida (início e/ou fim): registros **sem** `dataPublicacao` ficam fora (inclui BIO / unidentified sem data).
- Com ambos os inputs vazios (all-time real): registros sem Data podem entrar.

### KPIs Fantasy V1 (sobre `filteredFantasy`)
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

### Estados Fantasy V1 principais
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

### Counts de referência Fantasy V1 (quando carregada)
```
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
5. **Base sort numérico**: nulls sempre no fim (ASC e DESC)

---

## Como fazer alterações com segurança
1. Sempre testar no browser após cada mudança (servidor local: `python -m http.server 8765 --bind 127.0.0.1`)
2. Verificar console (F12) para erros JS
3. Nunca remover `destroyChart()` / destroy do chart Fantasy antes de criar novo gráfico
4. Manter sempre exatamente 3 `<script>` e 3 `</script>` no arquivo
5. Não misturar linhas de `fantasy.csv` no pipeline `allData`
6. Estado operacional da aba Fantasy: `ENABLE_FANTASY_TAB = false` (restaurar após qualquer teste com `true`)
