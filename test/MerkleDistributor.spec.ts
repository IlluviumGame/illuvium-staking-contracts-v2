import chai, { expect } from "chai";
import chaiSubset from "chai-subset";
import { solidity } from "ethereum-waffle";
import { ethers, upgrades } from "hardhat";
import {
  IlluviumERC20__factory,
  EscrowedIlluvium2__factory,
  ILVPoolMock__factory,
  ILVPoolMock,
  PoolFactoryMock__factory,
  PoolFactoryMock,
  CorePoolV1Mock__factory,
  SushiLPPoolMock,
  SushiLPPoolMock__factory,
  ERC20Mock__factory,
  MerkleDistributor__factory,
  Signers,
} from "../types";

import {
  ILV_PER_SECOND,
  SECONDS_PER_UPDATE,
  INIT_TIME,
  END_TIME,
  ILV_POOL_WEIGHT,
  LP_POOL_WEIGHT,
  V1_STAKE_MAX_PERIOD,
  ONE_YEAR,
  ZERO_BYTES32,
  toWei,
  getUsers5,
  getTestBalanceTree,
} from "./utils";
import BalanceTree from "./utils/balance-tree";
import YieldTree from "./utils/yield-tree";

import {
  FEATURE_ALL,
  ROLE_TOKEN_CREATOR,
} from "./utils/ilv-features-roles";

const { AddressZero } = ethers.constants;

chai.use(solidity);
chai.use(chaiSubset);

