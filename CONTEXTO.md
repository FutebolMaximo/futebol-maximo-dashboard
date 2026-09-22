# Futebol Máximo — Dashboard de Performance YouTube

## O que é esse projeto
Dashboard single-file (tudo em um único `index.html`) que carrega um `dados.csv`
e renderiza gráficos e tabelas de análise de performance de vídeos do YouTube.
Hospedado no GitHub Pages. Desenvolvido ao longo de meses de iteração.

A aba **Fantasy** (pipeline independente via `fantasy.csv`) está **ATIVA**.

## Regra mais importante
NUNCA separar o `index.html` em múltiplos arquivos.
Tudo — HTML, CSS, JavaScript — deve permanecer em um único arquivo.

---

## Arquivos do projeto
- `index.html` — dashboard completo (HTML/CSS/JS em um único arquivo)
- `dados.csv` — base de dados dos vídeos (**2369** registros)
- `fantasy.csv` — interações Fantasy (**3499** registros; carregado quando `ENABLE_FANTASY_TAB = true`)
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

### Contagens atuais (dados.csv) — baseline
```
allData = 2369
```

> **Histórico (não usar como baseline atual):**  
> `allData = 2336` · Long Form 1161 · Shorts 1175 · Fantasy Clicks preenchidos 159 · default 2026 “vídeos com Fantasy = 122 / 1586 clicks”.

---

## Abas do Dashboard (ordem)
1. **Long Form** — KPIs, Evolução Temporal, Scatter, Performance, Heatmaps, Funil
2. **Shorts** — KPIs, Temporal, Scatter, Performance, Heatmap, Funil, Feedback
3. **Feedbacks** — Classificação automática Long Form e Shorts
4. **Base de Dados** — Tabela completa com filtros por coluna
5. **VELHO** — Galeria de cards (main dataset)
6. **Fantasy** — **ATIVA** (`ENABLE_FANTASY_TAB = true`)  
   Seções: KPIs · Unique Visitors por Granularidade · Evolução Temporal · Gráficos de Performance  
   (pipeline isolado a partir de `fantasy.csv`; ver seção Fantasy)

> **Histórico:** a aba Fantasy já esteve dormente com `ENABLE_FANTASY_TAB = false` (código preservado, sem fetch). Isso **não** é o estado atual.

---

## Fluxo de dados (variáveis principais)
```
allData          → todos os vídeos parseados de dados.csv
filteredData     → Long Form filtrados pelos filtros globais
filteredLong     → mesmo que filteredData (alias)
filteredShorts   → Shorts filtrados pelos filtros globais
filteredAll      → todos os tipos (usado só na Base de Dados)
```

Campos Fantasy no Main (por vídeo, vindos de `dados.csv` — **não confundir** com Fantasy V1 / BIO Visitors):
```
r.fantasyClicks      → number | null
r.fantasyConversion  → number (0–1) | null
```

---

## Fantasy Clicks + Conversão Fantasy (Main)

Métricas do **Main** vindas de colunas em `dados.csv`.  
**Não** vêm de `fantasy.csv`. **Não** são o KPI BIO Visitors nem o pipeline Fantasy V1.

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
- **Não afetado** pelas mudanças da aba Fantasy / remoção do Ranking Fantasy

**Base de Dados**
- Colunas Fantasy Clicks + Fantasy Conversion (após Views)
- Display: inteiro / `fmtFantasyCR()` · null = `—`
- Sort numérico no valor real · nulls no fim

### O que NÃO existe
- Range filters de Fantasy Clicks / Conversão Fantasy
- Fantasy nas regras de Feedback Automático
- Destino / Dispositivo no Main
- Aba temporal Fantasy separada no Main

### Referências de agregação Main (validação histórica — revalidar se CSV mudar)
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
- **Tipo na Fantasy**: opções atuais = Todos | Long Form | Shorts. **BIO não é opção** no filtro Tipo (conhecido; sem correção nesta etapa)
- **Ranges numéricos** (Views, Outlier, CTR, Avg View Duration, Gancho, Avg Viewed): afetam o pipeline Main; na aba Fantasy ficam disabled e são ignorados
- **Sem** ranges Fantasy no Main

