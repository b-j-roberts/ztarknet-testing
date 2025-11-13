#!/usr/bin/env tsx

import { readFileSync } from "fs";
import { resolve } from "path";
import {
  loadConfig,
  createProvider,
  createAccount,
  parseCommandLineArgs,
} from "./config.js";

/**
 * Declare a contract class on Starknet
 *
 * Usage:
 *   tsx src/declareContract.ts --sierra <path_to_sierra.json> --casm <path_to_casm.json>
 *
 * Examples:
 *   tsx src/declareContract.ts --sierra ../onchain/target/dev/onchain_Counter.contract_class.json --casm ../onchain/target/dev/onchain_Counter.compiled_contract_class.json
 */

async function main() {
  const args = parseCommandLineArgs();

  if (!args.sierra || !args.casm) {
    console.error("Usage: tsx src/declareContract.ts --sierra <path_to_sierra.json> --casm <path_to_casm.json>");
    console.error("\nOptions:");
    console.error("  --sierra    Path to Sierra contract class JSON file (required)");
    console.error("  --casm      Path to compiled CASM JSON file (required)");
    console.error("\nExample:");
    console.error("  tsx src/declareContract.ts \\");
    console.error("    --sierra ../onchain/target/dev/onchain_Counter.contract_class.json \\");
    console.error("    --casm ../onchain/target/dev/onchain_Counter.compiled_contract_class.json");
    process.exit(1);
  }

  const config = loadConfig();
  const provider = createProvider(config);
  const account = createAccount(provider, config);

  const sierraPath = resolve(process.cwd(), args.sierra);
  const casmPath = resolve(process.cwd(), args.casm);

  console.log("Declare Configuration:");
  console.log("  Account:     ", account.address);
  console.log("  Sierra Path: ", sierraPath);
  console.log("  CASM Path:   ", casmPath);
  console.log("");

  try {
    console.log("Loading contract files...");
    const sierra = JSON.parse(readFileSync(sierraPath, "utf8"));
    const casm = JSON.parse(readFileSync(casmPath, "utf8"));

    console.log("Declaring contract...");

    // Get current nonce
    const nonce = await account.getNonce();
    console.log("Current nonce:", nonce);

    // Use V3 transactions with resource bounds
    const declareResponse = await account.declare(
      {
        contract: sierra,
        casm: casm,
      },
      {
        version: 3,
        nonce: nonce,
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
      }
    );

    console.log("Transaction hash:", declareResponse.transaction_hash);
    console.log("Class hash:      ", declareResponse.class_hash);

    console.log("\nWaiting for transaction confirmation...");
    await provider.waitForTransaction(declareResponse.transaction_hash);

    console.log("\n✓ Contract declared successfully!");
    console.log("\nAdd this to your .env file:");
    console.log(`COUNTER_CLASS_HASH=${declareResponse.class_hash}`);
  } catch (error) {
    console.error("Declaration failed:", error);
    process.exit(1);
  }
}

main();
