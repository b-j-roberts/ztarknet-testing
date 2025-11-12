#!/bin/bash
# Get state update for a block
# Usage: ./get_state_update.sh [block_number|"latest"]

source "$(dirname "$0")/../.env"

BLOCK_ID="${1:-latest}"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\": \"2.0\", \"method\": \"starknet_getStateUpdate\", \"params\": [\"$BLOCK_ID\"], \"id\": 1}" | jq