### Filtro Semana — UX atual (multiselect)
- Dropdown **permanece aberto** durante a multiseleção.
- **Não fecha** ao marcar semana, desmarcar semana ou clicar “Todas”.
- **Fecha** ao clicar fora / interagir com outro dropdown (comportamento atual).
- Semântica inalterada: `weekAllSelected` · `selectedWeeks` · Apply · Clear.

---

## Seções colapsáveis
Todas as seções têm `onclick="toggleSection(this)"` no `.section-header`.
- Default: todas expandidas
- `expandAllSections()` / `collapseAllSections()` controladas pelo botão 👁️
- `section-desc` (descrição) sempre visível mesmo quando recolhida
- **Fantasy**: as 4 seções usam o **mesmo** padrão visual/comportamental de Long Form e Shorts (`section-header` · `section-toggle` · `toggleSection()`), com estado **independente** por seção
- Charts Fantasy registrados em `chartInstances` para `resize()` ao reabrir

---

## Gráficos (Chart.js)
- Instâncias guardadas em `chartInstances{}` — sempre destruir antes de recriar
- `destroyChart(id)` antes de `new Chart(...)`
- Cores por categoria em `CAT_COLORS{}`
- Fantasy: `fantasyBreakdownChart` · `fantasyTemporalChart` · `fantasyPerformanceChart` (destroy próprio + registro em `chartInstances`)

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
- **Não afetado** pela remoção do Ranking Fantasy nem pelo KPI BIO Visitors

---

## Fantasy (pipeline independente — ATIVA)

### Feature flag / status atual
```javascript
const ENABLE_FANTASY_TAB = true;  // estado ATUAL — aba ATIVA
```

| Flag | Comportamento |
|------|----------------|
| `true` (**atual**) | Aba visível · `loadFantasyData()` · pipeline completo (KPIs, breakdown, temporal, performance) |
| `false` (**histórico**) | Aba escondida · **0 fetch** de `fantasy.csv` · ranges Main normais · código preservado |

Helpers: `isFantasyTabEnabled()`, `syncFantasyTabVisibility()`.

### Pipeline
```
fantasy.csv
→ parseFantasyCSV()
→ allFantasyData
→ applyFantasyFilters()
→ filteredFantasy
→ Fantasy UI (KPIs / breakdown / temporal / performance)
```

Isolamento do Main:
```
dados.csv → allData → filtros Main → Long Form / Shorts / Feedbacks / Base / VELHO

allFantasyData ≠ allData
```
- **Não** concatenar datasets.
- Falha em `fantasy.csv` **não** derruba o Main; Fantasy mostra erro próprio.
- Pipeline Fantasy **nunca** mistura linhas de `fantasy.csv` em `allData` / `filteredLong` / `filteredShorts` / `filteredAll`.
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

### Baselines atuais (Fantasy)
```
allData                 = 2369
allFantasyData          = 3499
filteredFantasy default 2026 = 3056

BIO:
  kind === 'bio'        = 214 linhas
  Distinct BIO Visitors = 214
```

> **Histórico (não usar como baseline atual):**  
> `allFantasyData = 2249` · `filteredFantasy default = 1586` · bio = 82 · unidentified = 393 · video rows = 1774.

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
```javascript
if (dateStart || dateEnd) {
  if (!r.dataPublicacao) return false;
  // ... comparações de range
}
```
- Com Data preenchida (início e/ou fim): registros **sem** `dataPublicacao` ficam fora (inclui BIO / unidentified sem data).
- Com ambos os inputs vazios (all-time real): registros sem Data podem entrar.

### Seções atuais (4) — Ranking removido
1. **Fantasy · KPIs** (collapse/expand)
2. **Unique Visitors por Granularidade** (collapse/expand)
3. **Evolução Temporal** (collapse/expand)
4. **Gráficos de Performance** (collapse/expand)

**Ranking de Vídeos Fantasy** — **removido completamente**. Não existe mais na UI.

