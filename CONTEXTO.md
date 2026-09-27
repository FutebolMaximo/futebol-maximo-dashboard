# Futebol Máximo — Dashboard de Performance YouTube

## O que é esse projeto
Dashboard single-file (tudo em um único `index.html`) que carrega CSVs e renderiza
gráficos/tabelas de performance YouTube. Hospedado no GitHub Pages.

**Arquitetura de dados (regra atual):**
- **Main** (Long Form · Shorts · Feedbacks · Base · VELHO) → `dados.csv` / `allData`
- **Aba Fantasy** → **100% `fantasy.csv`** / `allFantasyData` / `filteredFantasy`

Nenhum KPI, Breakdown, Temporal ou Performance da aba Fantasy usa `dados.csv` / `allData`
para cálculo. Os datasets **não** são concatenados.

## Regra mais importante
NUNCA separar o `index.html` em múltiplos arquivos.
Tudo — HTML, CSS, JavaScript — deve permanecer em um único arquivo.

---

## Arquivos do projeto
- `index.html` — dashboard completo (HTML/CSS/JS em um único arquivo)
- `dados.csv` — base Main (**2377** registros)
- `fantasy.csv` — interações Fantasy (**3951** registros; carregado com `ENABLE_FANTASY_TAB = true`)
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
- **Tipo** (dados.csv): formato do conteúdo — "Long Form" / "Shorts" (/ LIVE quando existir no Main)
- **Gancho**: decimal puro (ex: 0.74 = 74%) — só Long Form, ~538 vídeos preenchidos
- **Fantasy Clicks**: `number | null` — vazio no CSV → `null` (NÃO zero)
- **Conversão Fantasy**: decimal `0–1 | null` — ex: `0.02177` = 2,177%; vazio → `null` (NÃO zero)
- **Datas**: podem vir em ISO `YYYY-MM-DD` ou US `M/D/YYYY` — o parser normaliza ambos
- **CSV carregado com cache-busting**: `fetch('dados.csv?v=' + Date.now(), { cache: 'no-store' })`

### Contagens atuais (dados.csv) — baseline
```
allData = 2377
```

> **Histórico (não usar como baseline atual):**  
> `allData = 2369` · `2336` · Long Form 1161 · Shorts 1175 · Fantasy Clicks preenchidos 159 · default 2026 “122 / 1586 clicks”.

---

## Abas do Dashboard (ordem)
1. **Long Form** — KPIs, Evolução Temporal, Scatter, Performance, Heatmaps, Funil
2. **Shorts** — KPIs, Temporal, Scatter, Performance, Heatmap, Funil, Feedback
3. **Feedbacks** — Classificação automática Long Form e Shorts
4. **Base de Dados** — Tabela completa com filtros por coluna
5. **VELHO** — Galeria de cards (main dataset)
6. **Fantasy** — **ATIVA** (`ENABLE_FANTASY_TAB = true`) · **100% fantasy.csv**  
   Seções: KPIs · Unique Visitors por Granularidade · Evolução Temporal · Gráficos de Performance

> **Histórico:** a aba Fantasy já esteve dormente com `ENABLE_FANTASY_TAB = false`. Isso **não** é o estado atual.

---

## Fluxo de dados (variáveis principais)
```
allData          → todos os vídeos parseados de dados.csv
filteredData     → Long Form filtrados pelos filtros globais
filteredLong     → mesmo que filteredData (alias)
filteredShorts   → Shorts filtrados pelos filtros globais
filteredAll      → todos os tipos (usado só na Base de Dados)

allFantasyData   → todas as interações de fantasy.csv
filteredFantasy  → fantasy.csv após filtros compartilhados (pipeline Fantasy)
```

Campos Fantasy no Main (por vídeo, vindos de `dados.csv` — **separados** da aba Fantasy):
```
r.fantasyClicks      → number | null
r.fantasyConversion  → number (0–1) | null
```

---

## Fantasy Clicks + Conversão Fantasy (Main)

