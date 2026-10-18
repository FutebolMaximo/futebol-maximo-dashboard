# Futebol Máximo — Dashboard de Performance YouTube

## O que é
Dashboard single-file (`index.html`) de performance YouTube. Carrega CSVs e renderiza KPIs, gráficos e tabelas (Chart.js).

**Arquitetura de dados (regra atual):**
- **Main** (Dashboard LF/Shorts · Feedbacks · Base · VELHO) → `dados.csv` / `allData`
- **Fantasy** → **100% `fantasy.csv`** / `allFantasyData` / `filteredFantasy`

Nenhum KPI, Temporal, Performance ou Breakdown da Fantasy usa `dados.csv` / `allData` para cálculo. Datasets **não** são concatenados.

## Regra mais importante
NUNCA separar o `index.html` em múltiplos arquivos. HTML, CSS e JS permanecem em um único arquivo.

---

## Projeto / arquivos / runtime

| Item | Valor |
|------|--------|
| Projeto | Futebol Máximo |
| Pasta | `C:\Users\jose\Desktop\IA PROJECTS\Dashboard Futebol Máximo` |
| Arquivos | `index.html` · `dados.csv` · `fantasy.csv` · `CONTEXTO.md` |
| Scripts | exatamente **3 `<script>`** (Chart.js + annotation + inline) |
| Dependências | sem novas libs além das CDNs Chart já presentes |
| Servidor local | `python -m http.server 8765 --bind 127.0.0.1` |
| URL | http://127.0.0.1:8765/ |

---

## Navegação atual (menu)

1. **Dashboard** (`activeTab = 'dashboard'`) — antiga aba “Long Form”
2. **Feedbacks**
3. **Base de Dados** (`basedados`)
4. **VELHO**
5. **Fantasy** (`ENABLE_FANTASY_TAB = true`; botão oculto se flag false)

**Não existe** aba top-level **Shorts**.

Shorts **não** foi eliminado como pipeline: vive em  
`Dashboard` + `dashboardFormat === 'shorts'` → `panelShorts` + `filteredShorts` / `renderShortsAll()`.

---

## Dashboard — Long Form / Shorts

### Estado
```
dashboardFormat = 'longform' | 'shorts'   // default: 'longform'
```

- UI: segmented `[ Long Form | Shorts ]` (`#dashFormatSeg`) — troca **imediata** (sem Aplicar)
- Reload → Dashboard + Long Form
- Sessão: formato **persiste** ao trocar de aba e voltar
- **Clear NÃO** reseta `dashboardFormat`
- Sem `localStorage` para esse estado

### Pipelines (não fundidos)
```
filteredLong / filteredData  → Long Form + baseFilter
filteredShorts               → Shorts + baseFilter
filteredAll                  → Base + VELHO (respeita baseVelhoTipo)
```

Dashboard só escolhe qual painel mostrar:
- `longform` → `panelDashboard`
- `shorts` → `panelShorts`

### Long Form (características)
- KPIs: Views, **CTR%**, Avg View Duration, Avg Viewed %, Minutagem, Impressões, Inscritos, Likes, Comentários, **Gancho**
- Evolução Temporal (`tempMode`, default **month**) — métricas: views, viewsMedian, ctr, ret, insc, dur, gancho  
  (**sem** Fantasy Clicks / Conversion no dropdown)
- Matriz: Avg View Duration × **CTR%**
- Performance (`perfMetric`) — **sem** Fantasy Clicks / Conversion no dropdown
- Heatmap Indicadores (faixas / criadores / categorias) + Heatmap Criador × Categoria
- Funil de Engajamento (inclui Fantasy Clicks como outcome)
- Distribuição de Views (`chartHistViews` / `renderHistograms` · `filteredData`)

### Shorts (características)
Ordem das seções em `panelShorts`:
1. Visão Geral (KPIs: Gancho % no card `skCTR`, Shares no lugar de Gancho separado)
2. Evolução Temporal (`tempModeShorts`, default **month**)
3. Matriz Avg View Duration × **Gancho %**
4. Gráficos de Performance
5. Heatmap Indicadores
6. Funil de Engajamento
7. Distribuição de Views (`chartHistViewsShorts` / `renderShortsHistograms` · `filteredShorts`)

**Temporal Shorts:** default Mês; escolha Semana/Mês persiste na sessão; botões sincronizados via `syncTempModeButtons()` a partir de `tempMode` / `tempModeShorts`.

**Matriz:** legenda **não** mostra `(Sem categoria)`; as rows Sem categoria **continuam** no gráfico.

**Heatmap Indicadores Shorts:**
- Estado: `shortsHeatmapGranularity` = `'creator'` | `'duration'` (default `'creator'`)
- Criadores = comportamento histórico
- Faixa de duração: buckets 30s → `floor(duracao/30)*30` → labels `0–29s`, `30–59s`, …
- `duracao <= 0` / inválida → **Não identificado** (não vira bucket 0–29s)