Código exclusivo removido (referência):  
`buildFantasyVideoRanking` · `sortFantasyRanking` · `setFantasySort` · `loadMoreFantasy` · `renderFantasyRanking` · `fmtFantasyInt` · `renderFantasyStatus` · `fantasySort` · `fantasyVisibleCount` · HTML/CSS exclusivos do ranking.  
**VELHO não foi afetado.**

---

### KPIs Fantasy — 6 cards

| # | Card | Fonte | Notas |
|---|------|-------|-------|
| 1 | Unique Visitors | `filteredFantasy` | responde a filtros |
| 2 | Vídeos que geraram visitantes | `filteredFantasy` | responde a filtros |
| 3 | Conversion Rate | `filteredFantasy` | responde a filtros |
| 4 | App Unique Visitors | `filteredFantasy` | responde a filtros |
| 5 | Web Unique Visitors | `filteredFantasy` | responde a filtros |
| 6 | **BIO Visitors** | **`allFantasyData`** | **ALL-TIME · ignora filtros** |

#### KPIs 1–5 (sobre `filteredFantasy`)
1. **UNIQUE VISITORS** — `COUNT DISTINCT visitorId` (inclui video + bio + unidentified **quando estão no filteredFantasy**)
2. **VÍDEOS QUE GERARAM VISITANTES** — `COUNT DISTINCT` vídeo válido (`kind === 'video'`)
3. **CONVERSION RATE** — UV total ÷ SUM Views **1× por vídeo válido**
4. **APP UNIQUE VISITORS** — UV com `destino === 'App'`
5. **WEB UNIQUE VISITORS** — UV com `destino === 'Web'`

Conversion Rate:
- Numerador: Unique Visitors do recorte filtrado.
- Denominador: Views deduplicadas só de `kind === 'video'`.
- BIO/unidentified **não** somam Views no denominador.
- Formatter: `fmtFantasyCR()`.

#### BIO Visitors (card 6 — especial)
```
COUNT DISTINCT visitorId
em allFantasyData
onde kind === 'bio'
```
- Valor atual de referência: **214** (calculado dinamicamente; **não** hardcoded).
- Tag visual: **ALL-TIME**.
- Tooltip/título: “All-time. Registros BIO não possuem Data Publicação.”
- Empty (dados carregados, zero BIO): **0**. Erro de load: `—` (estado da aba).

**Ignora filtros:** Data · Semana · Categoria · Creator · Tipo · Título.

**NÃO entra em:** Unique Visitors filtrado · Conversion Rate · App · Web.  
**Não** somar automaticamente BIO Visitors ao total principal.

---

### Breakdown — Unique Visitors por Granularidade
Dimensões: Creator | Categoria | Tipo | Destino | Dispositivo  
Métrica: `COUNT DISTINCT visitorId` por grupo.  
Ordenação: UV DESC.

**Labels nas barras:** `UV · % do total` (ex.: `1846 · 60,4%`)  
```
pct = groupUniqueVisitors / totalUniqueVisitors(filteredFantasy)
```
1 casa decimal. Overlap permitido → soma dos % pode ultrapassar 100%.

**Tooltip:** Unique Visitors · % do total · Views · Fantasy Conversion · Vídeos  
- Views = SUM Views **1×** por `videoId` válido distinto do grupo  
- Vídeos = COUNT DISTINCT `videoId` só `kind === 'video'`  
- Fantasy Conversion = UV do grupo ÷ SUM Views dos vídeos válidos distintos  
- BIO/unidentified sem vídeo válido: Views = `—` · Conversion = `—` · Vídeos = 0

**Destino / Dispositivo:** o mesmo vídeo pode aparecer em mais de um grupo → Views App+Web (ou desktop+mobile+tablet) podem ultrapassar Views gerais. **Esperado.**

Labels de fallback:
- BIO sem Creator/Categoria/Tipo → **BIO**
- unidentified / vídeo sem dimensão → **Não identificado**
- Destino vazio → **Não rastreado**
- Dispositivo vazio → **Não identificado**

Estado: `fantasyBreakdownDimension` (default `creator`) · `fantasyBreakdownChart`

