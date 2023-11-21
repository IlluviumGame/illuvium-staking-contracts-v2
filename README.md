# Illuvium Staking V2 

- [Hardhat](https://github.com/nomiclabs/hardhat): compile and run the smart contracts on a local development network
- [TypeChain](https://github.com/ethereum-ts/TypeChain): generate TypeScript types for smart contracts
- [Ethers](https://github.com/ethers-io/ethers.js/): renowned Ethereum library and wallet implementation
- [Waffle](https://github.com/EthWorks/Waffle): tooling for writing comprehensive smart contract tests
- [Solhint](https://github.com/protofire/solhint): linter
- [Solcover](https://github.com/sc-forks/solidity-coverage): code coverage
- [Prettier Plugin Solidity](https://github.com/prettier-solidity/prettier-plugin-solidity): code formatter

## Usage

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
$ yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true yarn test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

### Deploy

Deploy the contracts to Hardhat Network:

```sh
$ yarn deploy
```

Deploy the contracts to a specific network, such as the Goerli testnet:

```sh
$ yarn deploy:network goerli
```

## Syntax Highlighting

If you use VSCode, you can enjoy syntax highlighting for your Solidity code via the
[vscode-solidity](https://github.com/juanfranblanco/vscode-solidity) extension. The recommended approach to set the
compiler version is to add the following fields to your VSCode user settings:

```json
{
  "solidity.compileUsingRemoteVersion": "v0.8.4+commit.c7e474f2",
  "solidity.defaultCompiler": "remote"
}
```

Where of course `v0.8.4+commit.c7e474f2` can be replaced with any other version.

## Deployment Addresses

Here's a list of Staking V2 contract addresses and dependencies.

### Goerli

- **ILV**: `0xf444A3355e4624f7B2c532557420E9C01CED499f`
- **sILV2**: `0x2192F21559A5c93C9468faDd93B61eCb1dFd61Dc`
- **Pool Factory**: `0x0434d7084d98124092f994222823EF4Ca0a332D6`
- **ILV Pool**: `0xE71dDCcB77ae32B98c19165DA8715c73DC38fC7A`
- **LP Pool**: `0xC8eb436FAfE1989a0fA73240569E4b14BF694615`
- **Vault**: `0x0dd04F85a078e0C89B8406e9E6aA0C51640b3c7B`
- **Vesting**: `0x5Afa292d1661a43202f3e59F7F09b5759ed524b8`
- **MerkleDistributor**: `0xdE9a2E15925955fB98c31EA2384e3e2686a302c5`

### Mainnet

- **ILV**: `0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E`
- **sILV2**: `0x7E77dCb127F99ECe88230a64Db8d595F31F1b068`
- **Pool Factory**: `0x9DcA38D109c6c69790Fb70BCfDEAF27C4394597c`
- **ILV Pool**: `0x7f5f854FfB6b7701540a00C69c4AB2De2B34291D`
- **LP Pool**: `0xe98477bDc16126bB0877c6e3882e3Edd72571Cc2`
- **Vault**: `0xAA2E727ba59b4fEa24d0Db4e49a392Fdc3E8e778`
- **Vesting**: `0x6Bd2814426f9a6abaA427D2ad3FC898D2A57aDC6`
- **MerkleDistributor**: `0x800E48366b3dc4D93114246D52B98Adb48aD83CB`
