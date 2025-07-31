#!/bin/bash

# Usage: ./link-package.sh <package-name> <path-to-package-root>
# Example: ./link-package.sh @myorg/lib-a ../monorepo/packages/lib-a

set -e

PACKAGE_NAME="$1"
PACKAGE_ROOT_PATH="$2"
NODE_MODULES_DIR="./node_modules"

if [[ -z "$PACKAGE_NAME" || -z "$PACKAGE_ROOT_PATH" ]]; then
  echo "Usage: $0 <package-name> <path-to-package-root>"
  exit 1
fi

# Resolve full, absolute paths
PACKAGE_ROOT_PATH="$(realpath "$PACKAGE_ROOT_PATH")"
PACKAGE_DIR="$NODE_MODULES_DIR/$PACKAGE_NAME"

echo "🔗 Linking $PACKAGE_NAME → $PACKAGE_ROOT_PATH"
echo "📁 Target: $PACKAGE_DIR"

# Create the parent folder (e.g. node_modules/@myorg)
mkdir -p "$(dirname "$PACKAGE_DIR")"

# Remove existing link or folder
if [ -e "$PACKAGE_DIR" ] || [ -L "$PACKAGE_DIR" ]; then
  rm -rf "$PACKAGE_DIR"
fi

# Create the symlink
ln -s "$PACKAGE_ROOT_PATH" "$PACKAGE_DIR"

echo "✅ Linked $PACKAGE_NAME to $PACKAGE_DIR"
