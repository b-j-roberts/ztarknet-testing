#!/bin/bash
# Get the latest block number/height

source "$(dirname "$0")/../.env"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "starknet_blockNumber", "params": [], "id": 1}' | jq
