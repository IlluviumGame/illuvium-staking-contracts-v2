import { ethers } from "hardhat";

import { config, sleep } from "./config/index";

async function main(): Promise<void> {
  const [owner] = await ethers.getSigners()

  const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", owner);

  console.info(`Factory address: ${config.factory}`);
  console.info(`ILVPool address: ${config.ilvPoolV2}`);
  console.info(`Merkle Root:     ${config.merkleDistributorRoot}`);
  console.info(`Deploying Merkle Distributor contract with address ${owner.address} in 10 seconds...`);

  await sleep(10000);

  // we intentionaly use ilvPoolV2 and not ilv to not overwrite factory ilv address contracts/PoolFactory.sol:242
  const deployTransaction = await MerkleDistributor.deploy(
    config.factory,
    config.ilvPoolV2,
    config.ilvPoolV2,
    config.merkleDistributorRoot,
  );
  console.log(`Deploying in transaction ${deployTransaction.deployTransaction.hash}`);
  const merkleDistributor = await deployTransaction.deployed();
  console.log(`Merkle Distributor contract deployed at ${merkleDistributor.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
