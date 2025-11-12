#!/usr/bin/env tsx

import { Contract, CallData } from "starknet";
import {
  loadConfig,
  createProvider,
  parseCommandLineArgs,
} from "./config.js";

/**
 * Read data from a contract (view function)
 *
 * Usage:
 *   tsx src/readContract.ts --contract <address> --function <function_name> [--calldata <args>]
 *
 * Examples:
 *   tsx src/readContract.ts --contract 0x123... --function get_counter
 *   tsx src/readContract.ts --contract 0x123... --function balanceOf --calldata 0xabc...
 */

// Counter contract ABI
const COUNTER_ABI = [
  {
    type: "function",
    name: "get_counter",
    inputs: [],
    outputs: [
      {
        type: "core::integer::u128",
      },
    ],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "increment",
    inputs: [],
    outputs: [],
    state_mutability: "external",
  },
];

async function main() {
  const args = parseCommandLineArgs();

  if (!args.contract || !args.function) {
    console.error("Usage: tsx src/readContract.ts --contract <address> --function <function_name> [--calldata <args>]");
    console.error("\nOptions:");
    console.error("  --contract   Contract address (required, or use COUNTER_CONTRACT_ADDRESS from .env)");
    console.error("  --function   Function name to call (required)");
    console.error("  --calldata   Function arguments, comma-separated (optional)");
    console.error("\nExamples:");
    console.error("  tsx src/readContract.ts --contract 0x123... --function get_counter");
    console.error("  tsx src/readContract.ts --function get_counter  # Uses COUNTER_CONTRACT_ADDRESS from .env");
    console.error("  tsx src/readContract.ts --contract 0x123... --function balanceOf --calldata 0xabc...");
    process.exit(1);
  }

  const config = loadConfig();
  const provider = createProvider(config);

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

  console.log("Read Contract:");
  console.log("  Contract:  ", contractAddress);
  console.log("  Function:  ", functionName);
  console.log("  Arguments: ", calldata.length > 0 ? calldata : "none");
  console.log("");

  try {
    // For counter contract, use the ABI. For generic contracts, try without ABI
    let contract: Contract;
    if (functionName === "get_counter" || functionName === "increment") {
      contract = new Contract(COUNTER_ABI, contractAddress, provider);
    } else {
      // Generic contract call without ABI
      contract = new Contract([], contractAddress, provider);
    }

    console.log("Calling function...");

    let result;
    if (calldata.length > 0) {
      result = await contract.call(functionName, calldata);
    } else {
      result = await contract.call(functionName);
    }

    console.log("Result:", result);

    // Special handling for counter
    if (functionName === "get_counter") {
      console.log("Counter value:", result.toString());
    }
  } catch (error) {
    console.error("Read failed:", error);
    process.exit(1);
  }
}

main();
