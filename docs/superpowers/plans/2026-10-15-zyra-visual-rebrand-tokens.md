# Rebranding visual do Zyra — Etapa 1 (tokens de tema) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a cor de marca (accent) do tema padrão do Zyra para um roxo mais vívido (inspirado
no kit "Dashboard UI Charts") e deixar os cards de widget do dashboard mais arredondados, sem
nenhuma mudança funcional.

**Architecture:** O app real (`asturian-front`) renderiza cor a partir das variáveis CSS
definidas em `theme-light.css`/`theme-dark.css` (importadas em `src/index.tsx`), lidas em runtime
via `ThemeContext`/`themeCssVariables` (`computeThemeFromCss`, que usa `getComputedStyle` sobre o
`<html>` com classe `.light`/`.dark`). Os arquivos TS paralelos
`AccentLight.ts`/`AccentDark.ts` alimentam `ThemeLight.ts`/`ThemeDark.ts`, consumidos apenas por
`zyra-website` (landing page — fora de escopo) e **não** afetam o app. Por isso esta etapa edita
só os dois arquivos `.css`, mais um componente de card que usa um token de raio existente.

**Tech Stack:** CSS custom properties (`color(display-p3 r g b)`), Linaria (styled-components
zero-runtime) para `WidgetCard.tsx`, Jest para os testes de regressão de conteúdo.

## Global Constraints

- Não tocar `zyra-website` (landing page) nesta etapa — pedido explícito do usuário.
- Não tocar `AccentLight.ts`/`AccentDark.ts` nesta etapa — ver Architecture acima (só afetam a
  landing, não o app).
- Sem mudança funcional — só valores de tokens visuais.
- Rodar `npx nx lint:diff-with-main <projeto>` e `npx nx typecheck <projeto>` depois de cada
  tarefa, para `zyra-ui` e `asturian-front` conforme o arquivo tocado.

---

### Task 1: Nova cor de marca (accent) em `theme-light.css` e `theme-dark.css`

**Files:**
- Create: `packages/zyra-ui/src/theme-constants/__tests__/themeAccentColor.test.ts`
- Modify: `packages/zyra-ui/src/theme-constants/theme-light.css:74-91`
- Modify: `packages/zyra-ui/src/theme-constants/theme-dark.css:74-91`

**Interfaces:**
- Consumes: nenhuma — edição direta de valores literais de propriedade CSS custom
  (`color(display-p3 r g b)`), mesmo formato já usado nos arquivos.
- Produces: `--t-accent-primary`, `--t-accent-secondary`, `--t-accent-tertiary`,
  `--t-accent-quaternary`, `--t-accent-accent3570`, `--t-accent-accent4060`,
  `--t-accent-accent1` até `--t-accent-accent12` (ambos os arquivos) — consumidos em runtime via
  `themeCssVariables.accent.*` (`packages/zyra-ui/src/theme-constants/themeCssVariables.ts:108-127`)
  por qualquer componente que já usa `theme.accent.*` hoje (botões primários, foco, seleção,
  etc. — nenhuma mudança de código nesses consumidores, só o valor final muda).

Os valores abaixo foram gerados com o mesmo algoritmo OKLCH de `scripts/select-brand.mjs`
(`hexToOklch`/`generateScaleSteps`/`oklchToHex`, linhas ~213-341), a partir do hex semente
`#6E56CF`, reproduzindo exatamente `generateScaleSteps()`: `primary`/`secondary` = passo 9
(`s9`), `tertiary` = `s3`, `quaternary` = `s2`, `accent3570`/`accent4060` = `s8`,
`accent1..12` = `s1..s12`.

- [ ] **Step 1: Escrever o teste de regressão (vai falhar contra os valores antigos)**

Criar `packages/zyra-ui/src/theme-constants/__tests__/themeAccentColor.test.ts`:

```typescript
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const THEME_CONSTANTS_DIR = join(__dirname, '..');

const readThemeCss = (fileName: string): string =>
  readFileSync(join(THEME_CONSTANTS_DIR, fileName), 'utf-8');

describe('accent color tokens — rebrand to vivid violet (#6E56CF seed)', () => {
  it('theme-light.css uses the new accent9/accent1/accent12 values', () => {
    const css = readThemeCss('theme-light.css');

    expect(css).toContain(
      '--t-accent-accent9: color(display-p3 0.431 0.337 0.812);',
    );
    expect(css).toContain(
      '--t-accent-accent1: color(display-p3 0.985 0.983 1);',
    );
    expect(css).toContain(
      '--t-accent-accent12: color(display-p3 0.124 0.069 0.29);',
    );
    expect(css).toContain(
      '--t-accent-primary: color(display-p3 0.431 0.337 0.812);',
    );
  });

  it('theme-dark.css uses the new accent9/accent1/accent12 values', () => {
    const css = readThemeCss('theme-dark.css');

    expect(css).toContain(
      '--t-accent-accent9: color(display-p3 0.565 0.485 0.973);',
    );
    expect(css).toContain(
      '--t-accent-accent1: color(display-p3 0.06 0.032 0.158);',
    );
    expect(css).toContain(
      '--t-accent-accent12: color(display-p3 0.911 0.899 1);',
    );
    expect(css).toContain(
      '--t-accent-primary: color(display-p3 0.565 0.485 0.973);',
    );
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx jest packages/zyra-ui/src/theme-constants/__tests__/themeAccentColor.test.ts --config=packages/zyra-ui/jest.config.mjs`
Expected: FAIL — os valores antigos (`0.417 0.341 0.784` etc.) ainda estão nos arquivos.