**Sem exceção temporal para BIO no breakdown** (ver decisão BIO abaixo).

---

### Evolução Temporal
Dropdown: **Fantasy Clicks** | **Fantasy Conversion** (default: Fantasy Clicks).  
Granularidade: Por Semana | Por Mês.  
Tempo baseado em **Data Publicação** (não é a data real do clique).

- **Fantasy Clicks (período):** `COUNT DISTINCT Visitor ID` (não contar linhas).
- **Fantasy Conversion (período):** distinct UV ÷ SUM Views **1×** por vídeo válido distinto do período. Sem AVG simples. Denom ≤ 0 → `null`.
- Registros **sem** Data Publicação ficam **fora** do temporal (BIO/unidentified sem data excluídos).

Estado: `fantasyTemporalMetric` · `fantasyTempMode` · `fantasyTemporalChart`

---

### Gráficos de Performance
Somente `kind === 'video'` + `videoId` válido.  
**BIO e unidentified NÃO entram.**

Agrupamento por `videoId` (uma barra por vídeo):
- **Fantasy Clicks** = COUNT DISTINCT Visitor ID do vídeo
- **Fantasy Conversion** = Clicks ÷ Views do vídeo (Views 1×; Views ≤ 0 → `null`)

Controles (mesmo UX de LF/Shorts): N vídeos · Melhores · Piores · Recentes · Atualizar  
Default: métrica **Fantasy Clicks** · modo **Recentes** · **N = 20**  
Melhores/Piores ordenam pela métrica (nulls no fim). Recentes = Data Publicação DESC.

Estado: `fantasyPerformanceMetric` · `fantasyPerfMode` · `fantasyPerformanceChart`  
Deriva de `filteredFantasy` (respeita filtros), depois filtra vídeo válido.

---

### BIO — diagnóstico e decisão atual

#### Diagnóstico (dados)
```
Tipo = BIO              = 214 linhas
kind = bio              = 214  (mesmo conjunto)
Distinct UV BIO         = 214
Data Publicação válida  = 0
```

**Presentes:** `videoIdRaw = BIO` · `Tipo = BIO` · Dispositivo · Destino parcial  
**Ausentes:** Data Publicação · Ano · Semana · Creator · Categoria · Views · Title

#### BIO + filtro temporal
Com Data ativa, `applyFantasyFilters` remove registros sem Data → **BIO não entra em `filteredFantasy` no default 2026**.

Com datas vazias (All-Time), BIO **aparece** no breakdown. Dimensão Tipo all-time inclui Long Form · Shorts · BIO · Não identificado (quando existirem). Não hardcodar os UV por grupo.

#### Decisão aprovada atual
- **NÃO** criar exceção temporal para forçar BIO dentro do recorte 2026.
- O card **BIO Visitors (ALL-TIME)** é a solução atual para dar visibilidade ao tráfego BIO **sem contaminar** filtros temporais / KPI filtrado / CR / Temporal / Performance.

#### Filtro Tipo
Oferece: Todos | Long Form | Shorts. **BIO não é opção** (conhecido; sem correção nesta etapa).

---

### Estados Fantasy principais
```
ENABLE_FANTASY_TAB = true

allFantasyData
filteredFantasy
fantasyLoaded
fantasyLoadError
fantasyBreakdownDimension   // default: 'creator'
fantasyBreakdownChart
fantasyTemporalMetric       // default: 'clicks'
fantasyTempMode             // default: 'week'
fantasyTemporalChart
fantasyPerformanceMetric    // default: 'clicks'
fantasyPerfMode             // default: 'recent'
fantasyPerformanceChart
```

### Scripts
Exatamente **3 `<script>`** no `index.html`. Sem novas CDNs/dependências.

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
3. Nunca remover `destroyChart()` / destroy dos charts Fantasy antes de criar novo gráfico
4. Manter sempre exatamente 3 `<script>` e 3 `</script>` no arquivo
5. Não misturar linhas de `fantasy.csv` no pipeline `allData`
6. Estado operacional da aba Fantasy: `ENABLE_FANTASY_TAB = true` (aba ATIVA)
