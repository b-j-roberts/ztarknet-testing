#!/usr/bin/env tsx

import { CallData } from "starknet";
import {
  loadConfig,
  createProvider,
  createAccount,
  parseCommandLineArgs,
} from "./config.js";

/**
 * Invoke a contract function (write operation)
 *
 * Usage:
 *   tsx src/invokeContract.ts --contract <address> --function <function_name> [--calldata <args>]
 *
 * Examples:
 *   tsx src/invokeContract.ts --contract 0x123... --function increment
 *   tsx src/invokeContract.ts --function increment  # Uses COUNTER_CONTRACT_ADDRESS from .env
 *   tsx src/invokeContract.ts --contract 0x123... --function transfer --calldata 0xabc...,1000
 */

async function main() {
  const args = parseCommandLineArgs();

  if (!args.function) {
    console.error("Usage: tsx src/invokeContract.ts --contract <address> --function <function_name> [--calldata <args>]");
    console.error("\nOptions:");
    console.error("  --contract   Contract address (required, or use COUNTER_CONTRACT_ADDRESS from .env)");
    console.error("  --function   Function name to invoke (required)");
    console.error("  --calldata   Function arguments, comma-separated (optional)");
    console.error("\nExamples:");
    console.error("  tsx src/invokeContract.ts --contract 0x123... --function increment");
    console.error("  tsx src/invokeContract.ts --function increment  # Uses COUNTER_CONTRACT_ADDRESS");
    console.error("  tsx src/invokeContract.ts --contract 0x123... --function transfer --calldata 0xabc...,1000");
    process.exit(1);
  }

  const config = loadConfig();
  const provider = createProvider(config);

  const account = createAccount(provider, config);

  const contractAddress =
    args.contract || config.counterContractAddress || "";

  if (!contractAddress) {
    console.error("Error: No contract address provided. Use --contract flag or set COUNTER_CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  const functionName = args.function;
  const calldataStr = args.calldata || "";
  const calldata = calldataStr
    ? calldataStr.split(",").map((x) => x.trim())
    : [];

  console.log("Invoke Contract:");
  console.log("  Account:   ", account.address);
  console.log("  Contract:  ", contractAddress);
  console.log("  Function:  ", functionName);
  console.log("  Arguments: ", calldata.length > 0 ? calldata : "none");
  console.log("");

  try {
    console.log("Invoking function...");

    // Get nonce explicitly with pre_confirmed block identifier
    const nonce = await provider.getNonceForAddress(
      account.address,
      'pre_confirmed'
    );
    console.log("Using nonce:", nonce);

    const invokeCall = {
      contractAddress: contractAddress,
      entrypoint: functionName,
      calldata: calldata.length > 0 ? CallData.compile(calldata) : [],
    };

    const invokeResponse = await account.execute(invokeCall, {
      blockIdentifier: 'pre_confirmed',
      nonce,
      skipValidate: true,
    });
    console.log("Transaction hash:", invokeResponse.transaction_hash);

    console.log("\nWaiting for transaction confirmation...");
    await provider.waitForTransaction(invokeResponse.transaction_hash, {
      retryInterval: 100,
    });

    console.log("\n✓ Function invoked successfully!");
  } catch (error) {
    console.error("Invoke failed:", error);
    process.exit(1);
  }
}

main();