- [ ] **Step 3: Substituir o bloco `--t-accent-*` em `theme-light.css` (linhas 74-91)**

Trocar o bloco inteiro (da linha `--t-accent-primary` até `--t-accent-accent12`) por:

```css
  --t-accent-primary: color(display-p3 0.431 0.337 0.812);
  --t-accent-secondary: color(display-p3 0.431 0.337 0.812);
  --t-accent-tertiary: color(display-p3 0.886 0.877 1);
  --t-accent-quaternary: color(display-p3 0.95 0.947 1);
  --t-accent-accent3570: color(display-p3 0.472 0.392 0.844);
  --t-accent-accent4060: color(display-p3 0.472 0.392 0.844);
  --t-accent-accent1: color(display-p3 0.985 0.983 1);
  --t-accent-accent2: color(display-p3 0.95 0.947 1);
  --t-accent-accent3: color(display-p3 0.886 0.877 1);
  --t-accent-accent4: color(display-p3 0.819 0.802 1);
  --t-accent-accent5: color(display-p3 0.742 0.718 0.994);
  --t-accent-accent6: color(display-p3 0.656 0.622 0.941);
  --t-accent-accent7: color(display-p3 0.561 0.509 0.894);
  --t-accent-accent8: color(display-p3 0.472 0.392 0.844);
  --t-accent-accent9: color(display-p3 0.431 0.337 0.812);
  --t-accent-accent10: color(display-p3 0.389 0.276 0.774);
  --t-accent-accent11: color(display-p3 0.326 0.211 0.678);
  --t-accent-accent12: color(display-p3 0.124 0.069 0.29);
```

Não alterar nenhuma outra linha do arquivo (ex.: `--t-buttons-secondary-text-color` não faz
parte da escala accent — deixar como está).

- [ ] **Step 4: Substituir o bloco `--t-accent-*` em `theme-dark.css` (linhas 74-91)**

Trocar o bloco inteiro por:

```css
  --t-accent-primary: color(display-p3 0.565 0.485 0.973);
  --t-accent-secondary: color(display-p3 0.565 0.485 0.973);
  --t-accent-tertiary: color(display-p3 0.152 0.092 0.339);
  --t-accent-quaternary: color(display-p3 0.095 0.055 0.228);
  --t-accent-accent3570: color(display-p3 0.495 0.409 0.89);
  --t-accent-accent4060: color(display-p3 0.495 0.409 0.89);
  --t-accent-accent1: color(display-p3 0.06 0.032 0.158);
  --t-accent-accent2: color(display-p3 0.095 0.055 0.228);
  --t-accent-accent3: color(display-p3 0.152 0.092 0.339);
  --t-accent-accent4: color(display-p3 0.211 0.131 0.457);
  --t-accent-accent5: color(display-p3 0.271 0.182 0.563);
  --t-accent-accent6: color(display-p3 0.344 0.247 0.687);
  --t-accent-accent7: color(display-p3 0.419 0.323 0.796);
  --t-accent-accent8: color(display-p3 0.495 0.409 0.89);
  --t-accent-accent9: color(display-p3 0.565 0.485 0.973);
  --t-accent-accent10: color(display-p3 0.587 0.5 1);
  --t-accent-accent11: color(display-p3 0.704 0.645 1);
  --t-accent-accent12: color(display-p3 0.911 0.899 1);
```

- [ ] **Step 5: Rodar o teste de novo e confirmar que passa**

Run: `npx jest packages/zyra-ui/src/theme-constants/__tests__/themeAccentColor.test.ts --config=packages/zyra-ui/jest.config.mjs`
Expected: PASS

- [ ] **Step 6: Lint e typecheck de `zyra-ui`**

Run: `npx nx lint:diff-with-main zyra-ui && npx nx typecheck zyra-ui`
Expected: sem erros novos.

- [ ] **Step 7: Commit**

```bash
git add packages/zyra-ui/src/theme-constants/theme-light.css packages/zyra-ui/src/theme-constants/theme-dark.css packages/zyra-ui/src/theme-constants/__tests__/themeAccentColor.test.ts
git commit -m "feat(zyra-ui): rebrand accent color to vivid violet (#6E56CF seed)"
```

---

### Task 2: Cards de widget mais arredondados

**Files:**
- Create: `packages/asturian-front/src/modules/page-layout/widgets/widget-card/components/__tests__/WidgetCardBorderRadius.test.ts`
- Modify: `packages/asturian-front/src/modules/page-layout/widgets/widget-card/components/WidgetCard.tsx:75`

