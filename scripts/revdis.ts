import { ethers, upgrades } from "hardhat";

import { Vault } from "../typechain";

import YieldTree from "../test/utils/yield-tree";
import { toWei } from "../test/utils";

import { abi as routerAbi, bytecode as routerBytecode } from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import { config } from "./config/index";

import rinkebyData from "./data/weight_data_rinkeby_v1.json";

const { parseEther, formatEther } = ethers.utils;
const { MaxUint256 } = ethers.constants;

async function main(): Promise<void> {
  const vault = <Vault>await ethers.getContractAt("Vault", "0xa38d7Ca1311E982825B347F7A10E9e51083dda41");
  const sushiRouter = await ethers.getContractAt(routerAbi, config.router);
  const ethIn = ethers.utils.parseEther("100");
  const deployer = await ethers.provider.getSigner(0);
  console.log(`Connected to vault ${vault.address}`);
  console.log("Sending ether to the vault..");
  const tx = await deployer.sendTransaction({ to: vault.address, value: ethIn });
  await tx.wait();
  console.log("Ether received by the vault!");

  const [, ilvOut] = await sushiRouter.getAmountsOut(ethIn, [config.weth, config.ilv]);
  console.log("Swapping vault ETH balance for ILV..");
  const tx0 = await vault.swapETHForILV(ethIn, ilvOut, MaxUint256);
  await tx0.wait();
  console.log(`Purchased ${formatEther(ilvOut)} ILV`);
  console.log("Sending ILV rewards to pools..");
  const tx1 = await vault.sendILVRewards(0, 0, 0);
  await tx1.wait();
  console.log("The revenue distribution process has been successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
