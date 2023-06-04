// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {ERC721} from "@solmate/tokens/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {WorldContext} from "@latticexyz/world/src/WorldContext.sol";
import {IWorld} from "./codegen/world/IWorld.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

contract PlantSpeciesERC721 is ERC721, Ownable {
    address public constant MARKETPLACE = 0xc0F5b93Bb77271d9CE898d08013f4958d1478534;
    address public gardenWorld;

    uint256 public mintPrice = 0.01 ether;
    string internal _baseUri;
    uint256 internal nextId;

    constructor(uint256 mintPrice_, string memory name_, string memory symbol_, string memory baseUri_)
        ERC721(name_, symbol_)
    {
        _baseUri = baseUri_;
        mintPrice = mintPrice_;
        gardenWorld = msg.sender;
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return _baseUri;
    }

    function mint(uint256 count) external payable returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            nextId += 1;
            _mint(_msgSender(), nextId);
            tokenIds[i] = nextId;
        }
        return tokenIds;
    }

    function mintSeed() external returns (uint256) {
        require(msg.sender == gardenWorld, "Only garden world can mint seeds");
        nextId += 1;
        _mint(_msgSender(), nextId);
        return nextId;
    }

    function transferFrom(address from, address to, uint256 id) public override {
        IWorld(gardenWorld).reassign(id, to);
        super.transferFrom(from, to, id);
    }

    function withdraw() external {
        uint256 contractBalance = address(this).balance;
        uint256 marketplaceShare = (contractBalance * 2) / 100;
        uint256 ownerShare = contractBalance - marketplaceShare;

        payable(MARKETPLACE).transfer(marketplaceShare);
        payable(owner()).transfer(ownerShare);
    }

    function _msgSender() internal view override(Context) returns (address sender) {
        assembly {
            // 96 = 256 - 20 * 8
            sender := shr(96, calldataload(sub(calldatasize(), 20)))
        }
        if (sender == address(0)) sender = msg.sender;
    }
}
