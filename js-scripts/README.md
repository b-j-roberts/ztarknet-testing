# Ztarknet TypeScript Scripts

Collection of TypeScript scripts to interact with Ztarknet (Madara) node using Starknet.js.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Copy .env.example to parent directory and update values
cp .env.example ../.env

# Get predeployed account info from Madara logs
cd ..
make accounts

# Update ../.env with:
# - ACCOUNT_ADDRESS (from predeployed accounts)
# - ACCOUNT_PRIVATE_KEY (from predeployed accounts)
```

## Scripts

### 1. Transfer Funds

Transfer tokens from one account to another.

```bash
# Using npm script
npm run transfer -- --to <address> --amount <amount>

# Direct execution
tsx src/transfer.ts --to 0x123... --amount 1000000000000000000

# Transfer from custom account
tsx src/transfer.ts --to 0x123... --amount 1000 --from-address 0xabc... --from-key 0xdef...

# Transfer custom token
tsx src/transfer.ts --to 0x123... --amount 1000 --token 0x04718...
```

**Options:**
- `--to`: Recipient address (required)
- `--amount`: Amount in wei (required)
- `--token`: Token contract address (default: STRK_TOKEN)
- `--from-address`: Sender address (default: ACCOUNT_ADDRESS)
- `--from-key`: Sender private key (default: ACCOUNT_PRIVATE_KEY)

### 2. Get Balance

Query the token balance of an account.

```bash
# Using npm script
npm run balance -- --account <address>

# Direct execution
tsx src/getBalance.ts --account 0x123...

# Check balance of custom token
tsx src/getBalance.ts --account 0x123... --token 0x04718...
```

**Options:**
- `--account`: Account address to query (required)
- `--token`: Token contract address (default: STRK_TOKEN)

### 3. Declare Contract

Declare a contract class on Starknet.

```bash
# Using npm script
npm run declare -- --sierra <path> --casm <path>

# Direct execution
tsx src/declareContract.ts \
  --sierra ../onchain/target/dev/onchain_Counter.contract_class.json \
  --casm ../onchain/target/dev/onchain_Counter.compiled_contract_class.json
```

**Options:**
- `--sierra`: Path to Sierra contract class JSON (required)
- `--casm`: Path to compiled CASM JSON (required)

**Note:** Save the returned `class_hash` to `.env` as `COUNTER_CLASS_HASH`.

### 4. Deploy Contract

Deploy a contract from a declared class.

```bash
# Using npm script
npm run deploy -- --class-hash <hash>

# Direct execution
tsx src/deployContract.ts --class-hash 0x123...

# Deploy with constructor arguments
tsx src/deployContract.ts --class-hash 0x123... --calldata 100,200
```

**Options:**
- `--class-hash`: Class hash from declaration (required)
- `--calldata`: Constructor arguments, comma-separated (optional)

**Note:** Save the returned `contract_address` to `.env` as `COUNTER_CONTRACT_ADDRESS`.

### 5. Read Contract

Call a view function on a contract.

```bash
# Using npm script
npm run read -- --function <name>

# Direct execution - uses COUNTER_CONTRACT_ADDRESS from .env
tsx src/readContract.ts --function get_counter

# Read from specific contract
tsx src/readContract.ts --contract 0x123... --function get_counter

# Read with arguments
tsx src/readContract.ts --contract 0x123... --function balanceOf --calldata 0xabc...
```

**Options:**
- `--contract`: Contract address (or use COUNTER_CONTRACT_ADDRESS)
- `--function`: Function name (required)
- `--calldata`: Arguments, comma-separated (optional)

### 6. Invoke Contract

Execute a state-changing function on a contract.

```bash
# Using npm script
npm run invoke -- --function <name>

# Direct execution - uses COUNTER_CONTRACT_ADDRESS from .env
tsx src/invokeContract.ts --function increment

# Invoke specific contract
tsx src/invokeContract.ts --contract 0x123... --function increment

# Invoke with arguments
tsx src/invokeContract.ts --contract 0x123... --function transfer --calldata 0xabc...,1000
```

**Options:**
- `--contract`: Contract address (or use COUNTER_CONTRACT_ADDRESS)
- `--function`: Function name (required)
- `--calldata`: Arguments, comma-separated (optional)

## Counter Contract Quick Commands

For convenience, Makefile commands are available in the parent directory:

```bash
# Read counter value
make counter-read

# Increment counter
make counter-increment
```

## Complete Workflow Example

Here's a complete example of deploying and interacting with the counter contract:

```bash
# 1. Build the counter contract
cd ../onchain
scarb build

# 2. Declare the contract
cd ../js-scripts
npm run declare -- \
  --sierra ../onchain/target/dev/onchain_Counter.contract_class.json \
  --casm ../onchain/target/dev/onchain_Counter.compiled_contract_class.json

# 3. Update .env with COUNTER_CLASS_HASH from step 2

# 4. Deploy the contract
npm run deploy -- --class-hash <class_hash_from_step_2>

# 5. Update .env with COUNTER_CONTRACT_ADDRESS from step 4

# 6. Read initial counter value
npm run read -- --function get_counter

# 7. Increment the counter
npm run invoke -- --function increment

# 8. Read updated counter value
npm run read -- --function get_counter

# Or use Makefile shortcuts
cd ..
make counter-read
make counter-increment
make counter-read
```

## Environment Variables

Required in `../.env`:

```bash
RPC_URL=http://localhost:9944
CHAIN_ID=0x5a5441524b4e4554
ACCOUNT_ADDRESS=<from make accounts>
ACCOUNT_PRIVATE_KEY=<from make accounts>
STRK_TOKEN=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
ETH_TOKEN=0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7
COUNTER_CONTRACT_ADDRESS=<from deployment>
COUNTER_CLASS_HASH=<from declaration>
```

## Troubleshooting

**Account not found:**
- Make sure Madara devnet is running: `make start`
- Get predeployed accounts: `make accounts`
- Update `.env` with account details

**Transaction fails:**
- Check account has sufficient balance
- Verify contract addresses are correct
- Ensure RPC_URL is accessible

**Module not found:**
- Run `npm install` in js-scripts directory
- Check TypeScript paths in tsconfig.json
