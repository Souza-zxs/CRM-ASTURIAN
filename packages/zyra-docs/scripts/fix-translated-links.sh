#!/bin/bash

# Post-processing script to fix internal links in translated documentation
# This script adds the locale prefix to all internal documentation links
# Works for any language by automatically detecting language directories

set -e

if [ -d "packages/zyra-docs" ]; then
  DOCS_DIR="packages/zyra-docs/l"
elif [ -d "l" ]; then
  DOCS_DIR="l"
else
  echo "❌ Error: Cannot find locales directory (l/)"
  exit 1
fi

echo "🔧 Fixing internal links in translated documentation..."

for lang_dir in "$DOCS_DIR"/*/ ; do
  lang_code=$(basename "$lang_dir")

  if [ ! -d "$lang_dir" ] || [ -z "$(ls -A "$lang_dir")" ]; then
    continue
  fi

  echo "📝 Processing $lang_code documentation..."

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/getting-started/|href=\"/l/$lang_code/getting-started/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/user-guide/|href=\"/l/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/developers/|href=\"/l/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/zyra-ui/|href=\"/l/$lang_code/zyra-ui/|g" {} \;

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/getting-started/|](/l/$lang_code/getting-started/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/user-guide/|](/l/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/developers/|](/l/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/zyra-ui/|](/l/$lang_code/zyra-ui/|g" {} \;

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.zyra\.com/getting-started/|https://docs.zyra.com/l/$lang_code/getting-started/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.zyra\.com/user-guide/|https://docs.zyra.com/l/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.zyra\.com/developers/|https://docs.zyra.com/l/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.zyra\.com/zyra-ui/|https://docs.zyra.com/l/$lang_code/zyra-ui/|g" {} \;

  find "$lang_dir" -name "*.bak" -type f -delete

  echo "✅ $lang_code documentation links fixed"
done

echo "🎉 All translated links have been fixed!"