**Distribuição de Views Shorts:** mesma metodologia de bins 10K do LF; canvas próprio.

### Métricas Fantasy no Dashboard (Main)
**Removidas** dos dropdowns Temporal e Performance (LF e Shorts).

**Ainda usadas** no Main onde aplicável:
- Funil · Heatmaps · Base · VELHO  
Helpers: `sumFantasyClicks` · `aggregateFantasyConversion` · `fmtFantasyCR`  
Fonte: colunas de `dados.csv` (`r.fantasyClicks` / `r.fantasyConversion`), **não** a aba Fantasy.

---

## Tipo / Formato — controles por contexto

Três estados **independentes** (sessão; sem localStorage de formato):

| Contexto | Estado | UI | Valores |
|----------|--------|-----|---------|
| Dashboard | `dashboardFormat` | `[ Long Form \| Shorts ]` | `longform` / `shorts` |
| Base + VELHO | `baseVelhoTipo` (compartilhado) | `[ Todos \| Long Form \| Shorts ]` | `''` / `'long'` / `'shorts'` |
| Fantasy | `fantasyFormatFilter` | dropdown **FORMATO** `#filterTipo` | `''` / long / shorts / live / bio / unidentified |
| Feedbacks | — | **sem** controle Tipo/Formato | — |

- Base/VELHO: Tipo entra em `filteredAll` no **Aplicar** (mesma semântica do antigo dropdown).
- Clear Main → `baseVelhoTipo = ''` (Todos); **não** altera Fantasy nem `dashboardFormat`.
- Clear Fantasy → `fantasyFormatFilter = ''`; **não** altera Base/VELHO nem Dashboard.
- `#filterTipo` é o dropdown **exclusivo da Fantasy** (label FORMATO); opções via `rebuildTipoOptions()` + `getFantasyFormat`.

---

## Filtros sticky (multiselect)

Controles: Criador · Categoria · (slot Tipo/Formato por aba) · Data · Semana · Título · Aplicar · Limpar · 👁️ · tema · (Dashboard: format seg)

**Semana · Categoria · Título:**
- Multiselect permanece **aberto** ao marcar/desmarcar (padrão Semana: `stopPropagation` + re-`open`)
- Fecha: clique fora · abrir outro wrap · **Aplicar** · **Limpar**
- Master “Todos” + auto-check quando todos selecionados

Ranges numéricos: só Main; na Fantasy ficam disabled e são ignorados.

---

## Semântica temporal — dois universos

### Main (`dados.csv`)
```
r.dataPublicacao = DATA DE PUBLICAÇÃO DO CONTEÚDO
r.semana         = semana de publicação (coluna Semana)
```
Estados: `mainDateStart` · `mainDateEnd` · `mainWeekAllSelected` · `mainSelectedWeeks`  
Labels: `DATA PUB. INÍCIO` · `DATA PUB. FIM` · `SEMANA DE PUBLICAÇÃO`

### Fantasy (`fantasy.csv`)
| CSV | Campo JS | Significado |
|-----|----------|-------------|
| **Data Click** | `r.clickDate` | quando o click/visitor aconteceu |
| **Data Publicação** | `r.publishDate` | quando o vídeo foi publicado |
| (derivada) | `r.clickWeek` | semana do **clique** |

Parser (aliases críticos):
```
'data click' → clickDateRaw → r.clickDate
'data publicacao' → publishDateRaw → r.publishDate
```
Sem `clickDate` válida e range de data ativo → row **fora** de `filteredFantasy`.

Estados: `fantasyDateStart` · `fantasyDateEnd` · `fantasyWeekAllSelected` · `fantasySelectedWeeks`  
Labels: `DATA CLIQUE INÍCIO` · `DATA CLIQUE FIM` · `SEMANA DO CLIQUE`

`switchTab` salva/restaura Data/Semana do universo — **sem vazamento**.

Defaults: 01/01 do ano corrente → hoje (Main em `dataPublicacao`; Fantasy em `clickDate`).

---

## Base de Dados

- Coluna **Content ID** entre Mês_Ano e Título  
  Fonte: `dados.csv` → **Content** → `r.id` (texto; não compactar / não perder zeros)
- Ordem relevante: Data · Semana · Mês_Ano · **Content ID** · Título · …
- Filtros individuais por coluna (**removidos**)
- Busca global: `Filtrar na tabela...` (`#tableSearch`) — inclui Content ID
- Sort por header preservado
- Dataset: `filteredAll` (respeita `baseVelhoTipo`)

---

## Feedbacks
- Classificação automática LF (`classifyVideo`) e Shorts (`classifyVideoShorts`)
- Usa `filteredLong` / `filteredShorts`
- **Sem** controle visual Tipo/Formato
- Fantasy Clicks / Conversion **não** entram nas regras automáticas

