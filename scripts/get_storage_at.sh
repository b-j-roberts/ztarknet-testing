#!/bin/bash
# Get storage value at a contract address
# Usage: ./get_storage_at.sh <contract_address> <storage_key> [block_id]

source "$(dirname "$0")/../.env"

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Error: Contract address and storage key required"
  echo "Usage: $0 <contract_address> <storage_key> [block_id]"
  exit 1
fi

CONTRACT_ADDRESS="$1"
STORAGE_KEY="$2"
BLOCK_ID="${3:-latest}"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\": \"2.0\", \"method\": \"starknet_getStorageAt\", \"params\": [\"$CONTRACT_ADDRESS\", \"$STORAGE_KEY\", \"$BLOCK_ID\"], \"id\": 1}" | jq
