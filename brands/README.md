# Marcas (whitelabel)

Cada subdiretório aqui é uma marca whitelabel: `brand.config.json` mais uma pasta `assets/` opcional com overrides. `scripts/select-brand.mjs` lê `ZYRA_BRAND` (um slug igual ao nome de um diretório aqui, padrão `zyra`) e aplica a identidade dessa marca em `asturian-front`, `zyra-server`, `zyra-emails` e `zyra-docs`.

## `zyra/` é especial

É a marca padrão obrigatória e reproduz a identidade atual da própria Zyra. Seu `theme.mode` é `"scale"` sem objeto `scale` — isso é um sinal para `select-brand.mjs` significando "não mexer nos arquivos de cor, o `AccentLight.ts`/`AccentDark.ts` já commitado já é a fonte da verdade". `theme.primaryHex` é sempre obrigatório (define as tags meta/manifest/docs theme-color independente do modo); toda outra marca precisa, além disso, ou só desse hex com `mode: "generated"` (uma escala de 12 tons é derivada via OKLCH) ou um objeto `theme.scale` completo com `mode: "scale"` (valores calibrados à mão, usados como estão).

Rodar `ZYRA_BRAND=zyra node scripts/select-brand.mjs` (ou deixar `ZYRA_BRAND` vazio) também é como reverter a árvore de trabalho para o padrão depois de testar outra marca localmente — é um no-op em cima de um checkout limpo.

## Criando uma marca nova

**Caminho fácil — assistente interativo:**

```bash
npx nx build zyra-shared
node scripts/create-brand.mjs
# ou: npm run brand:create
```

Ele pergunta o essencial (nome, cor, logo, domínio, emails, dados legais), valida tudo contra o schema em `zyra-shared/src/brand` e já cria `brands/<slug>/brand.config.json` + `brands/<slug>/assets/` prontos.

**Caminho manual:**

1. Copie `zyra/brand.config.json` para `<slug>/brand.config.json` e preencha `product`, `theme` (`primaryHex` é o caminho fácil), `domain`, `email`, `legal` e, se o cliente tiver um idioma padrão diferente de português (ex.: um cliente francês ou chinês), `defaultLocale` (ex.: `"fr-FR"`, `"zh-CN"` — veja as chaves válidas em `packages/zyra-shared/src/translations/constants/AppLocales.ts`). Isso só muda o idioma que uma visita nova sem preferência salva vê primeiro — o seletor de idioma nas Configurações continua com todos os ~30 idiomas disponíveis para qualquer usuário trocar manualmente, em qualquer marca.
2. Hospede uma logo em algum lugar público e aponte `assets.emailLogoUrl` para a URL `https://` dela — emails transacionais não conseguem embutir imagens locais.
3. Opcionalmente, coloque arquivos de override em `<slug>/assets/` (`favicon.png`, `apple-touch-icon.png`, `og-image.png`, `docs-logo.svg`, `docs-favicon.png`) e referencie-os em `assets.*Path` no config. O que não for sobrescrito usa o asset atual da Zyra.
4. Rode `ZYRA_BRAND=<slug> node scripts/select-brand.mjs`, depois `npm run dev` (ou um build do pacote) para ver aplicado.

## Aplicando a marca

```bash
ZYRA_BRAND=<slug> node scripts/select-brand.mjs
# ou: ZYRA_BRAND=<slug> npm run brand:select
```

Isso sobrescreve arquivos versionados (`packages/asturian-front/index.html`, `manifest.json`, os ícones/favicon em `packages/asturian-front/public/images/icons/`, `packages/zyra-ui/src/theme/constants/Accent{Light,Dark}.ts`, `packages/zyra-docs/docs.json`) do mesmo jeito que `scripts/vercel-build-front.sh` já faz no deploy — **não commite** essas mudanças em cima de uma marca não-`zyra`; rode o seletor de volta para `zyra` (ou `git checkout` nesses arquivos) antes de commitar.

O override de favicon/logo é copiado para todo arquivo que o app realmente referencia (o ícone usado em `<link rel="icon">`, o ícone padrão de workspace usado como logo de fallback em várias telas, e `favicon.ico` como reforço) — antes disso ser corrigido, um override de favicon era um no-op silencioso.

**Atenção ao testar várias marcas em sequência no mesmo checkout local**: `packages/zyra-ui/src/theme/constants/Accent{Light,Dark}.ts` e `packages/asturian-front/src/modules/localization/constants/DefaultAppLocale.ts` só são reescritos quando a marca selecionada define `theme.scale`/`defaultLocale` — a marca `zyra` omite os dois de propósito (sentinela = "não mexer, o arquivo commitado já é a verdade"). Isso significa que voltar para `ZYRA_BRAND=zyra` depois de testar outra marca **não** desfaz esses dois arquivos sozinho (diferente de `index.html`/`manifest.json`/`docs.json`, que são sempre reescritos incondicionalmente e por isso revertem sozinhos). Para voltar ao estado limpo depois de testar localmente, rode:
```bash
git checkout -- packages/zyra-ui/src/theme/constants/AccentLight.ts packages/zyra-ui/src/theme/constants/AccentDark.ts packages/asturian-front/src/modules/localization/constants/DefaultAppLocale.ts
```
Isso não é um problema em builds de deploy reais (Docker/Vercel sempre partem de um checkout limpo do git), só na iteração local.

## Deploy

- **VPS própria (Docker)**: veja `docs/deploy-vps.md` — `ZYRA_BRAND` vira um build arg do `Dockerfile`, passado via `packages/zyra-docker/docker-compose.prod.yml`.
- **Vercel**: `scripts/vercel-build.sh` (backend) e `scripts/vercel-build-front.sh` (frontend) já chamam `select-brand.mjs` automaticamente antes do build — configure `ZYRA_BRAND` nas variáveis de ambiente do projeto Vercel.