---

## VELHO
- Galeria sobre `filteredAll` + `isVelhoEligible`
- Shares estado Tipo com Base (`baseVelhoTipo`)
- Cards: Views · Outlier · Fantasy Clicks · Fantasy Conversion (Main/`dados.csv`)

---

## Fantasy — pipeline 100% fantasy.csv

```
fantasy.csv
→ parseFantasyCSV()
→ allFantasyData
→ applyFantasyFilters()   // clickDate / clickWeek + Cat/Creator/Título + fantasyFormatFilter
→ filteredFantasy
→ Fantasy UI
```

Flag: `ENABLE_FANTASY_TAB = true` · `isFantasyTabEnabled()` · `syncFantasyTabVisibility()`.

### Headers atuais (`fantasy.csv`)
```
Visitor ID, ID do Vídeo, Video title, Tipo, Formato, Destino, Dispositivo,
Views, Data Click, Link, URL Video, Categoria, Creator, Data Publicação, Ano
```

### `kind`
- `bio` → `videoIdRaw === 'BIO'`
- `video` → id + title + Views + clickDate
- `unidentified` → demais

### `getFantasyFormat(r)` — Formato oficial
1. `kind === 'bio'` → **BIO**
2. `r.formato` normalizado: longform→Long Form · shorts→Shorts · live→LIVE · bio→BIO
3. Se Formato vazio e `kind === 'video'`: fallback `r.tipo` (long/short/live)
4. Senão → **Não identificado**

### Ordem das seções
1. Fantasy · KPIs  
2. Evolução Temporal  
3. Gráficos de Performance  
4. Unique Visitors por Granularidade  

Collapse: `toggleSection` / `.section-header` / `.section-toggle` · charts em `chartInstances`.

---

### KPIs Fantasy (9 cards)

**Linha 1:** Total UV · Long Form Visitors · Shorts Visitors · LIVE Visitors · BIO Visitors  
**Linha 2:** Fantasy Conversion · Long Form Conversion · Shorts Conversion · **LIVE Conversion**

| Card | Fonte / filtros |
|------|-----------------|
| Total Unique Visitors | `allFantasyData` DISTINCT · **ALL-TIME** |
| LIVE / BIO Visitors | `allFantasyData` · **ALL-TIME** |
| LF / Shorts Visitors | `getFantasyRowsIgnoringFormatFilter()` · clickDate/Semana/Cat/Creator/Título · **ignora Formato** |
| Fantasy / LF / Shorts / LIVE Conversion | mesmo conjunto ignorando Formato + `getFantasyFormat` · **não** ALL-TIME |

**Não existe** BIO Conversion.

Formatters: `fmtFantasyKpiUVFull` (Total + LF Visitors) · `fmtFantasyKpiUV` · `fmtFantasyKpiConv` / `fmtFantasyCR`.

### Conversion
Helper: `computeFantasyConversionFromRows(rows)`
```
COUNT DISTINCT visitorId (vídeos elegíveis)
/
SUM Views 1× por videoId elegível
```
Elegível: `kind === 'video'` · videoId válido · Views finitas > 0.  
Não usar AVG. Não somar Views linha a linha.

### Evolução Temporal Fantasy
- Eixo = **quando os clicks aconteceram** (`clickDate` / `clickWeek`) — **nunca** `publishDate`
- Métricas: Fantasy Clicks | Fantasy Conversion
- Dropdown **Dimensão** (`fantasyTemporalDimension`, default `general`):  
  Geral · Creator · Categoria · Formato · Destino · Dispositivo  
- Formato na dimensão → `getFantasyFormat()`  
- Destino → App / Web / Não rastreado  
- Dispositivo → valor CSV ou Não identificado  
- UV = DISTINCT visitorId por período (+ grupo); Conversion = fórmula Fantasy por célula  
- LIVE na dimensão Formato: cor `#FF495C`

### Performance Fantasy
- `filteredFantasy` · agrupa por videoId · só `kind === 'video'`
- Controles: Melhores · Piores · **Recentes** · N · Atualizar
- **Recentes = `publishDate` DESC** (publicação do vídeo), **não** `latestClickDate`
- Métricas do vídeo ainda vêm do recorte de **clickDate** atual
- LIVE: barra `#FF495C` (`FANTASY_PERF_LIVE_COLOR`); tooltip pode mostrar `Formato: LIVE`
- **Média / Mediana (linhas de referência):**  
  - Universo: vídeos com `clickDate` em **2026** (`allFantasyData`, independente do range sticky de Data/Semana/Cat/Creator/Título)  
  - **Respeitam** `fantasyFormatFilter` (Formato sticky)  
  - Formato = Todos → baseline geral 2026 (comportamento anterior)

