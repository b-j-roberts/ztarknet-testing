#!/usr/bin/env tsx

import {
  loadConfig,
  createProvider,
  createAccount,
  parseCommandLineArgs,
} from "./config.js";

/**
 * Deploy a contract from a declared class
 *
 * Usage:
 *   tsx src/deployContract.ts --class-hash <class_hash> [--calldata <constructor_args>]
 *
 * Examples:
 *   tsx src/deployContract.ts --class-hash 0x123...
 *   tsx src/deployContract.ts --class-hash 0x123... --calldata 100,200
 */

async function main() {
  const args = parseCommandLineArgs();

  if (!args["class-hash"]) {
    console.error("Usage: tsx src/deployContract.ts --class-hash <class_hash> [--calldata <constructor_args>]");
    console.error("\nOptions:");
    console.error("  --class-hash    Class hash of the declared contract (required)");
    console.error("  --calldata      Constructor arguments, comma-separated (optional)");
    console.error("\nExamples:");
    console.error("  tsx src/deployContract.ts --class-hash 0x123...");
    console.error("  tsx src/deployContract.ts --class-hash 0x123... --calldata 100,200");
    process.exit(1);
  }

  const config = loadConfig();
  const provider = createProvider(config);
  const account = createAccount(provider, config);

  const classHash = args["class-hash"];
  const calldataStr = args.calldata || "";
  const constructorCalldata = calldataStr
    ? calldataStr.split(",").map((x) => x.trim())
    : [];

  console.log("Deploy Configuration:");
  console.log("  Account:         ", account.address);
  console.log("  Class Hash:      ", classHash);
  console.log("  Constructor Args:", constructorCalldata.length > 0 ? constructorCalldata : "none");
  console.log("");

  try {
    console.log("Deploying contract...");
    const deployResult = await account.deployContract(
      {
        classHash: classHash,
        constructorCalldata: constructorCalldata,
      },
      {
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
      }
    );

    console.log("Transaction hash:  ", deployResult.transaction_hash);
    console.log("Contract address:  ", deployResult.contract_address);

    console.log("\nWaiting for transaction confirmation...");
    await provider.waitForTransaction(deployResult.transaction_hash);

    console.log("\n✓ Contract deployed successfully!");
    console.log("\nAdd this to your .env file:");
    console.log(`COUNTER_CONTRACT_ADDRESS=${deployResult.contract_address}`);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main();
