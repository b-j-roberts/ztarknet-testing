#!/usr/bin/env tsx

import { Account, CallData, cairo, ec, hash } from "starknet";
import {
  loadConfig,
  createProvider,
  createAccount,
} from "./config.js";

/**
 * Create and deploy a new Starknet account
 *
 * This script will:
 * 1. Generate a new private key
 * 2. Calculate the account address
 * 3. Fund the account with fee tokens (~0.1 tokens)
 * 4. Deploy the account
 * 5. Output the account details
 *
 * Usage:
 *   tsx src/createAccount.ts
 */

/**
 * Generate a random private key
 */
function generatePrivateKey(): string {
  // Generate a valid Stark private key
  // The key must be in range: 1 <= n < CURVE_ORDER
  // We generate 252 bits (31.5 bytes) to stay safely within the curve order
  const randomBytes = new Uint8Array(31);
  crypto.getRandomValues(randomBytes);

  // Convert to hex string and ensure it starts with 0x
  let hexString = '0x' + Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return hexString;
}

/**
 * Calculate account address from private key and class hash
 */
function calculateAccountAddress(privateKey: string, classHash: string): string {
  // Get the Stark public key from private key
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);

  // Constructor calldata is just the public key for this account type
  const constructorCalldata = [starkKeyPub];

  // Calculate the contract address
  const contractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    classHash,
    constructorCalldata,
    0
  );

  return contractAddress;
}

/**
 * Fund the account by transferring tokens from the predeployed account
 */
async function mintFunds(
  provider: any,
  config: any,
  toAddress: string,
  amount: string
): Promise<void> {
  console.log("Funding account...");

  // Create account instance for the predeployed account
  const predeployedAccount = createAccount(provider, config);

  // Get nonce explicitly with pre_confirmed block identifier
  const nonce = await provider.getNonceForAddress(
    predeployedAccount.address,
    'pre_confirmed'
  );
  console.log("  Using nonce:", nonce);

  // Prepare transfer call
  const transferCall = {
    contractAddress: config.feeToken,
    entrypoint: "transfer",
    calldata: CallData.compile({
      recipient: toAddress,
      amount: cairo.uint256(amount),
    }),
  };

  // Execute transfer
  const transferResponse = await predeployedAccount.execute(transferCall, {
    blockIdentifier: 'pre_confirmed',
    nonce,
    skipValidate: true,
  });
  console.log("  Transaction hash:", transferResponse.transaction_hash);

  // Wait for confirmation
  console.log("  Waiting for transaction confirmation...");
  await provider.waitForTransaction(transferResponse.transaction_hash, {
    retryInterval: 100,
  });

  console.log("  Funding successful!");
}

/**
 * Deploy the account
 */
async function deployAccount(
  provider: any,
  config: any,
  privateKey: string,
  accountAddress: string
): Promise<void> {
  console.log("Deploying account...");

  // Get the Stark public key (used as address salt)
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);

  // Constructor calldata is just the public key
  const constructorCalldata = [starkKeyPub];

  // Create account instance using the same pattern as in config.ts
  const accountInstance = new Account({
    provider,
    address: accountAddress,
    signer: privateKey,
    cairoVersion: '1',
    transactionVersion: '0x3',
  });

  // Deploy the account
  const { transaction_hash } = await accountInstance.deployAccount({
    classHash: config.accountClassHash,
    constructorCalldata: constructorCalldata,
    addressSalt: starkKeyPub,
  });

  console.log("  Deployment transaction hash:", transaction_hash);

  // Wait for confirmation
  console.log("  Waiting for deployment confirmation...");
  await provider.waitForTransaction(transaction_hash, {
    retryInterval: 100,
  });

  console.log("  Deployment successful!");
}

async function main() {
  console.log("Creating new Starknet account...");
  console.log("");

  const config = loadConfig();
  const provider = createProvider(config);

  if (!config.accountClassHash) {
    console.error("Error: ZTARKNET_ACCOUNT_CLASS_HASH not set in .env file");
    process.exit(1);
  }

  if (!config.accountAddress || !config.accountPrivateKey) {
    console.error("Error: Predeployed account credentials not set in .env file");
    console.error("       ACCOUNT_ADDRESS and ACCOUNT_PRIVATE_KEY are required to fund the new account");
    process.exit(1);
  }

  try {
    // Step 1: Generate private key
    console.log("1. Generating private key...");
    const privateKey = generatePrivateKey();
    console.log("   Private key generated");
    console.log("");

    // Step 2: Calculate account address
    console.log("2. Calculating account address...");
    const accountAddress = calculateAccountAddress(privateKey, config.accountClassHash);
    console.log("   Account address:", accountAddress);
    console.log("");

    // Step 3: Mint funds (~0.1 fee tokens = 10^17 wei)
    console.log("3. Minting funds...");
    const fundingAmount = "100000000000000000"; // 0.1 tokens (10^17)
    await mintFunds(provider, config, accountAddress, fundingAmount);
    console.log("");

    // Step 4: Deploy account
    console.log("4. Deploying account...");
    await deployAccount(provider, config, privateKey, accountAddress);
    console.log("");

    // Step 5: Output account data
    console.log("=".repeat(60));
    console.log("New Account Created Successfully!");
    console.log("=".repeat(60));
    console.log("");
    console.log("Account Address:");
    console.log(accountAddress);
    console.log("");
    console.log("Private Key:");
    console.log(privateKey);
    console.log("");
    console.log("Account Class Hash:");
    console.log(config.accountClassHash);
    console.log("");
    console.log("Initial Balance: 0.1 fee tokens");
    console.log("");
    console.log("IMPORTANT: Save these credentials securely!");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("Failed to create account:", error);
    process.exit(1);
  }
}

main();
