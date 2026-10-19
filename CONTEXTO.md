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
| Nome na UI | `<title>` e header `<h1>` = **Dashboard Futebol Máximo** · subtítulo = `Dashboard de Análise de Vídeos` |
| Arquivos | `index.html` · `dados.csv` · `fantasy.csv` · `CONTEXTO.md` · `assets/logo-futebol-maximo.png` |
| Scripts | exatamente **3 `<script>`** (Chart.js + annotation + inline) |
| Dependências | sem novas libs além das CDNs Chart já presentes |
| Servidor local | `python -m http.server 8765 --bind 127.0.0.1` |
| URL | http://127.0.0.1:8765/ |

```
index.html
dados.csv
fantasy.csv
CONTEXTO.md
assets/
  logo-futebol-maximo.png   ← logo header + favicon (único path válido)
```

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

### Estado / controle TIPO
```
dashboardFormat = 'longform' | 'shorts'   // default: 'longform'
```

- Label sticky: **TIPO**
- UI: segmented `[ Long Form | Shorts ]` (`#dashFormatSeg` dentro de `#dashboardTipoGroup`)
- Troca **imediata** (não depende de Aplicar)
- Reload → Dashboard + Long Form
- Sessão: formato **persiste** ao trocar de aba e voltar
- **Clear NÃO** reseta `dashboardFormat`
- Sem `localStorage` para esse estado

**Posição na barra (Dashboard):**  
Criador → Categoria → **TIPO** → Data Pub. Início → Data Pub. Fim → Semana de Publicação → Título → Aplicar / Limpar / …  

O toggle **não** fica junto dos botões Aplicar/Limpar/tema. O mesmo `#dashFormatSeg` foi reposicionado (sem duplicar estado/listeners).

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

Três estados **independentes** (sessão; sem localStorage de formato) — **sem vazamento** entre universos:

| Contexto | Estado | UI | Valores internos | Apply |
|----------|--------|-----|------------------|-------|
| Dashboard | `dashboardFormat` | label **TIPO** · `[ Long Form \| Shorts ]` | `longform` / `shorts` | **Imediato** |
| Base + VELHO | `baseVelhoTipo` (compartilhado) | label **TIPO** · `[ Todos \| Long Form \| Shorts ]` | `''` / `'long'` / `'shorts'` | **Aplicar** |
| Fantasy | `fantasyFormatFilter` | label **TIPO** · segmented `#fantasyTipoSeg` | `''` / `long` / `shorts` / `live` / `bio` | **Aplicar** |
| Feedbacks | — | **sem** controle Tipo | — | — |

### Fantasy — TIPO (não é dropdown)
- UI: `[ Todos | Long Form | Shorts | Live | BIO ]` — default **Todos**
- Label visual: **TIPO** (não “FORMATO”)
- UI escreve **Live**; classificação oficial continua `getFantasyFormat(r) === 'LIVE'`
- Valores: Todos→`''` · Long Form→`long` · Shorts→`shorts` · Live→`live` · BIO→`bio`
- **Não identificado** não tem botão no toggle; com TIPO=Todos esses registros **continuam incluídos**. Continua sendo resultado possível de `getFantasyFormat()` e pode aparecer em dimensões/gráficos.
- Clique no Tipo → atualiza `fantasyFormatFilter` + UI (`setFantasyFormatFilter`)
- **Aplicar** → `applyFantasyFilters()` recalcula `filteredFantasy`
- **Limpar** → Tipo volta para Todos

**Posição sticky Fantasy:**  
Criador → Categoria → **TIPO** → Data Clique Início → Data Clique Fim → Semana do Clique → Título → …

### Clear por universo
- Clear Main → `baseVelhoTipo = ''`; **não** altera Fantasy nem `dashboardFormat`
- Clear Fantasy → `fantasyFormatFilter = ''`; **não** altera Base/VELHO nem Dashboard
- Base/VELHO: Tipo entra em `filteredAll` no **Aplicar**

---

## Filtros sticky (multiselect)

Controles: Criador · Categoria · **TIPO** (slot por aba) · Data · Semana · Título · Aplicar · Limpar · 👁️ · tema

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
- Barras: `filteredFantasy` · agrupa por videoId · só `kind === 'video'`
- Controles: Melhores · Piores · **Recentes** · N · Atualizar
- **Recentes = `publishDate` DESC** (publicação do vídeo), **não** `latestClickDate`
- Métricas do vídeo ainda vêm do recorte de **clickDate** atual
- LIVE: barra `#FF495C` (`FANTASY_PERF_LIVE_COLOR`); tooltip pode mostrar `Formato: LIVE`

#### Média no ano / Mediana no ano
Benchmarks das linhas de referência — **respondem ao TIPO Fantasy** (`fantasyFormatFilter`) após Aplicar:

| TIPO | Universo do benchmark |
|------|------------------------|
| Todos | anual geral elegível |
| Long Form | só vídeos Long Form elegíveis |
| Shorts | só Shorts elegíveis |
| Live | só Live elegíveis (`getFantasyFormat === 'LIVE'`) |
| BIO | **—** se não houver vídeos elegíveis (`kind === 'video'`) |

