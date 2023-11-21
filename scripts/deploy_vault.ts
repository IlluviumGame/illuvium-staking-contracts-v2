import { ethers, upgrades } from "hardhat";

import { Vault__factory, ILVPool, SushiLPPool, Vault } from "../typechain";

import YieldTree from "../test/utils/yield-tree";
import { toWei } from "../test/utils";

import { config } from "./config/index";

import rinkebyData from "./data/weight_data_rinkeby_v1.json";

const parseEther = ethers.utils.parseEther;

async function main(): Promise<void> {
  const Vault = <Vault__factory>await ethers.getContractFactory("Vault");

  console.log("Deploying vault contract..");
  const deployVaultTx = await Vault.deploy(config.router, config.ilv);
  const vault = await deployVaultTx.deployed();
  console.log(`Vault contract deployed at ${vault.address}`);

  const ilvPoolAddress = config.ilvPoolV2;
  const lpPoolAddress = config.lpPoolV2;
  const vestingAddress = config.vesting;

  const ilvPool = await ethers.getContractAt("ILVPool", ilvPoolAddress);
  const lpPool = await ethers.getContractAt("SushiLPPool", lpPoolAddress);
  const vesting = await ethers.getContractAt("IVesting", vestingAddress);

  console.log("Setting vault in the ILV pool..");
  await ilvPool.setVault(vault.address);
  console.log("Success!");
  console.log("Setting vault in the LP pool..");
  await lpPool.setVault(vault.address);
  console.log("Success!");
  console.log("Setting vault in the vesting contract..");
  await vesting.setVaultContract(vault.address);
  console.log("Success!");

  console.log("Setting core pools in the vault..");
  await vault.setCorePools(ilvPoolAddress, lpPoolAddress, vestingAddress);
  console.log("Success!");
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
