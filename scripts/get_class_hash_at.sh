#!/bin/bash
# Get class hash at a contract address
# Usage: ./get_class_hash_at.sh <contract_address> [block_id]

source "$(dirname "$0")/../.env"

if [ -z "$1" ]; then
  echo "Error: Contract address required"
  echo "Usage: $0 <contract_address> [block_id]"
  exit 1
fi

CONTRACT_ADDRESS="$1"
BLOCK_ID="${2:-latest}"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\": \"2.0\", \"method\": \"starknet_getClassHashAt\", \"params\": [\"$BLOCK_ID\", \"$CONTRACT_ADDRESS\"], \"id\": 1}" | jq
