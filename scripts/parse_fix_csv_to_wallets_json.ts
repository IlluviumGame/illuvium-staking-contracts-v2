import { BigNumber } from "ethers";
import { readFileSync, writeFileSync } from "fs";

let total = BigNumber.from(0);
let count = 0;
const data: Record<string, string> = {};
readFileSync('./mainnet_merkle_balances.csv', 'utf8').toString()
  .split('\n').slice(1).map((line) => line.split(',')).filter(([wallet]) => !!wallet)
    .forEach(([_id, wallet, core, lp]) => {
      const sum = BigNumber.from(core).add(BigNumber.from(lp));
      if (data[wallet]) {
        console.warn('Duplicate wallet:', wallet);
      }
      if (sum.gt(0)) {
        data[wallet] = sum.toString();
        count++;
        total = total.add(sum);
      }
    });

console.info('Count:', count);
console.info('Total rewards:', total.toString());
writeFileSync('./mainnet_merkle_balances.json', JSON.stringify(data, null, 2));
