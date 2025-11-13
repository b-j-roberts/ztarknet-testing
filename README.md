## Testing out Ztarknet

### Basic Transfer:

```
cp .env.karnot .env
# Set ACCOUNT_ADDRESS & ACCOUNT_PRIVATE_KEY
source .env

cd js-scripts
npm install
npm run transfer -- --to 0x92a3a31b293272f489071bcf89cae9b18b513476d0de325f6808915602ec1f --amount 10000
```