**Fórmula (metodologia inalterada):**
1. `allFantasyData` com `kind === 'video'` e `clickDate` em **2026-01-01…2026-12-31**
2. Se TIPO ≠ Todos → `matchesFantasyFormatFilter`
3. `buildFantasyPerformanceVideos` (dedupe por videoId)
4. `fantasyPerfMetricVal` → `mean()` / `median()`
5. Ignora Data/Semana/Cat/Creator/Título sticky

**Sem amostra anual válida** → `meanVal`/`medianVal` = `null` (exibe —).  
**Não** há fallback para dados fora de 2026 / outro período (removido de propósito — preserva “no ano”).

Sem vídeos elegíveis nas barras: chart é destruído/limpo — **não** reaproveitar Média/Mediana stale do formato anterior.

**KPIs / cards Fantasy não foram alterados** por esta correção (ALL-TIME e regras de Conversion intactas).

### Breakdown
- Posição: após Performance  
- Dimensões: Creator · Categoria · Formato · Destino · Dispositivo  
- Fonte: `filteredFantasy`  
- Formato → `getFantasyFormat`

---

## Identidade visual (logo / favicon / nome)

| Uso | Valor atual |
|-----|-------------|
| Logo header | `<img src="assets/logo-futebol-maximo.png">` — sem fundo azul do antigo emoji |
| Favicon | `<link rel="icon" href="assets/logo-futebol-maximo.png">` |
| Asset oficial | **somente** `assets/logo-futebol-maximo.png` |
| `<title>` | `Dashboard Futebol Máximo` |
| Header `<h1>` | `Dashboard Futebol Máximo` |
| Subtítulo | `Dashboard de Análise de Vídeos` |

- Antigo emoji `⚽` + quadrado azul **não** é mais usado.
- Duplicata acidental `assetslogo-futebol-maximo.png` (raiz) **foi removida** — não documentar como arquivo válido.
- Preservar aspect ratio / `object-fit: contain` / sem distorção.

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

### Snapshot — Performance Fantasy · Média/Mediana no ano (Fantasy Clicks)

> **Dinâmico — snapshot do CSV atual; não é regra fixa.**  
> Validação: TIPO=Todos reproduz o baseline geral anterior à correção do fallback.

```
Todos:      N=238 · Média ≈ 20,950 · Mediana = 6,5
Long Form:  N=128 · Média ≈ 31,492 · Mediana = 9,5
Shorts:     N=107 · Média ≈ 6,804  · Mediana = 6
Live:       N=3   · Média ≈ 75,667 · Mediana = 99
BIO:        N elegível = 0 · Média / Mediana = —
```

---

## HISTÓRICO / DECISÕES IMPORTANTES

- Shorts era aba top-level e foi incorporada ao **Dashboard** via `dashboardFormat` (pipeline Shorts preservado).
- Fantasy migrou para **`fantasy.csv` independente** de `dados.csv`.
- **`clickDate`** (Data Click) e **`publishDate`** (Data Publicação) são campos separados no Fantasy.
- Performance Recentes usa **`publishDate` DESC** (não latest click).
- Fantasy TIPO deixou de ser dropdown FORMATO → segmented Apply-based; UI “Live” vs interno `LIVE`.
- Benchmark Performance: removido fallback fora de 2026; sem amostra anual → —.
- Ranking Fantasy antigo e cards KPI Fantasy no topo LF/Shorts foram removidos.
- Alias parser `'data click' → clickDateRaw` evita `filteredFantasy` zerar com o header atual.
- Flag Fantasy já esteve `ENABLE_FANTASY_TAB = false` — **não** é o estado atual.
- Logo: emoji `⚽` substituído por `assets/logo-futebol-maximo.png` (+ favicon).

---

## Invariantes (não quebrar)

1. Fantasy = `fantasy.csv` · Main = `dados.csv` — nunca misturar pipelines de cálculo  
2. Main date = publicação · Fantasy filter/Temporal date = **click**  
3. Fantasy `publishDate` só onde a semântica exige publicação (ex.: Performance Recentes)  
4. Dashboard LF/Shorts = pipelines separados (`filteredLong` / `filteredShorts` + painéis)  
5. `getFantasyFormat` é a fonte oficial de Formato Fantasy  
6. Dashboard TIPO (`dashboardFormat`) é **imediato**; Fantasy TIPO (`fantasyFormatFilter`) é **Apply-based**  
7. UI Fantasy “Live” **não** altera o valor interno `LIVE`  
8. Sem amostra anual no benchmark Performance → `null` / — — **sem** fallback temporal  
9. Asset oficial logo/favicon = `assets/logo-futebol-maximo.png`  
10. Não remover Tipo/Formato globalmente sem respeitar os 3 contextos (Dashboard / Base·VELHO / Fantasy)  
11. Feedbacks não precisa de controle Tipo visual  
12. Exatamente **3** `<script>` · sem dependências novas sem necessidade  
13. `null` Fantasy Main (`fantasyClicks` / conversion) **não** vira zero silenciosamente  
14. Conversion Fantasy: Views **deduplicadas 1× por videoId**  
15. Temporal/Performance Dashboard **não** reoferecem Fantasy Clicks/Conversion nos dropdowns  
16. Botões Semana/Mês devem refletir `tempMode` / `tempModeShorts` (nunca dessincronizar do gráfico)

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
