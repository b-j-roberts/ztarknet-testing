#!/bin/bash
# Get account nonce
# Usage: ./get_nonce.sh <account_address> [block_id]

source "$(dirname "$0")/../.env"

if [ -z "$1" ]; then
  echo "Error: Account address required"
  echo "Usage: $0 <account_address> [block_id]"
  exit 1
fi

ACCOUNT_ADDRESS="$1"
BLOCK_ID="${2:-latest}"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\": \"2.0\", \"method\": \"starknet_getNonce\", \"params\": [\"$BLOCK_ID\", \"$ACCOUNT_ADDRESS\"], \"id\": 1}" | jq
