#!/bin/bash
# Get class definition by class hash
# Usage: ./get_class.sh <class_hash> [block_id]

source "$(dirname "$0")/../.env"

if [ -z "$1" ]; then
  echo "Error: Class hash required"
  echo "Usage: $0 <class_hash> [block_id]"
  exit 1
fi

CLASS_HASH="$1"
BLOCK_ID="${2:-latest}"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\": \"2.0\", \"method\": \"starknet_getClass\", \"params\": [\"$BLOCK_ID\", \"$CLASS_HASH\"], \"id\": 1}" | jq
