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
- `fantasy.csv` — interações Fantasy (**3976** registros; carregado com `ENABLE_FANTASY_TAB = true`)
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

> **HISTÓRICO (não usar como baseline atual):**  
> `allData = 2369` · `2336` · Long Form 1161 · Shorts 1175 · Fantasy Clicks preenchidos 159 · default 2026 “122 / 1586 clicks”.

---

## Abas do Dashboard (ordem)
1. **Long Form** — KPIs, Evolução Temporal, Scatter, Performance, Heatmaps, Funil
2. **Shorts** — KPIs, Temporal, Scatter, Performance, Heatmap, Funil, Feedback
3. **Feedbacks** — Classificação automática Long Form e Shorts
4. **Base de Dados** — Tabela completa com filtros por coluna
5. **VELHO** — Galeria de cards (main dataset)
6. **Fantasy** — **ATIVA** (`ENABLE_FANTASY_TAB = true`) · **100% fantasy.csv**  
   Seções (ordem atual): KPIs · Evolução Temporal · Gráficos de Performance · Unique Visitors por Granularidade

> **HISTÓRICO:** a aba Fantasy já esteve dormente com `ENABLE_FANTASY_TAB = false`. Isso **não** é o estado atual.

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

## Semântica temporal — DOIS universos

### Main / dados.csv
```
r.dataPublicacao  =  DATA DE PUBLICAÇÃO DO VÍDEO
```
Usado por: Long Form · Shorts · Feedbacks · Base · VELHO.

### Fantasy / fantasy.csv
Coluna física atual do CSV:
```
Data Click
```
Semanticamente = **DATA DO CLIQUE / VISITA DO VISITOR**.

No parser Fantasy:
```
r.clickDate   → ISO YYYY-MM-DD
r.clickWeek   → semana do clique (ex.: W39/26)
```

**NÃO** tratar `r.clickDate` como data de publicação do vídeo dentro da Fantasy.

> **HISTÓRICO:** versões anteriores do `fantasy.csv` usavam o header `Data Publicação` para o mesmo significado de clique. O parser Fantasy mapeia a coluna de clique para `r.clickDate` (aliases previstos incluem variações de “data de clique” / “data publicação” legada).

### Semana
| Universo | Campo | Origem |
|----------|-------|--------|
| Main | `r.semana` | coluna Semana de `dados.csv` (semana de **publicação**) |
| Fantasy | `r.clickWeek` | se existir coluna Semana no CSV → reutilizar (validada como semana da clickDate); senão → `deriveFantasyClickWeek(clickDate)` |

**CSV atual:** não há coluna `Semana` em `fantasy.csv` → `clickWeek` é **sempre derivada** de `r.clickDate`.

### Estados temporais independentes
Main e Fantasy **não** compartilham o mesmo estado de Data/Semana.

```
Main:
  mainDateStart · mainDateEnd
  mainWeekAllSelected · mainSelectedWeeks

Fantasy:
  fantasyDateStart · fantasyDateEnd
  fantasyWeekAllSelected · fantasySelectedWeeks
```

Ao trocar de aba (`switchTab`):
1. Salva Data/Semana do universo que está saindo
2. Restaura Data/Semana do universo que está entrando

Os estados **não vazam** entre universos.

### Labels dinâmicos dos filtros
| Universo ativo | Labels |
|----------------|--------|
| Main | `DATA PUB. INÍCIO` · `DATA PUB. FIM` · `SEMANA DE PUBLICAÇÃO` |
| Fantasy | `DATA CLIQUE INÍCIO` · `DATA CLIQUE FIM` · `SEMANA DO CLIQUE` |

Controles visuais são os mesmos inputs/dropdown; só o texto do label muda.

### Clear
| Onde | Efeito temporal |
|------|-----------------|
| Clear no Main | reseta Data/Semana **Main** para defaults Main · **não** altera Fantasy |
| Clear na Fantasy | reseta Data/Semana **Fantasy** para defaults Fantasy (baseados em `clickDate`) · **não** altera Main |

Demais filtros compartilhados (Creator / Categoria / Título / Formato) seguem o Clear atual.

