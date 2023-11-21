// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

interface IVesting {
    function setVaultContract(address _vault) external;

    function vault() external view returns (address);
}
