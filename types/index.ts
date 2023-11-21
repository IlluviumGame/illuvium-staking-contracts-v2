import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

export {
  IlluviumERC20,
  IlluviumERC20__factory,
  EscrowedIlluvium2,
  EscrowedIlluvium2__factory,
  ILVPoolMock__factory,
  ILVPoolUpgrade__factory,
  ILVPoolMock,
  ILVPoolUpgrade,
  SushiLPPoolMock__factory,
  SushiLPPoolUpgrade__factory,
  SushiLPPoolMock,
  SushiLPPoolUpgrade,
  FlashPoolMock__factory,
  FlashPoolUpgrade__factory,
  FlashPoolMock,
  FlashPoolUpgrade,
  PoolFactoryMock__factory,
  PoolFactoryUpgrade__factory,
  PoolFactoryMock,
  PoolFactoryUpgrade,
  Vault__factory,
  Vault,
  WETHMock__factory,
  WETHMock,
  ERC20Mock__factory,
  ERC20Mock,
  CorePoolV1Mock__factory,
  CorePoolV1Mock,
  MerkleDistributor__factory,
  MerkleDistributor,
} from "../typechain";

export interface Signers {
  deployer: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  carol: SignerWithAddress;
}
