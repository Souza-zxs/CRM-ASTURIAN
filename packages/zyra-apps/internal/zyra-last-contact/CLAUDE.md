## Base documentation

- Getting started:
  - https://docs.zyra.com/developers/extend/apps/getting-started/quick-start.md
  - https://docs.zyra.com/developers/extend/apps/getting-started/concepts.md
  - https://docs.zyra.com/developers/extend/apps/getting-started/project-structure.md
  - https://docs.zyra.com/developers/extend/apps/getting-started/local-server.md
  - https://docs.zyra.com/developers/extend/apps/getting-started/scaffolding.md
  - https://docs.zyra.com/developers/extend/apps/getting-started/troubleshooting.md
- Config:
  - https://docs.zyra.com/developers/extend/apps/config/overview.md
  - https://docs.zyra.com/developers/extend/apps/config/application.md
  - https://docs.zyra.com/developers/extend/apps/config/roles.md
  - https://docs.zyra.com/developers/extend/apps/config/install-hooks.md
  - https://docs.zyra.com/developers/extend/apps/config/public-assets.md
- Data:
  - https://docs.zyra.com/developers/extend/apps/data/overview.md
  - https://docs.zyra.com/developers/extend/apps/data/objects.md
  - https://docs.zyra.com/developers/extend/apps/data/extending-objects.md
  - https://docs.zyra.com/developers/extend/apps/data/relations.md
- Logic:
  - https://docs.zyra.com/developers/extend/apps/logic/overview.md
  - https://docs.zyra.com/developers/extend/apps/logic/logic-functions.md
  - https://docs.zyra.com/developers/extend/apps/logic/skills-and-agents.md
  - https://docs.zyra.com/developers/extend/apps/logic/connections.md
- Layout:
  - https://docs.zyra.com/developers/extend/apps/layout/overview.md
  - https://docs.zyra.com/developers/extend/apps/layout/views.md
  - https://docs.zyra.com/developers/extend/apps/layout/navigation-menu-items.md
  - https://docs.zyra.com/developers/extend/apps/layout/page-layouts.md
  - https://docs.zyra.com/developers/extend/apps/layout/front-components.md
  - https://docs.zyra.com/developers/extend/apps/layout/command-menu-items.md
- Operations:
  - https://docs.zyra.com/developers/extend/apps/operations/overview.md
  - https://docs.zyra.com/developers/extend/apps/operations/cli.md
  - https://docs.zyra.com/developers/extend/apps/operations/testing.md
  - https://docs.zyra.com/developers/extend/apps/operations/publishing.md
- Rich app example: https://github.com/zyrahq/zyra/tree/main/packages/zyra-apps/examples/postcard

## UUID requirement

- All generated UUIDs must be valid UUID v4.

## Common Pitfalls

- Creating an object without an index view associated. Unless this is a technical object, user will need to visualize it.
- Creating a view without a navigationMenuItem associated. This will make the view available on the left sidebar.
- Creating a front-end component that has a scroll instead of being responsive to its fixed widget height and width, unless it is specifically meant to be used in a canvas tab.

## Best practice

It's highly recommended to create new app entities using `yarn zyra dev:add`. These are the options:

| Entity type          | Command                                  | Generated file                        |
| -------------------- | ---------------------------------------- | ------------------------------------- |
| Object               | `yarn zyra dev:add object`             | `src/objects/<name>.ts`               |
| Field                | `yarn zyra dev:add field`              | `src/fields/<name>.ts`                |
| Logic function       | `yarn zyra dev:add logicFunction`      | `src/logic-functions/<name>.ts`       |
| Front component      | `yarn zyra dev:add frontComponent`     | `src/front-components/<name>.tsx`     |
| Role                 | `yarn zyra dev:add role`               | `src/roles/<name>.ts`                 |
| Skill                | `yarn zyra dev:add skill`              | `src/skills/<name>.ts`                |
| Agent                | `yarn zyra dev:add agent`              | `src/agents/<name>.ts`                |
| View                 | `yarn zyra dev:add view`               | `src/views/<name>.ts`                 |
| Navigation menu item | `yarn zyra dev:add navigationMenuItem` | `src/navigation-menu-items/<name>.ts` |
| Page layout          | `yarn zyra dev:add pageLayout`         | `src/page-layouts/<name>.ts`          |

This helps automatically generate required IDs etc.
