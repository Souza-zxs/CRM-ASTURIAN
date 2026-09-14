<div align="center">
  <h1>Create Zyra App</h1>

<a href="https://www.npmjs.com/package/create-zyra-app"><img alt="NPM version" src="https://img.shields.io/npm/v/create-zyra-app.svg?style=for-the-badge&labelColor=000000"></a>

</div>

The official scaffolding CLI for building apps on top of [Zyra CRM](https://zyra.com). Sets up a ready-to-run project with [zyra-sdk](https://www.npmjs.com/package/zyra-sdk).

## Quick start

```bash
npx create-zyra-app@latest my-zyra-app
cd my-zyra-app
yarn zyra dev
```

The scaffolder will:

1. Create a new project with TypeScript, linting, tests, and a preconfigured `zyra` CLI
2. Start a local Zyra server via Docker (pulls the latest image automatically)
3. Authenticate with the development API key

## Options

| Flag                               | Description                                                           |
| ---------------------------------- | --------------------------------------------------------------------- |
| `--name <name>`                    | Set the app name                                                      |
| `--display-name <displayName>`     | Set the display name                                                  |
| `--description <description>`      | Set the description                                                   |
| `--url <url>`                      | Zyra workspace URL (default: `http://localhost:2020`)               |
| `--authentication-method <method>` | `oauth` or `apiKey` (default: `apiKey` for local, `oauth` for remote) |

## Documentation

Full documentation is available at **[docs.zyra.com/developers/extend/apps](https://docs.zyra.com/developers/extend/apps/getting-started/quick-start)**:

- [Quick Start](https://docs.zyra.com/developers/extend/apps/getting-started/quick-start) — scaffold, run a local server, sync your code
- [Concepts](https://docs.zyra.com/developers/extend/apps/getting-started/concepts) — how apps work: entity model, sandboxing, lifecycle
- [Operations](https://docs.zyra.com/developers/extend/apps/operations/overview) — CLI, testing, CI, deploy and publish

## Troubleshooting

- Server not starting: check Docker is running (`docker info`), then try `yarn zyra docker:logs`.
- Auth not working: run `yarn zyra remote:add` to re-authenticate.
- Types not generated: ensure `yarn zyra dev` is running — it auto-generates the typed client.
