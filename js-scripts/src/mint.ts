#!/usr/bin/env tsx

import { CallData, cairo } from "starknet";
import {
  loadConfig,
  createProvider,
  createAccount,
  parseCommandLineArgs,
} from "./config.js";

/**
 * Mint tokens to an account
 *
 * Usage:
 *   tsx src/mint.ts --to <address> [--amount <amount>] [--token <token_address>] [--from-address <address>] [--from-key <private_key>]
 *
 * Examples:
 *   tsx src/mint.ts --to 0x123...
 *   tsx src/mint.ts --to 0x123... --amount 1000000000000000000
 *   tsx src/mint.ts --to 0x123... --amount 5000000000000000000 --token 0x04718...
 */

async function main() {
  const args = parseCommandLineArgs();

  if (!args.to) {
    console.error("Usage: tsx src/mint.ts --to <address> [--amount <amount>] [--token <token_address>] [--from-address <address>] [--from-key <private_key>]");
    console.error("\nOptions:");
    console.error("  --to            Recipient address (required)");
    console.error("  --amount        Amount to mint in wei (default: 10 tokens = 10^19 wei)");
    console.error("  --token         Token contract address (default: FEE_TOKEN from .env)");
    console.error("  --from-address  Minter address (default: ACCOUNT_ADDRESS from .env)");
    console.error("  --from-key      Minter private key (default: ACCOUNT_PRIVATE_KEY from .env)");
    process.exit(1);
  }

  const config = loadConfig();
  const provider = createProvider(config);

  // Allow override of minter account via CLI
  const account = createAccount(provider, config, {
    address: args["from-address"],
    privateKey: args["from-key"],
  });

  const recipient = args.to;
  const amount = args.amount || "10000000000000000000"; // Default: 10 tokens (10^19)
  const tokenAddress = args.token || config.feeToken;

  console.log("Mint Configuration:");
  console.log("  Minter:    ", account.address);
  console.log("  Recipient: ", recipient);
  console.log("  Amount:    ", amount);
  console.log("  Token:     ", tokenAddress);
  console.log("");

  try {
    console.log("Executing mint...");

    // Get nonce explicitly with pre_confirmed block identifier
    const nonce = await provider.getNonceForAddress(
      account.address,
      'pre_confirmed'
    );
    console.log("Using nonce:", nonce);

    const mintCall = {
      contractAddress: tokenAddress,
      entrypoint: "mint",
      calldata: CallData.compile({
        recipient: recipient,
        amount: cairo.uint256(amount),
      }),
    };

    const mintResponse = await account.execute(mintCall, {
      blockIdentifier: 'pre_confirmed',
      nonce,
      skipValidate: true,
    });
    console.log("Transaction hash:", mintResponse.transaction_hash);

    console.log("Waiting for transaction confirmation...");
    await provider.waitForTransaction(mintResponse.transaction_hash, {
      retryInterval: 100,
    });

    console.log("✓ Mint successful!");
  } catch (error) {
    console.error("Mint failed:", error);
    process.exit(1);
  }
}

main();