Métricas do **Main** vindas de colunas em `dados.csv`.  
**Não** vêm de `fantasy.csv`. **Não** são os KPIs da aba Fantasy.

### Regras de null
- Sem valor no CSV → `null` → UI = `—`
- **Nunca** transformar `null` em `0`
- Ausência de tracking ≠ “zero clicks confirmados”

### Agregações (helpers — Main)
```
sumFantasyClicks(rows)
  → SUM apenas dos fantasyClicks preenchidos
  → se nenhum preenchido: null

aggregateFantasyConversion(rows)
  → SUM(fantasyClicks) / SUM(views) dos vídeos onde fantasyClicks está preenchido
  → NÃO usar AVG(r.fantasyConversion)
  → se nenhum elegível ou denom ≤ 0: null

fmtFantasyCR(rate)  → formata decimal 0–1 como % (preserva CRs muito pequenos)
                    → também usado pelas Conversions da aba Fantasy
```

### Por vídeo
Usar diretamente `r.fantasyClicks` e `r.fantasyConversion` (Performance, VELHO card, Base).

### Onde aparecem no Main
**Long Form / Shorts**
- Funil de Engajamento — **outcome/rodapé** (não é etapa do funil SVG)
- Evolução Temporal (dropdown)
- Performance (dropdown)
- Heatmap Indicadores  
- *(Cards KPI Fantasy Clicks / Fantasy Conversion foram removidos do topo LF/Shorts; métricas permanecem nas superfícies acima.)*

**VELHO**
- Card — 1ª linha: Views | Outlier | Fantasy Clicks | Fantasy Conversion  
- Sort: Fantasy Clicks DESC · Fantasy Conversion DESC (nulls no fim)

**Base de Dados**
- Colunas Fantasy Clicks + Fantasy Conversion (após Views)
- Display: inteiro / `fmtFantasyCR()` · null = `—`

### O que NÃO existe
- Range filters de Fantasy Clicks / Conversão Fantasy
- Fantasy nas regras de Feedback Automático
- Destino / Dispositivo no Main

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
```

---

## Filtros globais (sticky)
Criador | Categoria | Tipo/Formato | Data Início | Data Fim | Semana | Título

- **Default**: Data Início = 01/01/ano atual, Data Fim = hoje
- **Limpar**: reseta para o mesmo default
- Botão 👁️: expande/recolhe todas as seções
- **Tipo no Main**: `dados.csv` · Long Form / Shorts · afeta Base / VELHO
- **Formato na Fantasy**: mesmo controle sticky, mas filtra via `getFantasyFormat(r)`  
  Opções: Todos | Long Form | Shorts | LIVE | BIO | Não identificado
- **Ranges numéricos**: só Main; na Fantasy ficam disabled e são ignorados

### Filtro Semana — UX (multiselect)
- Dropdown **permanece aberto** durante a multiseleção.
- **Não fecha** ao marcar/desmarcar semana ou “Todas”.
- **Fecha** ao clicar fora / outro dropdown.
- Semântica: `weekAllSelected` · `selectedWeeks` · Apply · Clear.

---

## Seções colapsáveis
- `onclick="toggleSection(this)"` no `.section-header`
- Default: expandidas · botão 👁️ · `section-desc` sempre visível
- **Fantasy**: 4 seções com estado **independente**; charts em `chartInstances` para `resize()` ao reabrir

---

## Gráficos (Chart.js)
- `chartInstances{}` — destruir antes de recriar
- Fantasy: `fantasyBreakdownChart` · `fantasyTemporalChart` · `fantasyPerformanceChart`

---

## KPI Cards — Long Form / Shorts (Main)
Métricas clássicas (Views, CTR, Avg View Duration, etc.).  
Fantasy Clicks / Conversion **não** estão mais nos cards do topo; permanecem em Funil / Temporal / Performance / Heatmap.

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
```

Fantasy Clicks / Conversão Fantasy **não entram** nas regras automáticas.

