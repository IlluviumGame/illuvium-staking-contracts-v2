import { Signers } from "./";
import BalanceTree from "../test/utils/balance-tree";
import YieldTree from "../test/utils/yield-tree";
import {
  IlluviumERC20,
  EscrowedIlluvium2,
  ILVPoolMock__factory,
  ILVPoolMock,
  SushiLPPoolMock__factory,
  SushiLPPoolMock,
  FlashPoolMock__factory,
  FlashPoolUpgrade__factory,
  FlashPoolMock,
  PoolFactoryMock__factory,
  PoolFactoryUpgrade__factory,
  PoolFactoryMock,
  Vault__factory,
  Vault,
  WETHMock__factory,
  WETHMock,
  CorePoolV1Mock__factory,
  CorePoolV1Mock,
  ERC20Mock__factory,
  ERC20Mock,
  MerkleDistributor__factory,
  MerkleDistributor,
} from ".";
import { ILVPoolUpgrade, ILVPoolUpgrade__factory, SushiLPPoolUpgrade, SushiLPPoolUpgrade__factory } from "../typechain";

declare module "mocha" {
  export interface Context {
    ILVPool: ILVPoolMock__factory;
    ILVPoolUpgrade: ILVPoolUpgrade__factory;
    SushiLPPool: SushiLPPoolMock__factory;
    SushiLPPoolUpgrade: SushiLPPoolUpgrade__factory;
    FlashPool: FlashPoolMock__factory;
    FlashPoolUpgrade: FlashPoolUpgrade__factory;
    PoolFactory: PoolFactoryMock__factory;
    PoolFactoryUpgrade: PoolFactoryUpgrade__factory;
    Vault: Vault__factory;
    WETH: WETHMock__factory;
    SushiRouter: any;
    SushiFactory: any;
    CorePoolV1: CorePoolV1Mock__factory;
    ERC20: ERC20Mock__factory;
    MerkleDistributor: MerkleDistributor__factory;
    ilvPool: ILVPoolMock | ILVPoolUpgrade;
    lpPool: SushiLPPoolMock | SushiLPPoolUpgrade;
    flashPool: FlashPoolMock;
    factory: PoolFactoryMock;
    vault: Vault;
    weth: WETHMock;
    sushiRouter: any;
    sushiFactory: any;
    ilvPoolV1: CorePoolV1Mock;
    lpPoolV1: CorePoolV1Mock;
    ilv: IlluviumERC20;
    silv: EscrowedIlluvium2;
    lp: ERC20Mock;
    flashToken: ERC20Mock;
    signers: Signers;
    tree: YieldTree;
    balanceTree: BalanceTree;
    merkleDistributor: MerkleDistributor;
  }
}
