This is a [Zyra](https://zyra.com) application project bootstrapped with [`create-zyra-app`](https://www.npmjs.com/package/create-zyra-app).

## Getting Started

First, authenticate to your workspace:

```bash
yarn zyra remote:add --api-url http://localhost:2020 --as local
```

Then, start development mode to sync your app and watch for changes:

```bash
yarn zyra dev
```

Open your Zyra instance and go to `/settings/applications` section to see the result.

## Available Commands

Run `yarn zyra help` to list all available commands. Common commands:

```bash
# Remotes & Authentication
yarn zyra remote:add --api-url http://localhost:2020 --as local     # Authenticate with Zyra
yarn zyra remote:status         # Check auth status
yarn zyra remote:use            # Set default remote
yarn zyra remote:list           # List all configured remotes
yarn zyra remote:remove <name>  # Remove a remote

# Application
yarn zyra dev            # Start dev mode (watch, build, sync, and auto-generate typed client)
yarn zyra dev:add        # Scaffold a new entity (object, field, function, front-component, role, view, navigation-menu-item)
yarn zyra dev:function:logs    # Stream function logs
yarn zyra dev:function:exec    # Execute a function with JSON payload
yarn zyra app:uninstall  # Uninstall app from workspace
```

## Integration Tests

If your project includes the example integration test (`src/__tests__/app-install.integration-test.ts`), you can run it with:

```bash
# Make sure a Zyra server is running at http://localhost:3000
yarn test
```

The test builds and installs the app, then verifies it appears in the applications list. Test configuration (API URL and API key) is defined in `vitest.config.ts`.

## LLMs instructions

Main docs and pitfalls are available in LLMS.md file.

## Learn More

To learn more about Zyra applications, take a look at the following resources:

- [zyra-sdk](https://www.npmjs.com/package/zyra-sdk) - learn about `zyra-sdk` tool.
- [Zyra doc](https://docs.zyra.com/) - Zyra's documentation.