**Interfaces:**
- Consumes: `themeCssVariables.border.radius.xl` (já existe, mapeado para
  `var(--t-border-radius-xl)` em `packages/zyra-ui/src/theme-constants/themeCssVariables.ts`,
  valor `20px` definido em `packages/zyra-ui/src/theme/constants/BorderCommon.ts:6`).
- Produces: nenhuma interface nova — só o valor de `border-radius` do `StyledWidgetCard` muda
  para os variants `dashboard`, `standalone`, `record-page` e quando `isEditable` é `true`.

- [ ] **Step 1: Escrever o teste de regressão (vai falhar contra o valor antigo)**

Criar `packages/asturian-front/src/modules/page-layout/widgets/widget-card/components/__tests__/WidgetCardBorderRadius.test.ts`:

```typescript
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('WidgetCard border radius', () => {
  it('uses the xl radius token for card corners, not md', () => {
    const source = readFileSync(
      join(__dirname, '..', 'WidgetCard.tsx'),
      'utf-8',
    );

    expect(source).toContain('themeCssVariables.border.radius.xl');
    expect(source).not.toContain('themeCssVariables.border.radius.md');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx jest packages/asturian-front/src/modules/page-layout/widgets/widget-card/components/__tests__/WidgetCardBorderRadius.test.ts --config=packages/asturian-front/jest.config.mjs`
Expected: FAIL — `WidgetCard.tsx` ainda contém `themeCssVariables.border.radius.md`.

- [ ] **Step 3: Trocar `radius.md` por `radius.xl` em `WidgetCard.tsx`**

Em `packages/asturian-front/src/modules/page-layout/widgets/widget-card/components/WidgetCard.tsx`,
linha 75, dentro do bloco `border-radius`:

```typescript
  border-radius: ${({ variant, isEditable }) =>
    variant === 'dashboard' ||
    variant === 'standalone' ||
    variant === 'record-page' ||
    isEditable
      ? themeCssVariables.border.radius.xl
      : '0'};
```

(única mudança: `radius.md` → `radius.xl` na linha 75; o resto do bloco permanece idêntico.)

- [ ] **Step 4: Rodar o teste de novo e confirmar que passa**

Run: `npx jest packages/asturian-front/src/modules/page-layout/widgets/widget-card/components/__tests__/WidgetCardBorderRadius.test.ts --config=packages/asturian-front/jest.config.mjs`
Expected: PASS

- [ ] **Step 5: Lint e typecheck de `asturian-front`**

Run: `npx nx lint:diff-with-main asturian-front && npx nx typecheck asturian-front`
Expected: sem erros novos.

- [ ] **Step 6: Commit**

```bash
git add packages/asturian-front/src/modules/page-layout/widgets/widget-card/components/WidgetCard.tsx packages/asturian-front/src/modules/page-layout/widgets/widget-card/components/__tests__/WidgetCardBorderRadius.test.ts
git commit -m "feat(front): cards de widget do dashboard mais arredondados (radius.xl)"
```

---

### Task 3: Verificação visual no app rodando (light + dark)

Tarefa final de checagem manual — sem mudança de código. Cobre o item do CLAUDE.md: "Para
mudanças de UI/frontend, inicie o servidor de dev e use a funcionalidade num navegador antes de
reportar a tarefa como completa."

**Files:** nenhum (só verificação).

- [ ] **Step 1: Subir o ambiente de dev (se ainda não estiver rodando)**

Run: `bash packages/zyra-utils/setup-dev-env.sh` (idempotente, pula se já estiver no ar), depois
`npm run dev`.

- [ ] **Step 2: Abrir o app num navegador e checar o dashboard em modo claro**

Navegar até uma página com widgets de dashboard (ex.: a Home ou um dashboard customizado com
pelo menos um `graph-widget-bar-chart`/`graph-widget-line-chart`). Confirmar visualmente:
- A cor de destaque (botão primário, barra do gráfico, item selecionado) está num roxo mais
  vívido/saturado que antes — comparar com o screenshot do kit se necessário.
- Os cantos dos cards de widget estão visivelmente mais arredondados que antes.
- Nenhum texto sobre fundo accent ficou ilegível (contraste quebrado).

- [ ] **Step 3: Trocar para modo escuro e repetir a checagem**

Mesma checagem do Step 2, agora em dark mode — confirmar que o roxo continua legível e vívido
sobre fundo escuro, e que os cards continuam com o raio novo.

- [ ] **Step 4: Checar uma tela fora do dashboard (ex.: lista de registros ou configurações)**

Confirmar que a cor de accent mudou de forma consistente em botões/links primários fora do
contexto de gráficos também (já que o token é global) — sem necessidade de qualquer edição
adicional nesta etapa, só confirmação.

Se algo parecer quebrado (contraste ruim, elemento ilegível), registrar o achado e decidir com o
usuário se é um ajuste pontual nesta etapa ou um item pra etapa 2.
