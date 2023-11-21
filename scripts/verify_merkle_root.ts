import { BigNumber, utils } from 'ethers';

import { verifyProof, getRoot } from './helpers/merkle-verification';

const [prefixParam] = process.argv.slice(2);

try {
  const pathPrefix = prefixParam ? `${prefixParam}_` : '';
  const json = require(`./data/${pathPrefix}merkle_tree.json`);

  let isValid = true;
  let count = 0;

  const merkleRootHex = json.merkleRoot;
  const merkleRoot = Buffer.from(merkleRootHex.slice(2), 'hex');
  const balances: {
    index: number
    account: string
    amount: BigNumber
  }[] = [];

  Object.keys(json.claims).forEach((address) => {
    const claim = json.claims[address];
    const proof = claim.proof.map((p: string) => Buffer.from(p.slice(2), 'hex'));

    balances.push({
      index: claim.index,
      account: address,
      amount: BigNumber.from(claim.amount),
    });

    const success = verifyProof(claim.index, address, claim.amount, proof, merkleRoot);
    if (success) {
      console.log(`Verified proof for ${claim.index}: ${address}, value ${BigNumber.from(claim.amount)}`);
    } else {
      console.log(`Verification for ${address} failed`);
      isValid = false;
    }
    count++;
  })

  if (!isValid) {
    throw new Error('Failed validation for 1 or more proofs');
  }

  const root = getRoot(balances).toString('hex');
  const rootMatches = root === merkleRootHex.slice(2);
  const summedBalances = balances.reduce((sum, balance) => sum.add(balance.amount), BigNumber.from(0));

  console.log(`Reconstructed merkle root: 0x${root}`);
  console.log(`Summed balances: ${utils.formatEther(summedBalances)} (${summedBalances})`);
  console.log(`Count: ${count}`);

  if (!rootMatches) {
    console.warn('Root does NOT match the one read from the JSON, something might be wrong!');
  } else {
    console.log('Root matches the one read from the JSON, all good');
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