### Defaults
- **Main:** 01/01 do ano corrente → hoje, baseado em `dados.csv` / `r.dataPublicacao`
- **Fantasy:** 01/01 do ano corrente → hoje, baseado em `clickDate` (não em `dados.csv`). Fallback seguro se não houver clicks no ano corrente.

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

- **Default Main:** Data Início = 01/01/ano atual, Data Fim = hoje (`dataPublicacao`)
- **Default Fantasy:** idem, mas sobre `clickDate`
- **Limpar:** reseta Data/Semana **somente do universo ativo**
- Botão 👁️: expande/recolhe todas as seções
- **Tipo no Main:** `dados.csv` · Long Form / Shorts · afeta Base / VELHO
- **Formato na Fantasy:** mesmo controle sticky, mas filtra via `getFantasyFormat(r)`  
  Opções: Todos | Long Form | Shorts | LIVE | BIO | Não identificado
- **Ranges numéricos:** só Main; na Fantasy ficam disabled e são ignorados

### Filtro Semana — UX (multiselect)
- Dropdown **permanece aberto** durante a multiseleção.
- **Não fecha** ao marcar/desmarcar semana ou “Todas”.
- **Fecha** ao clicar fora / outro dropdown.
- Main: opções de Semana de Publicação (universo `dados.csv`).
- Fantasy: opções de Semana do Clique (`clickWeek` / `clickDate`).
- Estados de seleção **independentes** entre Main e Fantasy.

---

## Seções colapsáveis
- `onclick="toggleSection(this)"` no `.section-header`
- Default: expandidas · botão 👁️ · `section-desc` sempre visível
- **Fantasy:** 4 seções com estado **independente**; charts em `chartInstances` para `resize()` ao reabrir

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
→ applyFantasyFilters()   // clickDate / clickWeek + filtros compartilhados
→ filteredFantasy
→ Fantasy UI
```

```
dados.csv → allData → Main (LF / Shorts / Feedbacks / Base / VELHO)

allFantasyData ≠ allData   // nunca concatenar
```

- Falha em `fantasy.csv` **não** derruba o Main.
- **Nenhum** KPI/chart Fantasy obtém dados de `allData` / `dados.csv`.

### Headers de fantasy.csv (atuais)
```
Video title, Tipo, Categoria, Creator, Views, Link, URL Video,
ID do Vídeo, Formato, Dispositivo, Visitor ID, Data Click, Destino
```

- Cada linha = uma interação com `Visitor ID`.
- **`Data Click`** = data do clique/visita → mapeada para **`r.clickDate`**.
- **Formato** = coluna principal de formato de conteúdo (`longform` / `shorts` / `live` / `BIO`).
- **Tipo** no fantasy.csv = espelho incompleto; usado só como **fallback** (ver `getFantasyFormat`).
- Colunas `Semana` / `Mês_Ano` / `Ano` **não existem** no CSV atual → `clickWeek` derivada de `clickDate`.
- Cache-busting: `fetch('fantasy.csv?v=' + Date.now(), { cache: 'no-store' })`.

### kind
- `bio` → `videoIdRaw === 'BIO'`
- `video` → ID + title + Views + **clickDate** válidos
- `unidentified` → demais

### Baselines atuais (recalculados do CSV atual)
```
allData                         = 2377
allFantasyData                  = 3976
filteredFantasy default         = 3976   // 2026-01-01 → hoje; clickDate min=2026-08-05
Total Unique Visitors (ALL-TIME)= 3976
LF Visitors (default filtrado)  = 3034
Shorts Visitors (default)       = 589
LIVE Visitors (ALL-TIME)        = 67
BIO Visitors (ALL-TIME)         = 270

