#!/bin/bash
# Get the JSON-RPC spec version

source "$(dirname "$0")/../.env"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "starknet_specVersion", "params": [], "id": 1}' | jq
