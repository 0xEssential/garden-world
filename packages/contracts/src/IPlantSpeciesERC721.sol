// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IPlantSpeciesERC721  {
    
    function tokenURI(uint256) external view  returns (string memory);

    function mint() external payable;

    function owner() external view returns (address);
    
}
