# Zyra Documentation

Official documentation for Zyra CRM, powered by [Mintlify](https://mintlify.com).

## 🌐 Live Site

Visit the documentation at [docs.zyra.com](https://docs.zyra.com)

## 📚 Content

This repository contains:
- **User Guide** (46 pages) - Complete guide for Zyra users
- **Developers** (24 pages) - Technical documentation for developers
- **Zyra UI** (25 pages) - UI component library documentation

## 🚀 Local Development

To run the documentation locally:

```bash
# From the zyra monorepo root
npx nx run zyra-docs:dev
```

The documentation will be available at `http://localhost:3000`

## 📝 Editing Content

### Adding/Editing Pages

1. Edit MDX files in the appropriate directory:
   - `user-guide/` - User documentation
   - `developers/` - Developer documentation
   - `zyra-ui/` - Component documentation

2. Update `navigation/base-structure.json` if you need to change the tab/group hierarchy or add/remove pages. This file stays in the repo and is **not** uploaded to Crowdin.
3. Keep the translation template (`navigation/navigation.template.json`) in sync by running `yarn docs:generate-navigation-template` after editing the base structure. This template is the only file that should be pushed to Crowdin.
4. For each translated locale pulled from Crowdin, ensure a `packages/zyra-docs/l/<language>/navigation.json` file exists. These files contain **labels only**; page slugs always come from the base structure.
5. Run `yarn docs:generate` to rebuild `docs.json` from the base structure + translated labels.

### MDX Format

All documentation pages use MDX format with frontmatter:

```mdx
---
title: Page Title
description: Page description
image: /images/path/to/image.png
---

Your content here...
```

### Adding Images

1. Place images in the `/images/` directory
2. Reference them in MDX: `![Alt text](/images/your-image.png)`
3. Or use Mintlify Frame component:
```mdx
<Frame>
  <img src="/images/your-image.png" alt="Description" />
</Frame>
```

## 🔧 Configuration

- `navigation/base-structure.json` - Source of truth for tabs, groups, icons, and page slugs (English only, not sent to Crowdin).
- `navigation/navigation.template.json` - Generated translation template (labels only) that is uploaded to Crowdin.
- `l/<language>/navigation.json` - Locale-specific label files pulled from Crowdin.
- `docs.json` - Generated Mintlify configuration (always run `yarn docs:generate` after modifying navigation files).
- `package.json` - Package dependencies and scripts (`docs:generate`, `docs:generate-navigation-template`, …).
- `project.json` - Nx workspace configuration

## 📦 Validation

```bash
# Validate the documentation build
npx nx run zyra-docs:validate
```

## 🔗 Links

- [Zyra Website](https://zyra.com)
- [Mintlify Documentation](https://mintlify.com/docs)

## 🤝 Editing This Documentation

This site is maintained internally by the Zyra team. To make changes:

1. Create a branch and make your changes in the `packages/zyra-docs` directory
2. Test locally with `npx nx run zyra-docs:dev`
3. Open a pull request against `main` for review

## 📄 License

This documentation is part of the Zyra project, a proprietary product of Horizon LTDA. See the repository [LICENSE](../../LICENSE) for terms. All rights reserved — confidential and not for external distribution.
