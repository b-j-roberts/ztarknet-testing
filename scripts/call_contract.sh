#!/bin/bash
# Call a contract function (read-only)
# Usage: ./call_contract.sh <contract_address> <function_selector> [calldata...] [block_id]
# Example: ./call_contract.sh 0x123... 0xabc... 0x1 0x2

source "$(dirname "$0")/../.env"

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Error: Contract address and function selector required"
  echo "Usage: $0 <contract_address> <function_selector> [calldata...] [block_id]"
  exit 1
fi

CONTRACT_ADDRESS="$1"
FUNCTION_SELECTOR="$2"
shift 2

# Collect calldata arguments
CALLDATA="[]"
if [ $# -gt 0 ]; then
  # Check if last arg looks like a block specifier
  LAST_ARG="${!#}"
  if [[ "$LAST_ARG" == "latest" ]] || [[ "$LAST_ARG" == "pending" ]]; then
    BLOCK_ID="$LAST_ARG"
    set -- "${@:1:$(($#-1))}"  # Remove last argument
  else
    BLOCK_ID="latest"
  fi

  # Build calldata array from remaining arguments
  if [ $# -gt 0 ]; then
    CALLDATA="["
    for arg in "$@"; do
      CALLDATA="${CALLDATA}\"${arg}\","
    done
    CALLDATA="${CALLDATA%,}]"  # Remove trailing comma
  fi
else
  BLOCK_ID="latest"
fi

curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\": \"2.0\", \"method\": \"starknet_call\", \"params\": [{\"contract_address\": \"$CONTRACT_ADDRESS\", \"entry_point_selector\": \"$FUNCTION_SELECTOR\", \"calldata\": $CALLDATA}, \"$BLOCK_ID\"], \"id\": 1}" | jq
