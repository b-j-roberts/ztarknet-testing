#!/bin/bash
# Get transaction receipt
# Usage: ./get_tx_receipt.sh <transaction_hash>

source "$(dirname "$0")/../.env"

if [ -z "$1" ]; then
  echo "Error: Transaction hash required"
  echo "Usage: $0 <transaction_hash>"
  exit 1
fi

TX_HASH="$1"

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\": \"2.0\", \"method\": \"starknet_getTransactionReceipt\", \"params\": [\"$TX_HASH\"], \"id\": 1}" | jq
