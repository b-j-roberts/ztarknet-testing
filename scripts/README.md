# Starknet RPC Utility Scripts

Collection of bash scripts for interacting with Starknet RPC. All scripts automatically load environment variables from `../.env`.

## Prerequisites

- `curl` - for making HTTP requests
- `jq` - for JSON formatting (optional but recommended)
- `.env` file in parent directory with `RPC_URL` set

## Node Status & Info

### `get_block_number.sh`
Get the latest block height.
```bash
./get_block_number.sh
```

### `get_chain_id.sh`
Get the chain ID.
```bash
./get_chain_id.sh
```

### `get_sync_status.sh`
Check if the node is syncing.
```bash
./get_sync_status.sh
```

### `get_spec_version.sh`
Get the JSON-RPC spec version.
```bash
./get_spec_version.sh
```

### `get_block_hash_and_number.sh`
Get latest block hash and number together.
```bash
./get_block_hash_and_number.sh
```

## Block Queries

### `get_block.sh`
Get block with transaction hashes.
```bash
./get_block.sh                    # Get latest block
./get_block.sh latest             # Get latest block
./get_block.sh 100                # Get block 100
```

### `get_block_with_txs.sh`
Get block with full transaction details.
```bash
./get_block_with_txs.sh           # Get latest block
./get_block_with_txs.sh 100       # Get block 100
```

### `get_state_update.sh`
Get state update for a block (deployed contracts, declared classes, storage diffs).
```bash
./get_state_update.sh             # Get latest state update
./get_state_update.sh 0           # Get genesis state update
./get_state_update.sh 100         # Get block 100 state update
```

## Contract Queries

### `get_class_hash_at.sh`
Get the class hash deployed at a contract address.
```bash
./get_class_hash_at.sh 0x123...
./get_class_hash_at.sh 0x123... latest
./get_class_hash_at.sh 0x123... 100
```

### `get_class.sh`
Get the full class definition (including ABI) by class hash.
```bash
./get_class.sh 0xabc...
./get_class.sh 0xabc... latest
./get_class.sh 0xabc... 100
```

### `get_nonce.sh`
Get the nonce for an account.
```bash
./get_nonce.sh 0x123...
./get_nonce.sh 0x123... latest
```

### `get_storage_at.sh`
Read storage value at a contract address.
```bash
./get_storage_at.sh 0x123... 0x0              # Read storage slot 0x0
./get_storage_at.sh 0x123... 0x5 latest       # Read storage slot 0x5
```

### `call_contract.sh`
Call a contract function (read-only, no state change).
```bash
# Call with no calldata
./call_contract.sh 0x123... 0xfunc_selector...

# Call with calldata arguments
./call_contract.sh 0x123... 0xfunc_selector... 0x1 0x2 0x3

# Call at specific block
./call_contract.sh 0x123... 0xfunc_selector... 0x1 0x2 latest
```

## Transaction Queries

### `get_transaction.sh`
Get transaction details by hash.
```bash
./get_transaction.sh 0xabc...
```

### `get_tx_receipt.sh`
Get transaction receipt (includes execution result, events, etc.).
```bash
./get_tx_receipt.sh 0xabc...
```

## Examples

### Check if node is healthy
```bash
./get_sync_status.sh
./get_block_number.sh
```

### Inspect the genesis block
```bash
./get_block.sh 0
./get_state_update.sh 0
```

### Query fee token contract
```bash
source ../.env
./get_class_hash_at.sh $FEE_TOKEN
./get_nonce.sh $FEE_TOKEN_MINTER
```

### Get class ABI
```bash
# First get the class hash at an address
CLASS_HASH=$(./get_class_hash_at.sh 0x123... | jq -r '.result')

# Then get the full class (includes ABI)
./get_class.sh $CLASS_HASH | jq '.result.abi' > contract_abi.json
```

## Tips

- All scripts use `-s` flag with curl for silent mode
- All scripts pipe output to `jq` for pretty formatting
- Block ID parameters accept: block number, "latest", or "pending"
- For hex values, always include the `0x` prefix