describe("MerkleDistributor", function () {
  before(async function () {
    this.signers = {} as Signers;

    this.ILVPool = <ILVPoolMock__factory>await ethers.getContractFactory("ILVPoolMock");
    this.SushiLPPool = <SushiLPPoolMock__factory>await ethers.getContractFactory("SushiLPPoolMock");
    this.PoolFactory = <PoolFactoryMock__factory>await ethers.getContractFactory("PoolFactoryMock");
    this.CorePoolV1 = <CorePoolV1Mock__factory>await ethers.getContractFactory("CorePoolV1Mock");
    this.ERC20 = <ERC20Mock__factory>await ethers.getContractFactory("ERC20Mock");
    this.EscrowedIlluvium2 = <EscrowedIlluvium2__factory>await ethers.getContractFactory("EscrowedIlluvium2");
    this.IlluviumERC20 = <IlluviumERC20__factory>await ethers.getContractFactory("IlluviumERC20");
    this.MerkleDistributor = <MerkleDistributor__factory>await ethers.getContractFactory("MerkleDistributor");
  });

  beforeEach(async function () {
    [this.signers.deployer, this.signers.alice, this.signers.bob, this.signers.carol] = await ethers.getSigners();

    this.ilv = await this.IlluviumERC20.connect(this.signers.deployer).deploy(this.signers.deployer.address);
    this.silv = await this.EscrowedIlluvium2.connect(this.signers.deployer).deploy();
    this.lp = await this.ERC20.connect(this.signers.deployer).deploy(
      "Sushiswap ILV/ETH LP",
      "SLP",
      ethers.utils.parseEther("100000"),
    );

    this.factory = (await upgrades.deployProxy(
      this.PoolFactory,
      [this.ilv.address, this.silv.address, ILV_PER_SECOND, SECONDS_PER_UPDATE, INIT_TIME, END_TIME],
      { kind: "uups" },
    )) as PoolFactoryMock;

    await this.ilv.updateFeatures(FEATURE_ALL);
    await this.ilv.updateRole(this.factory.address, ROLE_TOKEN_CREATOR);
    await this.silv.updateRole(this.factory.address, ROLE_TOKEN_CREATOR);

    this.ilvPoolV1 = await this.CorePoolV1.connect(this.signers.deployer).deploy(this.ilv.address);
    this.lpPoolV1 = await this.CorePoolV1.connect(this.signers.deployer).deploy(this.lp.address);

    this.ilvPool = (await upgrades.deployProxy(
      this.ILVPool,
      [
        this.ilv.address,
        this.silv.address,
        this.ilv.address,
        this.factory.address,
        INIT_TIME,
        ILV_POOL_WEIGHT,
        this.ilvPoolV1.address,
        V1_STAKE_MAX_PERIOD,
      ],
      { kind: "uups" },
    )) as ILVPoolMock;

    this.lpPool = (await upgrades.deployProxy(
      this.SushiLPPool,
      [
        this.ilv.address,
        this.silv.address,
        this.lp.address,
        this.factory.address,
        INIT_TIME,
        LP_POOL_WEIGHT,
        this.lpPoolV1.address,
        V1_STAKE_MAX_PERIOD,
      ],
      { kind: "uups" },
    )) as SushiLPPoolMock;

    await this.factory.connect(this.signers.deployer).registerPool(this.ilvPool.address);
    await this.factory.connect(this.signers.deployer).registerPool(this.lpPool.address);
    
    // also register the Merkle Distributor
    this.balanceTree = getTestBalanceTree(this.signers.alice, this.signers.bob, this.signers.carol);
    this.merkleDistributor = await this.MerkleDistributor.connect(this.signers.deployer)
      .deploy(this.factory.address, this.ilvPool.address, this.ilvPool.address, this.balanceTree.getHexRoot());
    await this.factory.connect(this.signers.deployer).registerPool(this.merkleDistributor.address);
  });

  describe("deployment", function () {
    it("returns the expected merkle root", async function () {
      const expectedRoot = this.balanceTree.getHexRoot();
      const merkleRoot = await this.merkleDistributor.merkleRoot();
      expect(expectedRoot).to.be.equal(merkleRoot);
    });

    it("reverts when passing zero values to the constructor", async  () => {
      const [deployer] = await ethers.getSigners();
      const balanceTree = new BalanceTree([{ account: deployer.address, amount: toWei(0) }]);
      const PoolFactory = <PoolFactoryMock__factory>await ethers.getContractFactory("PoolFactoryMock");
      const MerkleDistributor = <MerkleDistributor__factory>await ethers.getContractFactory("MerkleDistributor");
      const IlluviumERC20 = <IlluviumERC20__factory>await ethers.getContractFactory("IlluviumERC20");
      const EscrowedIlluvium2 = <EscrowedIlluvium2__factory>await ethers.getContractFactory("EscrowedIlluvium2");
      const ilv = await IlluviumERC20.connect(deployer).deploy(deployer.address);
      const silv = await EscrowedIlluvium2.connect(deployer).deploy();
      const factory = (await upgrades.deployProxy(
        PoolFactory,
        [ilv.address, silv.address, ILV_PER_SECOND, SECONDS_PER_UPDATE, INIT_TIME, END_TIME],
        { kind: "uups" },
      )) as PoolFactoryMock;

      await expect(MerkleDistributor.connect(deployer)
        .deploy(factory.address, AddressZero, ilv.address, balanceTree.getHexRoot()))
        .to.be.revertedWith("ZeroAddress()");

      await expect(MerkleDistributor.connect(deployer)
        .deploy(factory.address, ilv.address, AddressZero, balanceTree.getHexRoot()))
        .to.be.revertedWith("ZeroAddress()");

      await expect(MerkleDistributor.connect(deployer)
        .deploy(factory.address, ilv.address, ilv.address, ZERO_BYTES32))
        .to.be.revertedWith("ZeroBytes()");
    })
  });

  describe("factory controller features", function () {
    it("should allow factory controller to change the merkle root", async function () {
      const balanceTree = new BalanceTree([{ account: this.signers.bob.address, amount: toWei(0) }]);
      await this.merkleDistributor.connect(this.signers.deployer).setMerkleRoot(balanceTree.getHexRoot());
    });

    it("reverts when setting merkle root as zero value", async function () {
      await expect(this.merkleDistributor.connect(this.signers.deployer).setMerkleRoot(ZERO_BYTES32))
        .to.be.revertedWith("ZeroBytes()");
    });

    it("reverts when setting merkle root as non factory controller", async function () {
      const balanceTree = new BalanceTree([{ account: this.signers.bob.address, amount: toWei(0) }]);
      await expect(this.merkleDistributor.connect(this.signers.alice).setMerkleRoot(balanceTree.getHexRoot()))
        .to.be.revertedWith("NotFactoryController()");
    });

    it("should allow the factory controller to pause and upause the contract", async function () {
      await this.merkleDistributor.connect(this.signers.deployer).pause(true);
      expect(await this.merkleDistributor.isPaused()).to.equal(true);
      await expect(this.merkleDistributor.connect(this.signers.deployer).pause(true))
        .to.be.revertedWith("AlreadyPaused()");
      await this.merkleDistributor.connect(this.signers.deployer).pause(false);
      expect(await this.merkleDistributor.isPaused()).to.equal(false);
      await expect(this.merkleDistributor.connect(this.signers.deployer).pause(false))
        .to.be.revertedWith("AlreadyPaused()");
    });

    it("reverts when pausing or unpausing the contract as non factory controller", async function () {
      await expect(this.merkleDistributor.connect(this.signers.alice).pause(true))
        .to.be.revertedWith("NotFactoryController()");
    });
  });

  describe("basic claiming scenarios", function () {
    it("should claim and stake in one transaction", async function () {
      const claimAmount = toWei(2_000);
  
      // claim ILV
      const aliceProof = this.balanceTree.getProof(0, this.signers.alice.address, claimAmount);
      await this.merkleDistributor.connect(this.signers.alice).claim(0, claimAmount, aliceProof);
  
      // check the stakes
      const stakesLength = await this.ilvPool.getStakesLength(this.signers.alice.address);
      const stake = await this.ilvPool.getStake(this.signers.alice.address, 0);
  
      expect(stakesLength).to.equal(1);
      expect(stake.value).to.equal(claimAmount);
      expect(stake.lockedUntil).to.equal(ONE_YEAR);
      expect(stake.isYield).to.equal(true);
  
      // wait for the stake to unlock
      await this.ilvPool.setNow256(ONE_YEAR + 1);
  
      // record before unstake values
      const balance0 = await this.ilvPool.balanceOf(this.signers.alice.address);
      const { value: value0 } = await this.ilvPool.getStake(this.signers.alice.address, 0);
      const { totalWeight: totalWeight0 } = await this.ilvPool.users(this.signers.alice.address);
      const globalWeight0 = await this.ilvPool.globalWeight();
  
      // unstake
      await this.ilvPool.connect(this.signers.alice).unstake(0, claimAmount);
  
      // record after unstake values
      const balance1 = await this.ilvPool.balanceOf(this.signers.alice.address);
      const { value: value1 } = await this.ilvPool.getStake(this.signers.alice.address, 0);
      const { totalWeight: totalWeight1 } = await this.ilvPool.users(this.signers.alice.address);
      const globalWeight1 = await this.ilvPool.globalWeight();
  
      // and check before and after values
      expect(balance0).to.be.equal(claimAmount);
      expect(value0).to.be.equal(claimAmount);
      expect(totalWeight0).to.be.equal(toWei(4_000e6));
      expect(totalWeight0).to.be.equal(globalWeight0);
      expect(balance1).to.be.equal(0);
      expect(value1).to.be.equal(0);
      expect(totalWeight1).to.be.equal(0);
      expect(totalWeight1).to.be.equal(globalWeight1);
    });

    it("should set isClaimed after a claim", async function () {
      const claimAmount = toWei(2_000);
      const aliceProof = this.balanceTree.getProof(0, this.signers.alice.address, claimAmount);
      await this.merkleDistributor.connect(this.signers.alice).claim(0, claimAmount, aliceProof);
      expect(await this.merkleDistributor.isClaimed(0)).to.equal(true);
    });

    it("reverts when trying to claim twice on the same index", async function () {
      const claimAmount = toWei(2_000);
      const aliceProof = this.balanceTree.getProof(0, this.signers.alice.address, claimAmount);
      await this.merkleDistributor.connect(this.signers.alice).claim(0, claimAmount, aliceProof);
      await expect(this.merkleDistributor.connect(this.signers.alice).claim(0, claimAmount, aliceProof))
        .to.be.revertedWith("AlreadyClaimed()");
    });

    it("reverts when trying to claim with invalid proof", async function () {
      const claimAmount = toWei(10_000); // we use bob's proof merkle, but alice as the signer
      const aliceProof = this.balanceTree.getProof(1, this.signers.bob.address, claimAmount);
      await expect(this.merkleDistributor.connect(this.signers.alice).claim(1, claimAmount, aliceProof))
        .to.be.revertedWith("InvalidProof()");
    });

    it("reverts when trying to claim as another wallet", async function () {
      const claimAmount = toWei(2_000);
      const aliceProof = this.balanceTree.getProof(0, this.signers.alice.address, claimAmount);
      await expect(this.merkleDistributor.connect(this.signers.bob).claim(0, claimAmount, aliceProof))
        .to.be.revertedWith("InvalidProof()");
    });

    it("reverts when trying to claim more than allowed", async function () {
      const aliceProof = this.balanceTree.getProof(0, this.signers.alice.address, toWei(2_000));
      await expect(this.merkleDistributor.connect(this.signers.alice).claim(0, toWei(2_000 + 1), aliceProof))
        .to.be.revertedWith("InvalidProof()");
    });

    it("reverts when claiming on paused contract", async function () {
      await this.merkleDistributor.connect(this.signers.deployer).pause(true);
      const claimAmount = toWei(2_000);
      const aliceProof = this.balanceTree.getProof(0, this.signers.alice.address, claimAmount);
      await expect(this.merkleDistributor.connect(this.signers.alice).claim(0, claimAmount, aliceProof))
        .to.be.revertedWith("IsPaused()");
    });
  });

  describe("advanced claiming scenarios", function () {
    beforeEach(async function () {
      await this.ilv.connect(this.signers.deployer).transfer(this.signers.alice.address, toWei(10_000));
      await this.ilv.connect(this.signers.deployer).transfer(this.signers.bob.address, toWei(10_000));
      await this.ilv.connect(this.signers.deployer).transfer(this.signers.carol.address, toWei(10_000));

      const users = getUsers5([this.signers.alice.address, this.signers.bob.address, this.signers.carol.address]);

      await this.ilvPoolV1.setUsers(users);

      this.tree = new YieldTree([
        {
          account: this.signers.alice.address,
          weight: toWei(2_000),
          pendingV1Rewards: toWei(1_000),
        },
        {
          account: this.signers.bob.address,
          weight: toWei(2_000),
          pendingV1Rewards: toWei(1_000),
        },
        {
          account: this.signers.carol.address,
          weight: toWei(2_000),
          pendingV1Rewards: toWei(3_000),
        },
      ]);
      await this.ilvPool.connect(this.signers.deployer).setMerkleRoot(this.tree.getHexRoot());
    })

    it("should calculate rewards correctly with many ILV pool stakes including one claimed", async function () {
      const stakeAmount = toWei(1_000);

      await this.ilv.connect(this.signers.alice).approve(this.ilvPool.address, stakeAmount);
      await this.ilvPool.connect(this.signers.alice).stake(stakeAmount, ONE_YEAR);

      await this.ilv.connect(this.signers.alice).approve(this.ilvPool.address, stakeAmount);
      await this.ilvPool.connect(this.signers.alice).stake(stakeAmount, ONE_YEAR);

      const claimAmount = toWei(2_000);

      const balanceProof = this.balanceTree.getProof(0, this.signers.alice.address, claimAmount);
      await this.merkleDistributor.connect(this.signers.alice).claim(0, claimAmount, balanceProof);

      const secondsDifference = 10;

      await this.ilvPool.setNow256(INIT_TIME + secondsDifference);
      await this.factory.setNow256(INIT_TIME + secondsDifference);

      const totalWeight = await this.factory.totalWeight();
      const poolWeight = await this.ilvPool.weight();

      const expectedRewards = secondsDifference * Number(ILV_PER_SECOND) * (poolWeight / totalWeight);
      const { pendingYield } = await this.ilvPool.pendingRewards(this.signers.alice.address);
      expect(expectedRewards).to.be.equal(Number(pendingYield));
    });

    it("should calculate rewards correctly with many staking wallets", async function () {
      const stakeAmount = toWei(3_000);

      await this.ilv.connect(this.signers.bob).approve(this.ilvPool.address, stakeAmount);
      await this.ilvPool.connect(this.signers.bob).stake(stakeAmount, ONE_YEAR);

      await this.ilv.connect(this.signers.carol).approve(this.ilvPool.address, stakeAmount);
      await this.ilvPool.connect(this.signers.carol).stake(stakeAmount, ONE_YEAR);

      const claimAmount = toWei(2_000);

      const balanceProof = this.balanceTree.getProof(0, this.signers.alice.address, claimAmount);
      await this.merkleDistributor.connect(this.signers.alice).claim(0, claimAmount, balanceProof);

      const secondsDifference = 10;

      await this.ilvPool.setNow256(INIT_TIME + secondsDifference);
      await this.factory.setNow256(INIT_TIME + secondsDifference);

      const totalWeight = await this.factory.totalWeight();
      const poolWeight = await this.ilvPool.weight();

      const expectedRewardsAlice = secondsDifference * Number(ILV_PER_SECOND) * (poolWeight / totalWeight) * 0.25;
      const expectedRewardsBob = secondsDifference * Number(ILV_PER_SECOND) * (poolWeight / totalWeight) * 0.375;
      const expectedRewardsCarol = secondsDifference * Number(ILV_PER_SECOND) * (poolWeight / totalWeight) * 0.375;

      const { pendingYield: pendingYieldAlice } = await this.ilvPool.pendingRewards(this.signers.alice.address);
      const { pendingYield: pendingYieldBob } = await this.ilvPool.pendingRewards(this.signers.bob.address);
      const { pendingYield: pendingYieldCarol } = await this.ilvPool.pendingRewards(this.signers.carol.address);

      expect(expectedRewardsAlice).to.be.equal(Number(pendingYieldAlice));
      expect(expectedRewardsBob).to.be.equal(Number(pendingYieldBob));
      expect(expectedRewardsCarol).to.be.equal(Number(pendingYieldCarol));
    });

    it("should calculate the same rewards for different wallets using stake, claim and v1", async function () {
      // alice migrates from v1 and then claims
      const aliceYieldProof = this.tree.getProof(0, this.signers.alice.address, toWei(2_000), toWei(1_000));
      await this.ilvPool.connect(this.signers.alice)
        .executeMigration(aliceYieldProof, 0, toWei(2_000), toWei(1_000), false, [0, 2]);

      const claimAmount = toWei(2_000);

      const balanceProof = this.balanceTree.getProof(0, this.signers.alice.address, claimAmount);
      await this.merkleDistributor.connect(this.signers.alice).claim(0, claimAmount, balanceProof);

      // bob also migrates from v1 but then stakes instead of claiming
      const bobYieldProof = this.tree.getProof(1, this.signers.bob.address, toWei(2_000), toWei(1_000));
      await this.ilvPool.connect(this.signers.bob)
        .executeMigration(bobYieldProof, 1, toWei(2_000), toWei(1_000), false, [0, 2]);

      const stakeAmount = toWei(2_000);

      await this.ilv.connect(this.signers.bob).approve(this.ilvPool.address, stakeAmount);
      await this.ilvPool.connect(this.signers.bob).stake(stakeAmount, ONE_YEAR);

      // carol only migrates from v1
      const carolYieldProof = this.tree.getProof(2, this.signers.carol.address, toWei(2_000), toWei(3_000));
      await this.ilvPool.connect(this.signers.carol)
        .executeMigration(carolYieldProof, 2, toWei(2_000), toWei(3_000), false, [0, 2]);

      // and we then compare both pending (locked) rewards
      const secondsDifference1 = 10;

      await this.ilvPool.setNow256(INIT_TIME + secondsDifference1);
      await this.factory.setNow256(INIT_TIME + secondsDifference1);

      const { pendingYield: alicePendingYield1 } = await this.ilvPool.pendingRewards(this.signers.alice.address);
      const { pendingYield: bobPendingYield1 } = await this.ilvPool.pendingRewards(this.signers.bob.address);
      const { pendingYield: carolPendingYield1 } = await this.ilvPool.pendingRewards(this.signers.carol.address);
      expect(alicePendingYield1).to.be.equal(bobPendingYield1);
      expect(bobPendingYield1).to.be.equal(carolPendingYield1);

      // compare again after stakes are not locked anymore
      const secondsDifference2 = ONE_YEAR + 10;

      await this.ilvPool.setNow256(INIT_TIME + secondsDifference2);
      await this.factory.setNow256(INIT_TIME + secondsDifference2);

      const { pendingYield: alicePendingYield2 } = await this.ilvPool.pendingRewards(this.signers.alice.address);
      const { pendingYield: bobPendingYield2 } = await this.ilvPool.pendingRewards(this.signers.bob.address);
      const { pendingYield: carolPendingYield2 } = await this.ilvPool.pendingRewards(this.signers.bob.address);
      expect(alicePendingYield2).to.be.equal(bobPendingYield2);
      expect(bobPendingYield2).to.be.equal(carolPendingYield2);
    });
  });
});