## Lógica de Classificação — Feedback Shorts (classifyVideoShorts)
```javascript
const THRESHOLDS_SHORTS = { views: 98100, ctr: 0.70, avgViewedPct: 75 };
```

---

## Parsing do Gancho
```javascript
gancho: (obj.gancho && obj.gancho.trim())
  ? (obj.gancho.includes('%')
      ? parseFloat(obj.gancho.replace('%',''))/100
      : parseFloat(obj.gancho))
  : null,
```

---

## Heatmap Indicadores / Análise de Duração
- Colunas + **Fantasy Clicks** (soma conhecida) + **Fantasy Conversion** (ponderada) — Main / `dados.csv`
- Null → `—` · Sort numérico · nulls no fim

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
- 1ª linha: Views | Outlier | Fantasy Clicks | Fantasy Conversion
- Sorts Fantasy DESC · nulls no fim · Load more 30+30
- **Não afetado** pelas refatorações da aba Fantasy

---

## Fantasy (pipeline independente — ATIVA — 100% fantasy.csv)

### Feature flag
```javascript
const ENABLE_FANTASY_TAB = true;  // estado ATUAL — aba ATIVA
```

| Flag | Comportamento |
|------|----------------|
| `true` (**atual**) | Aba visível · `loadFantasyData()` · KPIs / breakdown / temporal / performance |
| `false` (**histórico**) | Aba escondida · 0 fetch · código preservado |

Helpers: `isFantasyTabEnabled()`, `syncFantasyTabVisibility()`.

### Pipeline
```
fantasy.csv
→ parseFantasyCSV()
→ allFantasyData
→ applyFantasyFilters()
→ filteredFantasy
→ Fantasy UI
```

```
dados.csv → allData → Main (LF / Shorts / Feedbacks / Base / VELHO)

allFantasyData ≠ allData   // nunca concatenar
```

- Falha em `fantasy.csv` **não** derruba o Main.
- **Nenhum** KPI/chart Fantasy obtém dados de `allData` / `dados.csv`.

### Headers de fantasy.csv
```
Data Publicação, Mês_Ano, Ano, Semana, Video title, Tipo, Categoria,
Creator, Views, Link, URL Video, ID do Vídeo, Formato, Dispositivo,
Visitor ID, Destino
```

- Cada linha = uma interação com `Visitor ID`.
- **Formato** = coluna principal de formato de conteúdo (`longform` / `shorts` / `live` / `BIO`).
- **Tipo** no fantasy.csv = espelho incompleto; usado só como **fallback** (ver `getFantasyFormat`).
- Cache-busting: `fetch('fantasy.csv?v=' + Date.now(), { cache: 'no-store' })`.

### kind
- `bio` → `videoIdRaw === 'BIO'`
- `video` → ID + title + Views + Data Publicação válidos
- `unidentified` → demais

### Baselines atuais
```
allData                      = 2377
allFantasyData               = 3951
filteredFantasy default 2026 = 3308
```

> **Histórico (não usar como baseline atual):**  
> `allData = 2369/2336` · `allFantasyData = 3499/2249` · `filteredFantasy = 3056/1586` · BIO 214 · bio rows 82.

### Classificação all-time por Formato (`getFantasyFormat`)
```
Long Form         = 3018
Shorts            = 583
LIVE              = 67
BIO               = 267
Não identificado  = 16
─────────────────────
Total DISTINCT UV = 3951
```

**Não** calcular Total UV como soma dos segmentos — Total = `COUNT DISTINCT visitorId` global em `allFantasyData`.

### Fallback Tipo (Formato vazio + kind=video)
```
27 rows usam fallback Tipo:
  23 → Long Form
   4 → Shorts
```

---

### `getFantasyFormat(r)` — helper central

Ordem:
1. `kind === 'bio'` → **BIO**
2. Normalizar `r.formato` (trim + lowercase):  
   `longform`→Long Form · `shorts`→Shorts · `live`→LIVE · `bio`→BIO
