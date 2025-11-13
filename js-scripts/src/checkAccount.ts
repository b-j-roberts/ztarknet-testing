#!/usr/bin/env tsx

import {
  loadConfig,
  createProvider,
  createAccount,
} from "./config.js";

async function main() {
  const config = loadConfig();
  const provider = createProvider(config);
  const account = createAccount(provider, config);

  console.log("Checking account:");
  console.log("  Address:", account.address);
  console.log("");

  try {
    // Check if account exists
    const nonce = await account.getNonce();
    console.log("✓ Account exists on network");
    console.log("  Nonce:", nonce);

    // Get class hash
    const classHash = await provider.getClassHashAt(account.address);
    console.log("  Class Hash:", classHash);
  } catch (error) {
    console.error("✗ Account check failed:", error);
    console.error("\nThis account may not exist on this network.");
    console.error("You may need to deploy it first or use a different account.");
    process.exit(1);
  }
}

main();
