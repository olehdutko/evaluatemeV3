#!/usr/bin/env bash
set -euo pipefail

# Reject circular dependencies between modules in apps/api/src/modules

MODULE_DIR="${1:-apps/api/src/modules}"

if [ ! -d "$MODULE_DIR" ]; then
  echo "Module directory not found: $MODULE_DIR"
  exit 1
fi

echo "Checking for circular dependencies in $MODULE_DIR..."

MADGE="./node_modules/.bin/madge"
if [ ! -x "$MADGE" ]; then
  echo "madge not installed; skipping cycle check. Install with: npm install --save-dev madge"
  exit 0
fi

CYCLES=$("$MADGE" --circular --json "$MODULE_DIR" 2>/dev/null)

if [ "$CYCLES" = "[]" ]; then
  echo "No circular dependencies found."
  exit 0
else
  echo "Circular dependencies detected!"
  "$MADGE" --circular "$MODULE_DIR" 2>/dev/null
  exit 1
fi