clickDate: com data = 3976 · sem data = 0
clickDate min/max   = 2026-08-05 / 2026-09-27
```

> **HISTÓRICO (não usar como baseline atual):**  
> `allFantasyData = 3951 / 3499 / 2249` · `filteredFantasy = 3308 / 3306 / 3056 / 1586` · Total UV `3943` · BIO `267` / `214` · LF Visitors default `2852` · Shorts default `456`.

### Classificação all-time por Formato (`getFantasyFormat`) — rows
```
Long Form         = 3034
Shorts            = 589
LIVE              = 67
BIO               = 270
Não identificado   = 16
─────────────────────
Total DISTINCT UV = 3976
```

**Não** calcular Total UV como soma dos segmentos — Total = `COUNT DISTINCT visitorId` global em `allFantasyData`.

### Fallback Tipo (Formato vazio + kind=video) — atual
```
27 rows usam fallback Tipo:
  23 → Long Form
   4 → Shorts
```
Esses registros **não** devem ser perdidos (permanecem classificados via Tipo).

---

### `getFantasyFormat(r)` — helper central

Ordem:
1. `kind === 'bio'` → **BIO**
2. Normalizar `r.formato` (trim + lowercase):  
   `longform`→Long Form · `shorts`→Shorts · `live`→LIVE · `bio`→BIO
3. Se Formato vazio e `kind === 'video'`: fallback `r.tipo`  
   (contém long/short/live → Long Form / Shorts / LIVE)
4. Caso contrário → **Não identificado**

**Formato é a fonte PRINCIPAL** de segmentação de conteúdo no fantasy.csv.  
Tipo é só fallback para buracos de metadado em vídeos válidos.

---

### Filtros na Fantasy
Data do Clique | Semana do Clique | Categoria | Creator | Formato (controle sticky “Tipo”) | Título

- Filtragem temporal: **`r.clickDate` / `r.clickWeek`** (nunca `r.dataPublicacao` / semana de publicação).
- Com range de Data ativo e `r.clickDate` vazia → row **fora** do recorte.
- Opções de Formato reconstruídas via `getFantasyFormat` sobre `allFantasyData`.
- Ao sair da Fantasy, Main volta a opções Tipo de `dados.csv`.
- Ranges numéricos disabled / ignorados.

### `getFantasyRowsIgnoringFormatFilter()`
- Parte de `allFantasyData`
- Respeita: **clickDate** · **clickWeek** · Categoria · Creator · Título
- **Ignora** filtro Formato/Tipo
- **Não** altera `filteredFantasy`
- Alimenta cards comparativos: LF/Shorts Visitors + Conversions

---

### Seções (4) — ordem ATUAL
1. **Fantasy · KPIs**
2. **Evolução Temporal**
3. **Gráficos de Performance**
4. **Unique Visitors por Granularidade**

Collapse/expand independente (`toggleSection` · `section-header` · `section-toggle`).  
Charts registrados em `chartInstances` para resize ao reabrir.

> **HISTÓRICO:** Breakdown já esteve **antes** do Temporal/Performance. Ordem antiga e “Ranking de Vídeos Fantasy” **não** são o estado atual (Ranking removido).

---

### KPIs Fantasy — estrutura visual

**8 cards.** No desktop: grid de **5 colunas**; linha 2 alinhada nas colunas 1–3.  
Responsividade: **5 → 2 → 1**.

**Linha 1**
| Col | Card | Fonte | Filtros |
|-----|------|-------|---------|
| 1 | Total Unique Visitors | `allFantasyData` DISTINCT | ALL-TIME · ignora filtros |
| 2 | Long Form Visitors | DISTINCT UV `getFantasyFormat===Long Form` | clickDate/clickWeek/Cat/Creator/Título · **ignora Formato** |
| 3 | Shorts Visitors | idem Shorts | idem |
| 4 | LIVE Visitors | `allFantasyData` Formato LIVE | ALL-TIME |
| 5 | BIO Visitors | `allFantasyData` Formato BIO / kind=bio | ALL-TIME |

**Linha 2** (cols 1–3; cols 4–5 vazias)
| Col | Card |
|-----|------|
| 1 | Fantasy Conversion |
| 2 | Long Form Conversion |
| 3 | Shorts Conversion |

**Não existem:** LIVE Conversion · BIO Conversion · cards App/Web Unique Visitors  
(App/Web continuam no Breakdown → Destino.)

Tags **ALL-TIME** somente em: Total UV · LIVE Visitors · BIO Visitors.

### Cards sem descrição visual
Os cards Fantasy mostram somente:
- título
- valor
- tag ALL-TIME (quando aplicável)

Textos secundários / `kpi-sub` foram **removidos**.  
Tooltips / atributo `title` HTML podem permanecer.

### Formatter dos Visitors
| Card | Formatter | Exibição |
|------|-----------|----------|
| Total Unique Visitors | `fmtFantasyKpiUVFull` | inteiro completo `pt-BR` (ex.: `3.976`) — **não** compactar (`4.0K`) |
| Long Form Visitors | `fmtFantasyKpiUVFull` | inteiro completo — **não** compactar (`2.9K`) |
| Shorts / LIVE / BIO | `fmtFantasyKpiUV` → `fmtNum` | pode compactar |
| Conversions | `fmtFantasyKpiConv` / `fmtFantasyCR` | % |

Valores atuais (recalculados; **não** hardcodar na UI):
```
Total Unique Visitors = 3976
LF Visitors default   = 3034
Shorts Visitors def.  = 589
LIVE Visitors         = 67
BIO Visitors          = 270
```

---

### Total Unique Visitors
- Fonte: `allFantasyData`
- Fórmula: `COUNT DISTINCT visitorId`
- **ALL-TIME** — não responde a filtros
- **Não** é soma dos formatos

### Long Form Visitors / Shorts Visitors
- Fonte: `fantasy.csv` via `getFantasyRowsIgnoringFormatFilter()`
- Fórmula: `COUNT DISTINCT visitorId` onde `getFantasyFormat(r)` = Long Form / Shorts
- Responde a: clickDate · clickWeek · Categoria · Creator · Título
- **Ignora** filtro Formato (comparação intencional LF × Shorts)

### LIVE Visitors / BIO Visitors
- Fonte: `allFantasyData`
- `COUNT DISTINCT visitorId` com `getFantasyFormat` LIVE / BIO
- **ALL-TIME** — não respondem ao filtro de Data
- **CSV atual:** LIVE e BIO **possuem** `clickDate` válida → entram naturalmente em `filteredFantasy` / Breakdown quando o recorte temporal os inclui
- Sem exceção artificial de Data

---

### Conversion — 100% fantasy.csv

Helper: `computeFantasyConversionFromRows(rows)`.

```
COUNT DISTINCT visitorId elegível
/
SUM Views 1× por videoId válido elegível
```

Elegibilidade: `kind === 'video'` · videoId válido · Views finitas · Views > 0.  
**Não** usar AVG. **Não** somar Views linha a linha.  
BIO / unidentified sem vídeo elegível não entram.  
Formatter: `fmtFantasyCR()`. Sem vídeo elegível → `—`.

- **Fantasy Conversion:** vídeos elegíveis de `getFantasyRowsIgnoringFormatFilter()`.
- **LF / Shorts Conversion:** mesmo conjunto + `getFantasyFormat` LF/Shorts.
- **Não** usar Total UV como numerador.

Referência default atual (recalculada; revalidar se CSV mudar):
```
Fantasy Conversion ≈ 0,00266%
LF Conversion      ≈ 0,0254%
Shorts Conversion  ≈ 0,00047%
```

---

### Evolução Temporal (100% fantasy.csv) — eixo = CLIQUE

> **IMPORTANTE:** Temporal Fantasy **NÃO** usa data de publicação do vídeo.  
> Usa **`clickDate` / `clickWeek`** = quando os clicks/visitors aconteceram.

- Dropdown: Fantasy Clicks | Fantasy Conversion (default Clicks)
- Semana / Mês · agrupamento via `groupFantasyByPeriod` (`clickWeek` / `clickDate`)
- **Fantasy Clicks** por período: `COUNT DISTINCT visitorId`
- **Fantasy Conversion** por período: fórmula aprovada (`computeFantasyConversionFromRows`) no período de clique
- Sem `clickDate` → fora do Temporal  
Estado: `fantasyTemporalMetric` · `fantasyTempMode` · `fantasyTemporalChart`

> **HISTÓRICO:** documentação antiga que dizia “eixo = Data Publicação” está **obsoleta**.

---

### Gráficos de Performance (100% fantasy.csv)
- Usa `filteredFantasy` → recorte = **clickDate / clickWeek**
- Só `kind === 'video'` + videoId válido · agrupa por videoId
- **Fantasy Clicks** = `COUNT DISTINCT visitorId` no recorte
- **Conversion** = Visitors do vídeo no recorte / Views do vídeo (Views 1×)
- Controles: N · Melhores · Piores · Recentes · Atualizar  
- Default: Clicks · Recentes · N=20  
Estado: `fantasyPerformanceMetric` · `fantasyPerfMode` · `fantasyPerformanceChart`

#### Recentes
**Não** significa “vídeo publicado recentemente”.  
Significa **atividade Fantasy recente**:
- Ao agregar: guardar `latestClickDate`
- Ordenar: `latestClickDate` DESC
- Tooltip/label: **Último clique**
- **Não** buscar Data Publicação em `dados.csv`

---

### Breakdown — Unique Visitors por Granularidade

Posição atual: **abaixo** de Gráficos de Performance.

Dimensões: Creator | Categoria | **Formato** | Destino | Dispositivo  
(**Não** existe dimensão “Tipo” na UI Fantasy.)

Quando dimensão = **Formato:** agrupar com `getFantasyFormat(r)`.  
Grupos: Long Form · Shorts · LIVE · BIO · Não identificado.

- Fonte: **`filteredFantasy`** → responde a Data do Clique / Semana do Clique
- LIVE/BIO só aparecem se estiverem no `filteredFantasy` (**sem exceção**)
- Métrica: `COUNT DISTINCT visitorId` · ordenação UV DESC
- Labels: `UV · % do total` (1 casa; overlap permitido → soma % pode > 100%)
- Tooltip: Unique Visitors · % do total · Views (1×/vídeo) · Fantasy Conversion · Vídeos (DISTINCT videoId elegível)

**Destino:** App · Web · Não rastreado.  
**Dispositivo:** valor ou Não identificado.

Estado: `fantasyBreakdownDimension` (default `creator`) · `fantasyBreakdownChart`

---

### Cards comparativos ignoram Formato
Long Form Visitors · Shorts Visitors · Fantasy Conversion · LF Conversion · Shorts Conversion  
ignoram o filtro Formato — intencional para comparação entre formatos.

---

### LIVE / BIO — decisão atual
- Cards **ALL-TIME** dão visibilidade global (67 / 270)
- No CSV atual ambos têm `clickDate` → podem aparecer no Breakdown / Performance / Temporal conforme o recorte
- **Não** forçar inclusão via exceção de Data

---

### Estados Fantasy principais
```
ENABLE_FANTASY_TAB = true

allFantasyData
filteredFantasy
fantasyLoaded
fantasyLoadError

// temporal independente
fantasyDateStart · fantasyDateEnd
fantasyWeekAllSelected · fantasySelectedWeeks
mainDateStart · mainDateEnd
mainWeekAllSelected · mainSelectedWeeks

getFantasyFormat(r)
getFantasyRowsIgnoringFormatFilter()
computeFantasyConversionFromRows(rows)
deriveFantasyClickWeek(isoDate)
fmtFantasyKpiUVFull(v)          // Total UV + LF Visitors (inteiro completo)
fmtFantasyKpiUV(v)              // demais UV cards (fmtNum)
groupFantasyByPeriod(data, mode)

fantasyBreakdownDimension       // default: 'creator' · formato = 'formato'
fantasyBreakdownChart
fantasyTemporalMetric           // default: 'clicks'
fantasyTempMode                 // default: 'week'
fantasyTemporalChart
fantasyPerformanceMetric        // default: 'clicks'
fantasyPerfMode                 // default: 'recent'  (latestClickDate)
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
8. Temporal / filtros Fantasy: sempre `clickDate` / `clickWeek` (nunca publicação Main)
9. Preservar estados temporais independentes Main ↔ Fantasy
