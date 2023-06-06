// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/* Autogenerated file. Do not edit manually. */

interface IPlantSystem {
  function plantSeed(uint8 plot) external;

  function water() external;

  function compost() external;

  function randomizerCallback(uint256 _id, bytes32 _value) external;

  function waterable(uint16 chainId, address contract_, uint256 tokenId) external view returns (bool);
}
