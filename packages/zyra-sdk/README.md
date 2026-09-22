<div align="center">
  <h1>Zyra SDK</h1>

<a href="https://www.npmjs.com/package/zyra-sdk"><img alt="NPM version" src="https://img.shields.io/npm/v/zyra-sdk.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/cx5n4Jzs57"><img alt="Join the community on Discord" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&logo=Zyra&labelColor=000000&logoWidth=20"></a>

</div>

A CLI and SDK to develop, build, and publish applications that extend [Zyra CRM](https://zyra.com).

## Quick start

The recommended way to start is with [create-zyra-app](https://www.npmjs.com/package/create-zyra-app):

```bash
npx create-zyra-app@latest my-zyra-app
cd my-zyra-app
yarn zyra dev
```

## Documentation

Full documentation is available at **[docs.zyra.com/developers/extend/apps](https://docs.zyra.com/developers/extend/apps/getting-started)**:

- [Getting Started](https://docs.zyra.com/developers/extend/apps/getting-started) — scaffolding, local server, authentication, dev mode
- [Building Apps](https://docs.zyra.com/developers/extend/apps/building) — entity definitions, API clients, testing, CLI reference
- [Publishing](https://docs.zyra.com/developers/extend/apps/publishing) — deploy, npm publish, marketplace

Guides in this repository:

- [Logic function inputs](./docs/logic-function-inputs.md) — input schema inference, record-typed inputs, and the id contract

## Manual installation

If you are adding `zyra-sdk` to an existing project instead of using `create-zyra-app`:

```bash
yarn add zyra-sdk zyra-client-sdk
```

Then add a `zyra` script to your `package.json`:

```json
{
  "scripts": {
    "zyra": "zyra"
  }
}
```

Run `yarn zyra help` to see all available commands.

## Configuration

The CLI stores credentials per remote in `~/.zyra/config.json`. Run `yarn zyra remote:add` to configure a remote, or `yarn zyra remote:list` to see existing ones.

## Troubleshooting

- Auth errors: run `yarn zyra remote:add` to re-authenticate.
- Typings out of date: restart `yarn zyra dev` to refresh the client and types.
- Not seeing changes in dev: make sure dev mode is running (`yarn zyra dev`).

## Contributing

### Development setup

```bash
# Clone this repository, then:
yarn install
```

### Development mode

```bash
npx nx run zyra-sdk:dev
```

### Production build

```bash
npx nx run zyra-sdk:build
```

### Running the CLI locally

```bash
npx nx run zyra-sdk:start -- <command>
```

### Resources

- Join our [Discord](https://discord.gg/cx5n4Jzs57)
