#!/bin/bash
# Get latest block hash and number together

source "$(dirname "$0")/../.env"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "starknet_blockHashAndNumber", "params": [], "id": 1}' | jq