3. Se Formato vazio e `kind === 'video'`: fallback `r.tipo`  
   (contém long/short/live → Long Form / Shorts / LIVE)
4. Caso contrário → **Não identificado**

**Formato é a fonte PRINCIPAL.** Tipo no fantasy.csv é só fallback para vídeo válido sem Formato.

---

### Filtros na Fantasy
Data | Semana | Categoria | Creator | Formato (controle sticky “Tipo”) | Título

- Opções de Formato reconstruídas via `getFantasyFormat` sobre `allFantasyData`.
- Ao sair da Fantasy, Main volta a opções Tipo de `dados.csv`.
- Ranges numéricos disabled / ignorados.
- Regra de Data: com range ativo, sem `dataPublicacao` → fora (LIVE/BIO atuais sem data saem do default 2026).

### `getFantasyRowsIgnoringFormatFilter()`
- Parte de `allFantasyData`
- Respeita: Data · Semana · Categoria · Creator · Título
- **Ignora** filtro Formato/Tipo
- **Não** altera `filteredFantasy`
- Alimenta cards comparativos LF/Shorts Visitors + Conversions

---

### Seções (4) — Ranking removido
1. **Fantasy · KPIs**
2. **Unique Visitors por Granularidade**
3. **Evolução Temporal**
4. **Gráficos de Performance**

Collapse/expand independente (`toggleSection` · `section-header` · `section-toggle`).  
**Ranking de Vídeos Fantasy** — removido (código exclusivo eliminado). VELHO não afetado.

---

### KPIs Fantasy — layout desktop (5 colunas)

**Linha 1**
| Col | Card | Fonte | Filtros |
|-----|------|-------|---------|
| 1 | Total Unique Visitors | `allFantasyData` DISTINCT | ALL-TIME · ignora filtros · **3951** |
| 2 | Long Form Visitors | DISTINCT UV `getFantasyFormat===Long Form` | Data/Semana/Cat/Creator/Título · **ignora Formato** · default **2852** |
| 3 | Shorts Visitors | idem Shorts | idem · default **456** |
| 4 | LIVE Visitors | `allFantasyData` Formato LIVE | ALL-TIME · **67** (sem Data/Views atribuíveis) |
| 5 | BIO Visitors | `allFantasyData` Formato BIO / kind=bio | ALL-TIME · **267** |

**Linha 2** (alinhada sob cols 1–3)
| Col | Card | Default 2026 |
|-----|------|--------------|
| 1 | Fantasy Conversion | **0,00490%** |
| 2 | Long Form Conversion | **0,0351%** |
| 3 | Shorts Conversion | **0,00077%** |
| 4–5 | *(vazio)* | sem LIVE/BIO Conversion |

Tags **ALL-TIME** somente em: Total UV · LIVE Visitors · BIO Visitors.  
Responsividade: 5 cols → 2 → 1 (reset de grid placement em breakpoints).

**Cards App/Web Unique Visitors** — **removidos** da seção KPI. Destino App/Web continua no Breakdown.

---

### Conversion — 100% fantasy.csv

Helper: `computeFantasyConversionFromRows(rows)` (ou equivalente atual).

```
DISTINCT Visitor IDs elegíveis
/
SUM Views 1× por videoId válido elegível
```

Elegibilidade: `kind === 'video'` · videoId válido · Views finitas · Views > 0.  
BIO / unidentified sem vídeo / LIVE atual (sem Views) **não entram**.  
Formatter: `fmtFantasyCR()`. Sem vídeo elegível → `—` (nunca 0%/NaN/Infinity).

- **Fantasy Conversion**: vídeos elegíveis de `getFantasyRowsIgnoringFormatFilter()` (todos os formatos elegíveis).
- **LF / Shorts Conversion**: mesmo conjunto filtrado + `getFantasyFormat` LF/Shorts.
- **Não existem** LIVE Conversion nem BIO Conversion.

**Não** usar Total UV (3951) como numerador da Fantasy Conversion.

---