### Breakdown
- Posição: após Performance  
- Dimensões: Creator · Categoria · Formato · Destino · Dispositivo  
- Fonte: `filteredFantasy`  
- Formato → `getFantasyFormat`

---

## Cores `#FF495C`
| Uso | Conceito |
|-----|----------|
| Categoria **CORTE** | `NAMED_CAT_COLORS['CORTE']` (Main) |
| Formato **LIVE** | Performance Fantasy + Temporal dimensão Formato |

Mesma cor; regras independentes (Categoria ≠ Formato).

---

## Dark mode
- Toggle tema · `localStorage` key `futebolMaximoTheme`
- `getChartTheme()` · `refreshChartsForTheme()`  
- No Dashboard, refresh prefere o pipeline visível (`renderVisibleDashboardPipeline`)

---

## Snapshot atual dos dados

> **Snapshot — pode mudar quando os CSVs forem regenerados.**  
> Recalculado a partir dos arquivos locais atuais.

### dados.csv (Main)
```
allData (aprox. parser)     ≈ 2413
Long Form                   ≈ 1207
Shorts                      ≈ 1206
Ano 2026                    ≈ 460  (LF ≈ 263 · Shorts ≈ 197)
```

### fantasy.csv
```
allFantasyData              = 5203
Total Unique Visitors       = 5203   (ALL-TIME DISTINCT)
filteredFantasy default*    = 5203   (*clickDate 2026-01-01 → hoje; min=2026-08-05 max=2026-10-15)
LF Visitors (default)       = 3812
Shorts Visitors (default)   = 732
LIVE Visitors (ALL-TIME)    = 227
BIO Visitors (ALL-TIME)     = 416
Não identificado (rows/UV)  = 16

LIVE Conversion (default, ignora Formato):
  UV elegíveis ≈ 227 · Views 1× ≈ 72.871 · rate ≈ 0,3115% · vídeos ≈ 3
```

Classificação rows por `getFantasyFormat` (all-time):  
Long Form 3812 · Shorts 732 · LIVE 227 · BIO 416 · Não identificado 16.

---

## HISTÓRICO / DECISÕES IMPORTANTES

- Shorts era aba top-level e foi incorporada ao **Dashboard** via `dashboardFormat` (pipeline Shorts preservado).
- Fantasy migrou para **`fantasy.csv` independente** de `dados.csv`.
- **`clickDate`** (Data Click) e **`publishDate`** (Data Publicação) são campos separados no Fantasy.
- Performance Recentes usa **`publishDate` DESC** (não latest click).
- Ranking Fantasy antigo e cards KPI Fantasy no topo LF/Shorts foram removidos.
- Alias parser `'data click' → clickDateRaw` evita `filteredFantasy` zerar com o header atual.
- Flag Fantasy já esteve `ENABLE_FANTASY_TAB = false` — **não** é o estado atual.

---

## Invariantes (não quebrar)

1. Fantasy = `fantasy.csv` · Main = `dados.csv` — nunca misturar pipelines de cálculo  
2. Main date = publicação · Fantasy filter/Temporal date = **click**  
3. Fantasy `publishDate` só onde a semântica exige publicação (ex.: Performance Recentes)  
4. Dashboard LF/Shorts = pipelines separados (`filteredLong` / `filteredShorts` + painéis)  
5. `getFantasyFormat` é a fonte oficial de Formato Fantasy  
6. Não remover Tipo/Formato globalmente sem respeitar os 3 contextos (Dashboard / Base·VELHO / Fantasy)  
7. Feedbacks não precisa de controle Tipo visual  
8. Exatamente **3** `<script>` · sem dependências novas sem necessidade  
9. `null` Fantasy Main (`fantasyClicks` / conversion) **não** vira zero silenciosamente  
10. Conversion Fantasy: Views **deduplicadas 1× por videoId**  
11. Temporal/Performance Dashboard **não** reoferecem Fantasy Clicks/Conversion nos dropdowns  
12. Botões Semana/Mês devem refletir `tempMode` / `tempModeShorts` (nunca dessincronizar do gráfico)

---

## Correções conhecidas (não reverter)

1. Fuso nos labels temporais: `new Date(+y, +m-1, 1)` — não `new Date(k+'-01')`  
2. Gancho: parser aceita `%` ou decimal  
3. CSV: `?v=Date.now()` + `cache: 'no-store'`  
4. Datas US → ISO no parse  
5. Sort Base: nulls no fim  

## Como alterar com segurança

1. Servir localmente e validar no browser (F12)  
2. Destruir charts antes de recriar (`chartInstances` / destroy Fantasy)  
3. Preservar estados temporais Main ↔ Fantasy e os 3 estados Tipo/Formato  
4. Segmentação Fantasy sempre via `getFantasyFormat`  
5. Testar Dashboard LF ↔ Shorts (Chart.js resize) após mudanças de painel  
