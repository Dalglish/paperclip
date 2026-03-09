#!/usr/bin/env bash
# Start the Equilibri Dashboard API server
# Usage: ./start.sh
#
# Requires: .env file at /Users/brianross/ff-sales-pipeline/.env
# Serves on port 3200 by default (override with DASHBOARD_API_PORT)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"

# Create virtualenv if missing
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtualenv..."
    python3 -m venv "$VENV_DIR"
fi

# Activate and install deps
source "$VENV_DIR/bin/activate"
pip install -q -r "$SCRIPT_DIR/requirements.txt"

# Run the server
echo "Starting Equilibri Dashboard API on port ${DASHBOARD_API_PORT:-3200}..."
exec python3 "$SCRIPT_DIR/server.py"