### Breakdown — Unique Visitors por Granularidade
Dimensões: Creator | Categoria | **Formato** | Destino | Dispositivo  

Quando dimensão = **Formato**: agrupar exclusivamente com `getFantasyFormat(r)`.  
Grupos possíveis: Long Form · Shorts · LIVE · BIO · Não identificado.

Métrica: `COUNT DISTINCT visitorId` · ordenação UV DESC.  
Labels: `UV · % do total` (1 casa; overlap permitido → soma % pode > 100%).  
Tooltip: UV · % · Views (1×/vídeo) · Fantasy Conversion · Vídeos.

**Default 2026:** LIVE/BIO sem Data ficam fora naturalmente.  
**All-Time:** LIVE e BIO aparecem. **Sem exceção** de Data no Breakdown.

**Destino:** App · Web · Não rastreado.  
**Dispositivo:** valor ou Não identificado.  
Overlap App+Web / desktop+mobile pode ultrapassar Views gerais — esperado.

Estado: `fantasyBreakdownDimension` (default `creator`) · `fantasyBreakdownChart`

---

### Evolução Temporal (100% fantasy.csv)
- Dropdown: Fantasy Clicks | Fantasy Conversion (default Clicks)
- Semana / Mês · eixo = **Data Publicação**
- Clicks = COUNT DISTINCT Visitor ID · Conversion = UV ÷ Views 1×/vídeo no período
- Sem Data → fora do Temporal  
Estado: `fantasyTemporalMetric` · `fantasyTempMode` · `fantasyTemporalChart`

---

### Gráficos de Performance (100% fantasy.csv)
- Só `kind === 'video'` + videoId válido · agrupa por videoId
- Clicks = COUNT DISTINCT Visitor ID · Conversion = Visitors / Views do vídeo
- Controles: N · Melhores · Piores · Recentes · Atualizar  
- Default: Clicks · Recentes · N=20  
Estado: `fantasyPerformanceMetric` · `fantasyPerfMode` · `fantasyPerformanceChart`

---

### LIVE / BIO — decisão atual
- **LIVE** (Formato=`live`): ~67 UV · sem Data/Views/Creator/Categoria · card **ALL-TIME** · kind atual = unidentified
- **BIO**: Formato=BIO + Tipo=BIO + kind=bio · ~267 UV · card **ALL-TIME**
- **Não** forçar LIVE/BIO no recorte 2026 via exceção de Data
- Visibilidade all-time = cards ALL-TIME + Breakdown Formato com Data vazia

---

### Estados Fantasy principais
```
ENABLE_FANTASY_TAB = true

allFantasyData
filteredFantasy
fantasyLoaded
fantasyLoadError
getFantasyFormat(r)
getFantasyRowsIgnoringFormatFilter()
computeFantasyConversionFromRows(rows)
fantasyBreakdownDimension   // default: 'creator' · dimensão formato = 'formato'
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
1. **Fuso horário nos labels do gráfico temporal**: usar `new Date(+y, +m-1, 1)` e NÃO `new Date(k+'-01')`
2. **Gancho zerado**: parser detecta formato automaticamente (com % ou decimal)
3. **Cache do CSV**: sempre `?v=Date.now()` + `cache: 'no-store'`
4. **Datas US format**: normalizar M/D/YYYY → YYYY-MM-DD no parse
5. **Base sort numérico**: nulls sempre no fim (ASC e DESC)

---

## Como fazer alterações com segurança
1. Testar no browser (`python -m http.server 8765 --bind 127.0.0.1`)
2. Verificar console (F12)
3. Destruir charts Fantasy antes de recriar
4. Manter exatamente 3 `<script>` / 3 `</script>`
5. Não misturar `fantasy.csv` no pipeline `allData`
6. Aba Fantasy: `ENABLE_FANTASY_TAB = true` · métricas **somente** via fantasy.csv
7. Segmentação Fantasy: sempre `getFantasyFormat(r)` (não `r.tipo` direto)
