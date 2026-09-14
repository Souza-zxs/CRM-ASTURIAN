// Thin Vercel entrypoint. The real app lives in packages/zyra-server and is
// compiled by the Nx build (see vercel.json's buildCommand) before this file
// is bundled — requiring the already-compiled output avoids relying on
// Vercel's own bundler to handle this codebase's TypeScript path aliases and
// decorator metadata, which the Nx/Nest build already handles reliably.
module.exports = require('../packages/zyra-server/dist/serverless.js').default;
