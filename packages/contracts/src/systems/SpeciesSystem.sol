// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {System} from "@latticexyz/world/src/System.sol";
import {Projects, Plants, PlantsData, ProjectsData} from "../codegen/Tables.sol";
import {PlantSpeciesERC721} from "../PlantSpeciesERC721.sol";
import {IPlantSpeciesERC721} from "../IPlantSpeciesERC721.sol";
import {getUniqueEntity} from "@latticexyz/world/src/modules/uniqueentity/getUniqueEntity.sol";

import {PlantLifecycleStage} from "../codegen/Types.sol";

contract SpeciesSystem is System {
    function deploySpecies(
        string calldata ipfsRootHash,
        string calldata symbol,
        string calldata name,
        uint256 mintPrice,
        uint32 growthCycleBlocks,
        uint8 lifecycleLength
    ) public {
        PlantSpeciesERC721 specie = new PlantSpeciesERC721(mintPrice, name, symbol, ipfsRootHash);
        // specie.transferOwnership(_msgSender());

        Projects.set(bytes32(uint256(uint160(address(specie)))), growthCycleBlocks, lifecycleLength, name, ipfsRootHash);
    }

    function reassign(uint256 tokenId, address newOwner) external {
        Plants.setGrower(uint32(block.chainid), msg.sender, tokenId, newOwner);
    }

    function mintSpecies(address contract_, uint256 count) public payable {
        ProjectsData memory p = Projects.get(bytes32(uint256(uint160(address(contract_)))));
        require(p.lifecycleLength != 0, "Project not registered");
        uint256[] memory tokenIds = mint(contract_, count);

        for (uint256 i = 0; i < count; i++) {
            Plants.set(
                uint32(block.chainid),
                contract_,
                tokenIds[i],
                uint32(block.chainid),
                contract_,
                tokenIds[i],
                _msgSender(),
                0,
                0,
                0,
                0,
                PlantLifecycleStage.SEED,
                p.ipfsHash
            );
        }
    }

    function mint(address contract_, uint256 count) internal returns (uint256[] memory) {
        (bool success, bytes memory returndata) = contract_.call{value: msg.value}(
            abi.encodePacked(abi.encodeWithSignature("mint(uint256)", count), _msgSender())
        );
        require(success, "mint failed");

        (uint256[] memory tokenIds) = abi.decode(returndata, (uint256[]));
        return tokenIds;
    }
}
