// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/* Autogenerated file. Do not edit manually. */

interface ISpeciesSystem {
  function deploySpecies(
    string calldata ipfsRootHash,
    string calldata symbol,
    string calldata name,
    uint256 mintPrice,
    uint32 growthCycleBlocks,
    uint8 lifecycleLength
  ) external;

  function reassign(uint256 tokenId, address newOwner) external;

  function mintSpecies(address contract_, uint256 count) external payable;
}
