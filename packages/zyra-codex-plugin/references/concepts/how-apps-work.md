# How Zyra Apps Work

Use this reference to understand the Zyra application development model before creating, developing, or deploying an app. Other references cover specific workflows; this one explains the architecture behind them.

## What Is A Zyra App

A Zyra app is a standalone npm package that extends a Zyra instance. It is not part of the Zyra server codebase. It lives in its own directory with its own `package.json`, dependencies, and source tree. When installed on a Zyra instance, it adds objects, fields, views, page layouts, front components, logic functions, skills, agents, and more to that workspace.

The app does not run as a separate server. It is built, published, and installed into a running Zyra instance. The instance loads the app's entities into its schema and renders the app's front components inside the workspace UI.

## SDK Packages

A Zyra app depends on two SDK packages:

| Package | Purpose | Used in |
| --- | --- | --- |
| `zyra-sdk` | Define app entities and access front component runtime APIs | Entity definitions (`zyra-sdk/define`), front component hooks and host APIs (`zyra-sdk/front-component`), Zyra UI components (`zyra-sdk/ui`) |
| `zyra-client-sdk` | Access workspace data from front components | Core object queries (`zyra-client-sdk/core`), metadata queries (`zyra-client-sdk/metadata`) |

`zyra-sdk/define` provides the registration functions: `defineApplication`, `defineObject`, `defineField`, `defineView`, `definePageLayout`, `defineFrontComponent`, `defineNavigationMenuItem`, `defineLogicFunction`, `defineRole`, and others. Every app entity is declared through one of these functions.

`zyra-sdk/front-component` provides runtime APIs available inside front components: `navigate`, `enqueueSnackbar`, `openSidePanelPage`, `useSelectedRecordIds`, `getApplicationVariable`, and others.

`zyra-sdk/ui` re-exports Zyra UI components (`Button`, `Chip`, `Tag`, `Status`, `H2Title`, `ThemeProvider`, icons, `themeCssVariables`). Always import from `zyra-sdk/ui`, not from `zyra-ui` directly, so build aliases and runtime packaging stay aligned.

`zyra-client-sdk/core` provides `CoreApiClient` for querying and mutating workspace records (companies, people, custom objects). `zyra-client-sdk/metadata` provides access to workspace metadata (object definitions, field definitions).

## Zyra Instances And Remotes

A Zyra instance is a running Zyra server — either self-hosted or managed cloud. Each instance hosts one or more workspaces. Apps are installed per workspace.

A "remote" is the local CLI's connection to a Zyra instance. It stores the server URL and an API key in `~/.zyra/config.json`. You can configure multiple remotes (e.g. `local`, `staging`, `production`) and switch between them.

The API key authenticates the developer against the target workspace. It determines which workspace the app syncs to, deploys to, and reads data from during development.

## Local Development Environment

An app needs a running Zyra instance to develop against. There are two ways to connect:

1. **Existing instance via OAuth** (default): `create-zyra-app --url <zyra-instance-url>` authenticates via OAuth on the provided Zyra server. The scaffolder opens a browser for the OAuth flow, then stores the credentials as a remote in `~/.zyra/config.json`. This is best when the developer already has a workspace with data to develop against.

2. **Local instance with Docker** (fallback): `create-zyra-app` (no `--url`) starts a disposable local Zyra server on `http://localhost:2020` through Docker. The scaffolder authenticates with the local server's development API key and creates a `local` remote automatically. Use this when the developer has no Zyra instance available and wants to start fresh without affecting a shared workspace.

In both cases, the result is a remote stored in `~/.zyra/config.json` that the CLI uses for all subsequent sync, deploy, and data access commands.

## App Lifecycle

The development loop is:

```
create → develop → sync → validate → repeat
```

1. **Create**: `npx create-zyra-app@latest <app-name>` generates the project, installs dependencies, starts a local Zyra server, and runs an initial sync. The scaffolder handles everything in one command — do not run `yarn zyra dev --once` after scaffolding because the sync already happened.

2. **Develop**: Add or modify entities in `src/`. Objects go in `src/objects/`, front components in `src/front-components/`, logic functions in `src/logic-functions/`, page layouts in `src/page-layouts/`, and so on. Each entity file exports a `define*` call.

3. **Sync**: `yarn zyra dev --once` builds, deploys, and installs the app on the active remote in one step. The Zyra instance updates its schema, registers new objects and fields, mounts front components, and activates logic functions. This is the primary way to get changes onto a Zyra instance during development. Sync after every meaningful change.

4. **Validate**: `yarn zyra dev:typecheck` checks generated types. `yarn lint` checks local lint rules. Open the workspace in a browser to verify front components render and logic functions execute.

## Sharing An App

Publishing is separate from the development loop. It is used to share an app with other Zyra instances or the public marketplace:

- `yarn zyra app:publish` publishes to npm for the public marketplace.
- `yarn zyra app:publish --private --remote <name>` publishes privately to a specific Zyra instance's registry.

Each publish requires a strictly higher semver version in `package.json`. See the `publish-app` skill and `prepare-for-app-store.md` for marketplace metadata and listing guidance.

## Front Component Rendering

Front components do not run as a separate frontend application. The Zyra workspace renders them inside an isolated Remote DOM container. The SDK mounts the component, provides a `ThemeProvider`, and proxies host APIs (navigation, snackbars, side panels) through `zyra-sdk/front-component`.

This means:
- Front components cannot access `document` or `window` globals directly.
- They cannot use React portals or third-party libraries that manipulate the DOM outside their tree.
- They import UI primitives from `zyra-sdk/ui`, not from `zyra-ui` or external component libraries.
- They fetch workspace data through `zyra-client-sdk/core`, not through direct API calls.

## App File Structure

A typical Zyra app after scaffolding:

```
my-app/
  package.json                          # App metadata, version, dependencies
  src/
    application-config.ts               # defineApplication() — app identity and marketplace metadata
    constants/
      universal-identifiers.ts          # Stable UUIDs for all entities
    objects/                            # defineObject, defineField, defineRelation
    views/                              # defineView
    roles/                              # defineRole
    front-components/                   # defineFrontComponent (.tsx)
    page-layouts/                       # definePageLayout
    navigation-menu-items/              # defineNavigationMenuItem
    logic-functions/                    # defineLogicFunction
  public/                               # Static assets (logos, screenshots, images)
  .github/workflows/                    # CI/CD automation (optional)
```

`application-config.ts` is the app's entry point. It calls `defineApplication()` with the app's universal identifier, display name, description, default role, and marketplace metadata. Every entity references stable UUIDs from `constants/universal-identifiers.ts`.

## Key Concepts

- **Universal identifiers**: Stable UUIDs assigned to every entity. They survive renames, version bumps, and resyncs. Never change a universal identifier after first sync.
- **Remotes**: Named connections to Zyra instances. Stored in `~/.zyra/config.json`. Switch with `yarn zyra remote:use <name>`.
- **Sync**: `yarn zyra dev --once` builds, deploys, and installs the app on the active remote in one step. This is the standard way to get code changes onto a Zyra instance.
- **Publish**: `yarn zyra app:publish` packages the app for distribution to other instances or the marketplace. Requires a strictly higher semver version than the previously published version.
