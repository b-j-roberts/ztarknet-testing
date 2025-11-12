#!/bin/bash
# Get block with full transactions
# Usage: ./get_block_with_txs.sh [block_number|"latest"]

source "$(dirname "$0")/../.env"

BLOCK_ID="${1:-latest}"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\": \"2.0\", \"method\": \"starknet_getBlockWithTxs\", \"params\": [\"$BLOCK_ID\"], \"id\": 1}" | jq
