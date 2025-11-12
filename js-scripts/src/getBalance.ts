#!/usr/bin/env tsx

import { Contract, uint256 } from "starknet";
import {
  loadConfig,
  createProvider,
  parseCommandLineArgs,
} from "./config.js";

/**
 * Get the token balance of an account
 *
 * Usage:
 *   tsx src/getBalance.ts --account <address> [--token <token_address>]
 *
 * Examples:
 *   tsx src/getBalance.ts --account 0x123...
 *   tsx src/getBalance.ts --account 0x123... --token 0x04718...
 */

// Minimal ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [
      {
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    outputs: [
      {
        type: "core::integer::u256",
      },
    ],
    state_mutability: "view",
  },
  {
    name: "name",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "core::felt252",
      },
    ],
    state_mutability: "view",
  },
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "core::felt252",
      },
    ],
    state_mutability: "view",
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "core::integer::u8",
      },
    ],
    state_mutability: "view",
  },
];

async function main() {
  const args = parseCommandLineArgs();

  if (!args.account) {
    console.error("Usage: tsx src/getBalance.ts --account <address> [--token <token_address>]");
    console.error("\nOptions:");
    console.error("  --account   Account address to check balance (required)");
    console.error("  --token     Token contract address (default: STRK_TOKEN from .env)");
    process.exit(1);
  }

  const config = loadConfig();
  const provider = createProvider(config);

  const accountAddress = args.account;
  const tokenAddress = args.token || config.strkToken;

  console.log("Balance Query:");
  console.log("  Account:   ", accountAddress);
  console.log("  Token:     ", tokenAddress);
  console.log("");

  try {
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);

    // Get balance
    const balance = await tokenContract.balanceOf(accountAddress);
    const balanceValue = uint256.uint256ToBN(balance);

    // Try to get token info (may not be available on all tokens)
    let symbol = "tokens";
    let decimals = 18;

    try {
      const symbolResult = await tokenContract.symbol();
      symbol = symbolResult.toString();
    } catch (e) {
      // Symbol not available
    }

    try {
      const decimalsResult = await tokenContract.decimals();
      decimals = Number(decimalsResult);
    } catch (e) {
      // Decimals not available
    }

    const formattedBalance = Number(balanceValue) / Math.pow(10, decimals);

    console.log("Balance (raw):      ", balanceValue.toString());
    console.log("Balance (formatted):", formattedBalance, symbol);
  } catch (error) {
    console.error("Failed to get balance:", error);
    process.exit(1);
  }
}

main();
