#!/bin/bash
# Get block with transaction hashes
# Usage: ./get_block.sh [block_number|"latest"]

source "$(dirname "$0")/../.env"

BLOCK_ID="${1:-latest}"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\": \"2.0\", \"method\": \"starknet_getBlockWithTxHashes\", \"params\": [\"$BLOCK_ID\"], \"id\": 1}" | jq
