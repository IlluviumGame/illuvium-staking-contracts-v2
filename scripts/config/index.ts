import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const toWei = (value: number): BigNumber => ethers.utils.parseEther(value.toString());

export const formatEther = (value: BigNumber): string => ethers.utils.formatUnits(BigNumber.from(value), 'ether');

// mainnet config
export const config = {
  ilv: "0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E",
  silv: "0x7E77dCb127F99ECe88230a64Db8d595F31F1b068",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  lp: "0x6a091a3406E0073C3CD6340122143009aDac0EDa",
  ilvPoolV1: "0x25121EDDf746c884ddE4619b573A7B10714E2a36",
  lpPoolV1: "0x8B4d8443a0229349A9892D4F7CbE89eF5f843F72",
  ilvPoolV2: "0x7f5f854FfB6b7701540a00C69c4AB2De2B34291D",
  lpPoolV2: "0xe98477bDc16126bB0877c6e3882e3Edd72571Cc2",
  vesting: "0x6Bd2814426f9a6abaA427D2ad3FC898D2A57aDC6",
  vault: "0xAA2E727ba59b4fEa24d0Db4e49a392Fdc3E8e778",
  factory: "0x9DcA38D109c6c69790Fb70BCfDEAF27C4394597c",
  flashToken: "0x76047802c5c73aac0e1939a55a0a0ca9c6f26552",
  router: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
  merkleDistributor: "0x800E48366b3dc4D93114246D52B98Adb48aD83CB",
  merkleDistributorRoot: "0xd340b175529489304ea0ea0635356c5bbb59df9847ae1cfec156e3b52fe4e404",
  ILV_POOL_WEIGHT: 200,
  LP_POOL_WEIGHT: 800,
  FLASH_POOL_WEIGHT: 50,
  ILV_PER_SECOND: toWei(0.0457042193584823),
  SECONDS_PER_UPDATE: 1209600,
  INIT_TIMESTAMP: 1648731600,
  V2_END_TIMESTAMP: 1719768840,
  STAKING_V1_END_TIMESTAMP: 1642660625,
  V1_DEPOSITS_GLOBAL_WEIGHT: "336816361880961519043605512385",
  V1_DEPOSITS_POOL_TOKEN_RESERVE: "201180519756803500000000",
};
