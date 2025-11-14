import { Account, RpcProvider, legacyDeployer } from "starknet";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: resolve(__dirname, "../../.env") });

export interface Config {
  rpcUrl: string;
  chainId: string;
  accountAddress: string;
  accountPrivateKey: string;
  feeToken: string;
  strkToken: string;
  ethToken: string;
  counterContractAddress?: string;
  counterClassHash?: string;
}

export function loadConfig(): Config {
  const config: Config = {
    rpcUrl: process.env.RPC_URL || "http://localhost:9944",
    chainId: process.env.CHAIN_ID || "0x5a5441524b4e4554",
    accountAddress: process.env.ACCOUNT_ADDRESS || "",
    accountPrivateKey: process.env.ACCOUNT_PRIVATE_KEY || "",
    feeToken: process.env.FEE_TOKEN || "",
    strkToken: process.env.STRK_TOKEN || "",
    ethToken: process.env.ETH_TOKEN || "",
    counterContractAddress: process.env.COUNTER_CONTRACT_ADDRESS,
    counterClassHash: process.env.COUNTER_CLASS_HASH,
  };

  return config;
}

export interface AccountOptions {
  address?: string;
  privateKey?: string;
  useLegacyDeployer?: boolean;
}

export function createProvider(config: Config): RpcProvider {
  return new RpcProvider({
    nodeUrl: config.rpcUrl,
    blockIdentifier: "latest"
  });
}

export function createAccount(
  provider: RpcProvider,
  config: Config,
  options: AccountOptions = {}
): Account {
  const address = options.address || config.accountAddress;
  const privateKey = options.privateKey || config.accountPrivateKey;

  if (!address || !privateKey) {
    throw new Error(
      "Account address and private key must be set in .env file or provided as options"
    );
  }

  const accountConfig: any = {
    provider,
    address,
    signer: privateKey,
    cairoVersion: '1',
    transactionVersion: '0x3',
  };

  if (options.useLegacyDeployer) {
    accountConfig.deployer = legacyDeployer;
  }

  return new Account(accountConfig);
}

export function parseCommandLineArgs(): { [key: string]: string } {
  const args: { [key: string]: string } = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = process.argv[i + 1];
      if (value && !value.startsWith("--")) {
        args[key] = value;
        i++;
      } else {
        args[key] = "true";
      }
    }
  }
  return args;
}
