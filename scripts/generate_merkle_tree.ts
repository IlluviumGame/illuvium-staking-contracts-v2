import BigNumber from "bignumber.js";
import { writeFileSync } from "fs";
import { resolve } from "path";

import { parseBalanceMap } from "./helpers/parse-balance-map";

BigNumber.config({
  EXPONENTIAL_AT: 100,
  ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN,
})

const [skipParam, prefixParam] = process.argv.slice(2);

try {
  const skipCount = skipParam ? parseInt(skipParam, 10) : 0;
  const pathPrefix = prefixParam ? `${prefixParam}_` : ''

  const wallets: { [account: string]: number | string } = {};
  for (let i = 1; i <= skipCount; i++) {
    wallets[`0x${i.toString().padStart(40, '0')}`] =  new BigNumber(i).toString(16);
  }
  const merkleBalancesJson = require(`./data/${pathPrefix}merkle_balances.json`);
  for (const key in merkleBalancesJson) {
    const value = (merkleBalancesJson as Record<string, string>)[key];
    wallets[key] = new BigNumber(value).toString(16);
  }

  const treeWritePath = resolve(__dirname, `./data/${pathPrefix}merkle_tree.json`);
  const merkleTree = parseBalanceMap(wallets);
  const totalAmount = new BigNumber(merkleTree.tokenTotal);

  console.log(`Total amount in Wei: ${totalAmount.dividedBy(1e18).toString()} (${totalAmount})`);
  console.log(`Claims count: ${Object.keys(merkleTree.claims).length}`);
  console.log(`Merkle root: ${merkleTree.merkleRoot}`);
  console.log(`Merkle tree saved under "${treeWritePath}"`);

  writeFileSync(treeWritePath, JSON.stringify(merkleTree, null, 2));
} catch (err) {
  console.error(err);
  process.exit(1);
}
