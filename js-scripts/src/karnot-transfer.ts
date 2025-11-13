import * as starknet from 'starknet';
import ERC20 from './ERC20.json' assert { type: 'json' };
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: resolve(__dirname, '../../.env') });

const provider = new starknet.RpcProvider({
    nodeUrl: 'https://ztarknet-madara.d.karnot.xyz',
});

if (!process.env.ACCOUNT_ADDRESS || !process.env.ACCOUNT_PRIVATE_KEY) {
    throw new Error('ACCOUNT_ADDRESS and ACCOUNT_PRIVATE_KEY environment variables must be set');
}

const account = new starknet.Account({
    provider,
    address: process.env.ACCOUNT_ADDRESS,
    signer: process.env.ACCOUNT_PRIVATE_KEY,
    cairoVersion: '1',
    transactionVersion: '0x3',
});

async function transfer() {
    const fee_token_address =
        '0x1ad102b4c4b3e40a51b6fb8a446275d600555bd63a95cdceed3e5cef8a6bc1d';

    const contract = new starknet.Contract({
        abi: ERC20.abi,
        address: fee_token_address,
        providerOrAccount: provider,
    });

    const nonce = await provider.getNonceForAddress(
        account.address,
        'pre_confirmed'
    );
    console.log('nonce - ', nonce);

    const result = contract.populate('transfer', {
        recipient: '0x1234',
        amount: {
            low: 1,
            high: 0,
        },
    });
    console.log('populated tx - ', result);

    const tx_result = await account.execute(result, {
        blockIdentifier: 'pre_confirmed',
        nonce,
        skipValidate: true,
    });
    console.log('tx_result - ', tx_result);

    const receipt = await provider.waitForTransaction(
        tx_result.transaction_hash,
        {
            retryInterval: 100,
        }
    );

    console.log('receipt - ', receipt);
}

transfer().catch(console.error);
