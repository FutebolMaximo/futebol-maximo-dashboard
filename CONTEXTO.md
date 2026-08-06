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
- `index.html` — dashboard completo
- `dados.csv` — base de dados dos vídeos (2258+ linhas)
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
1. **Dashboard** — KPIs (2 linhas × 5 cards), Scatter, Temporal, Performance
2. **Análise Avançada** — Distribuição Ideal, Heatmap, Funil, Distribuição de Views
3. **Shorts** — KPIs, Temporal, Scatter, Performance, Funil
4. **Feedbacks** — Classificação automática Long Form e Shorts
5. **Base de Dados** — Tabela completa 21 colunas com filtros por coluna

---

## Fluxo de dados (variáveis principais)
```
allData          → todos os vídeos parseados do CSV
filteredData     → Long Form filtrados pelos filtros globais
filteredLong     → mesmo que filteredData (alias)
filteredShorts   → Shorts filtrados pelos filtros globais
filteredAll      → todos os tipos (usado só na Base de Dados)
```

---

## Filtros globais (sticky, afetam todas as abas)
Criador | Categoria | Tipo (só Base de Dados) | Data Início | Data Fim | Semana | Título

- **Default**: Data Início = 01/01/ano atual, Data Fim = hoje
- **Limpar**: reseta para o mesmo default (não para todo o histórico)
- Botão 👁️ ao lado de Limpar: expande/recolhe todas as seções

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

## Correções de bugs conhecidas (não reverter)
1. **Fuso horário nos labels do gráfico temporal**: usar `new Date(+y, +m-1, 1)` e NÃO `new Date(k+'-01')` para evitar labels com mês errado
2. **Gancho zerado**: parser detecta formato automaticamente (com % ou decimal)
3. **Cache do CSV**: sempre usar `?v=Date.now()` + `cache: 'no-store'`
4. **Datas US format**: normalizar M/D/YYYY → YYYY-MM-DD no parse

---

## Como fazer alterações com segurança
1. Sempre testar no browser após cada mudança (abrir index.html diretamente)
2. Verificar console (F12) para erros JS
3. Nunca remover `destroyChart()` antes de criar novo gráfico
4. Manter sempre exatamente 3 `<script>` e 3 `</script>` no arquivo
