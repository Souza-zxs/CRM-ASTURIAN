#!/usr/bin/env node
const message = `\nZyra CLI (zyra-cli) is deprecated.\n\nPlease install and use the new package instead:\n  npm install -g zyra-sdk\n\nThe command name remains the same: \"zyra\".\nMore info: https://www.npmjs.com/package/zyra-sdk\n`;

console.error(message);
process.exitCode = 1;
