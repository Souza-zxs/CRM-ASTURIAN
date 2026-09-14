#!/bin/sh

set -e

echo "==> Packaging Zyra Desktop..."
SKIP_SIGN=1 npx electron-forge package

echo "==> Ad-hoc signing Zyra.app..."
codesign --force --deep --sign - out/Zyra-darwin-arm64/Zyra.app

echo "==> Starting local server..."
node src/server.js &
SERVER_PID=$!

trap "echo '==> Stopping server...'; kill $SERVER_PID 2>/dev/null" EXIT INT TERM

echo "==> Launching Zyra.app..."
./out/Zyra-darwin-arm64/Zyra.app/Contents/MacOS/Zyra
