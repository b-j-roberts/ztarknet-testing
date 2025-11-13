#!/usr/bin/env tsx

import { CallData, cairo } from "starknet";
import {
  loadConfig,
  createProvider,
  createAccount,
  parseCommandLineArgs,
} from "./config.js";

/**
 * Transfer tokens from one account to another
 *
 * Usage:
 *   tsx src/transfer.ts --to <address> --amount <amount> [--token <token_address>] [--from-address <address>] [--from-key <private_key>]
 *
 * Examples:
 *   tsx src/transfer.ts --to 0x123... --amount 1000000000000000000
 *   tsx src/transfer.ts --to 0x123... --amount 1 --token 0x04718... --from-address 0xabc... --from-key 0xdef...
 */

async function main() {
  const args = parseCommandLineArgs();

  if (!args.to || !args.amount) {
    console.error("Usage: tsx src/transfer.ts --to <address> --amount <amount> [--token <token_address>] [--from-address <address>] [--from-key <private_key>]");
    console.error("\nOptions:");
    console.error("  --to            Recipient address (required)");
    console.error("  --amount        Amount to transfer in wei (required)");
    console.error("  --token         Token contract address (default: STRK_TOKEN from .env)");
    console.error("  --from-address  Sender address (default: ACCOUNT_ADDRESS from .env)");
    console.error("  --from-key      Sender private key (default: ACCOUNT_PRIVATE_KEY from .env)");
    process.exit(1);
  }

  const config = loadConfig();
  const provider = createProvider(config);

  // Allow override of sender account via CLI
  const fromAddress = args["from-address"] || config.accountAddress;
  const fromKey = args["from-key"] || config.accountPrivateKey;
  const account = createAccount(provider, {
    ...config,
    accountAddress: fromAddress,
    accountPrivateKey: fromKey,
  });

  const recipient = args.to;
  const amount = args.amount;
  const tokenAddress = args.token || config.strkToken;

  console.log("Transfer Configuration:");
  console.log("  From:      ", account.address);
  console.log("  To:        ", recipient);
  console.log("  Amount:    ", amount);
  console.log("  Token:     ", tokenAddress);
  console.log("");

  try {
    console.log("Executing transfer...");

    const transferCall = {
      contractAddress: tokenAddress,
      entrypoint: "transfer",
      calldata: CallData.compile({
        recipient: recipient,
        amount: cairo.uint256(amount),
      }),
    };

    const transferResponse = await account.execute(transferCall, undefined, {
      version: 3,
      resourceBounds: {
        l1_gas: {
          max_amount: "0x1000",
          max_price_per_unit: "0x5f5e100"
        },
        l2_gas: {
          max_amount: "0x100000",
          max_price_per_unit: "0x5f5e100"
        },
        l1_data_gas: {
          max_amount: "0x1000",
          max_price_per_unit: "0x5f5e100"
        }
      }
    });
    console.log("Transaction hash:", transferResponse.transaction_hash);

    console.log("Waiting for transaction confirmation...");
    await provider.waitForTransaction(transferResponse.transaction_hash);

    console.log("✓ Transfer successful!");
  } catch (error) {
    console.error("Transfer failed:", error);
    process.exit(1);
  }
}

main();
