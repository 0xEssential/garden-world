// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {System} from "@latticexyz/world/src/System.sol";
import {Projects, ProjectsData, Plants, PlantsData} from "../codegen/Tables.sol";
import {PlantLifecycleStage} from "../codegen/Types.sol";
import {IForwardRequest} from "@xessential/contracts/fwd/IForwardRequest.sol";
import {PlantSpeciesERC721} from "../PlantSpeciesERC721.sol";
import "../IRandomizer.sol";

interface ArbSys {
    /**
     * @notice Get Arbitrum block number (distinct from L1 block number; Arbitrum genesis block has block number 0)
     * @return block number as int
     */
    function arbBlockNumber() external view returns (uint256);
}

contract PlantSystem is System {
    struct PackedData {
        uint16 chainId;
        uint256 tokenId;
        address contractAddress;
        address sender;
    }

    mapping(uint256 => bytes) internal randomizerRequests;
    IRandomizer public randomizer = IRandomizer(0x923096Da90a3b60eb7E12723fA2E1547BA9236Bc);

    function _msgNFT() internal pure returns (IForwardRequest.NFT memory) {
        uint256 chainId;
        uint256 tokenId;
        address contractAddress;

        assembly {
            chainId := calldataload(sub(calldatasize(), 124)) // 32 + 32 + 20 + 20
            tokenId := calldataload(sub(calldatasize(), 92)) // 32 + 20 + 20
            contractAddress := shr(0x60, calldataload(sub(calldatasize(), 60))) // 20 + 20-byte address
        }

        return IForwardRequest.NFT({contractAddress: contractAddress, tokenId: tokenId, chainId: chainId});
    }

    function _sender() internal pure returns (address unknown, address sender) {
        assembly {
            unknown := shr(0x60, calldataload(sub(calldatasize(), 40))) // 20-byte address
            sender := shr(0x60, calldataload(sub(calldatasize(), 20))) // 20-byte address
        }
    }

    function plantSeed(uint8 plot) public {
        IForwardRequest.NFT memory data = _msgNFT();

        string memory ipfsHash = Projects.getIpfsHash(bytes32(uint256(uint160(address(data.contractAddress)))));

        // if (p.contractAddress == address(0)) {
        //     revert("Project not registered");
        // }

        Plants.set(
            uint32(block.chainid),
            data.contractAddress,
            data.tokenId,
            uint32(block.chainid),
            data.contractAddress,
            data.tokenId,
            _msgSender(),
            plot,
            ArbSys(address(100)).arbBlockNumber(),
            ArbSys(address(100)).arbBlockNumber(),
            0,
            PlantLifecycleStage.SEEDLING,
            ipfsHash
        );
    }

    function water() public {
        IForwardRequest.NFT memory nft = _msgNFT();
        PlantsData memory p = Plants.get(uint32(nft.chainId), nft.contractAddress, nft.tokenId);
        if (_dead(p)) {
            return compost();
        }

        if (!_waterable(p)) {
            revert("Plant not waterable");
        }

        if (uint256(p.lifecycleStage) < uint256(PlantLifecycleStage.COMMON_FLOWER)) {
            uint256 ev = _wateringsUntilEvolve(p);
            if (ev == 0) {
                Plants.setLifecycleStage(p.chainId, p.contractAddress, p.tokenId, _newStage(p));
            }
            if (p.lifecycleStage == PlantLifecycleStage.BUD && ev == 1) {
                requestRandom(p.chainId, p.contractAddress, p.tokenId);
            }
        }

        if (_shouldBearSeeds(p)) {
            mintSeed(p);
        }

        Plants.setWateredAt(p.chainId, p.contractAddress, p.tokenId, ArbSys(address(100)).arbBlockNumber());
    }

    function compost() public {
        IForwardRequest.NFT memory nft = _msgNFT();

        Plants.setLifecycleStage(uint32(nft.chainId), nft.contractAddress, nft.tokenId, PlantLifecycleStage.SEED);
    }

    function requestRandom(uint32 chainId, address contract_, uint256 tokenId) internal {
        if (address(randomizer) == address(0)) {
            Plants.setEntropy(chainId, contract_, tokenId, block.timestamp);
            return;
        }
        uint256 requestId = randomizer.request(50000);

        randomizerRequests[requestId] = abi.encode(chainId, contract_, tokenId);
    }

    function randomizerCallback(uint256 _id, bytes32 _value) external {
        require(msg.sender == address(randomizer), "Caller not Randomizer");

        bytes memory plantId = randomizerRequests[_id];
        delete randomizerRequests[_id];

        (uint16 chainId, address contract_, uint256 tokenId) = abi.decode(plantId, (uint16, address, uint256));
        Plants.setEntropy(chainId, contract_, tokenId, uint256(_value));
    }

    function mintSeed(PlantsData memory p) internal {
        (, bytes memory returndata) =
            p.contractAddress.call(abi.encodePacked(abi.encodeWithSignature("mintSeed()"), _msgSender()));
        // require(success, "mint failed");

        (uint256 tokenId) = abi.decode(returndata, (uint256));
        Plants.set(
            uint32(block.chainid),
            p.contractAddress,
            tokenId,
            uint32(block.chainid),
            p.contractAddress,
            tokenId,
            _msgSender(),
            0,
            0,
            0,
            p.entropy,
            PlantLifecycleStage.SEED,
            p.ipfsHash
        );
    }

    function waterable(uint16 chainId, address contract_, uint256 tokenId) public view returns (bool) {
        PlantsData memory p = Plants.get(chainId, contract_, tokenId);

        return _waterable(p);
    }

    function _waterable(PlantsData memory p) internal view returns (bool) {
        if (_dead(p)) {
            return false;
        }

        if (_hydrated(p)) {
            return false;
        }

        return true;
    }

    function _dead(PlantsData memory p) internal view returns (bool) {
        return ArbSys(address(100)).arbBlockNumber() > _waterBy(p);
    }

    function _hydrated(PlantsData memory p) internal view returns (bool) {
        uint256 blockLength = Projects.getGrowthCycleBlocks(bytes32(uint256(uint160(address(p.contractAddress)))));
        return ArbSys(address(100)).arbBlockNumber() < p.wateredAt + (blockLength * 3 / 4);
    }

    function _waterBy(PlantsData memory p) internal view returns (uint256) {
        uint256 blockLength = Projects.getGrowthCycleBlocks(bytes32(uint256(uint160(address(p.contractAddress)))));

        return p.wateredAt + blockLength;
    }

    function _wateringsUntilEvolve(PlantsData memory p) internal view returns (uint256) {
        uint256 blockLength = Projects.getGrowthCycleBlocks(bytes32(uint256(uint160(address(p.contractAddress)))));
        uint8 lifecycleLength = Projects.getLifecycleLength(bytes32(uint256(uint160(address(p.contractAddress)))));
        uint256 requiredBlocks = blockLength * lifecycleLength * uint256(p.lifecycleStage);

        if (ArbSys(address(100)).arbBlockNumber() >= p.plantedAt + requiredBlocks) {
            return 0;
        }

        uint256 wateringThreshold = (blockLength * 75) / 100; // 75% of blockLengthBlocks
        uint256 nextWateringBlock = ArbSys(address(100)).arbBlockNumber() + wateringThreshold;

        if (nextWateringBlock >= p.plantedAt + requiredBlocks) {
            return 1;
        }

        return 2; // More than 1 watering is required until the plant evolves
    }

    function _newStage(PlantsData memory p) internal pure returns (PlantLifecycleStage) {
        if (p.lifecycleStage == PlantLifecycleStage.SEEDLING) {
            uint256 rank = p.entropy % 100;

            // 50% chance to evolve to COMMON_FLOWER
            if (rank < 50) {
                return PlantLifecycleStage(uint256(p.lifecycleStage) + 1);
                // 30% chance to evolve to UNCOMMON_FLOWER
            } else if (rank < 80) {
                return PlantLifecycleStage(uint256(p.lifecycleStage) + 2);
                // 15% chance to evolve to RARE_FLOWER
            } else if (rank < 95) {
                return PlantLifecycleStage(uint256(p.lifecycleStage) + 3);
                // 5% chance to evolve to EPIC_FLOWER
            } else {
                return PlantLifecycleStage(uint256(p.lifecycleStage) + 4);
            }
        }

        return PlantLifecycleStage(uint256(p.lifecycleStage) + 1);
    }

    function _shouldBearSeeds(PlantsData memory p) internal view returns (bool) {
        uint256 blockLength = Projects.getGrowthCycleBlocks(bytes32(uint256(uint160(address(p.contractAddress)))));
        uint8 lifecycleLength = Projects.getLifecycleLength(bytes32(uint256(uint160(address(p.contractAddress)))));
        uint256 requiredBlocks = blockLength * lifecycleLength * 50;
        return ArbSys(address(100)).arbBlockNumber() >= p.plantedAt + requiredBlocks;
    }

    function lifecyleStage(uint16 chainId, address contract_, uint256 tokenId)
        public
        view
        returns (PlantLifecycleStage)
    {
        PlantsData memory p = Plants.get(chainId, contract_, tokenId);

        // TODO: calculcate this based on block number
        return p.lifecycleStage;
    }

    function bytesToHexString(bytes memory data) public pure returns (string memory) {
        bytes memory hexString = new bytes(data.length * 2);
        bytes memory alphabet = "0123456789abcdef";

        for (uint256 i = 0; i < data.length; i++) {
            uint8 byteVal = uint8(data[i]);
            hexString[i * 2] = alphabet[byteVal / 16];
            hexString[i * 2 + 1] = alphabet[byteVal % 16];
        }

        return string(abi.encodePacked("0x", hexString));
    }
}
