#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE="$ROOT_DIR/.env.example"

if [[ ! -f "$ENV_EXAMPLE" ]]; then
	echo ".env.example not found!"
	echo "Add a .env.example file before running this script."
	exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
	echo ".env already exists."
	exit 0
fi

cp "$ENV_EXAMPLE" "$ENV_FILE"
echo "Created .env from .env.example"
