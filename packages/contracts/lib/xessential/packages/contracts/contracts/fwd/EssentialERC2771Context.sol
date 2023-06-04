// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "./IForwardRequest.sol";

/**
 * @dev Context variant with ERC2771 support.
 */
abstract contract EssentialERC2771Context is Context {
    address private _trustedForwarder;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "403");
        _;
    }

    modifier onlyForwarder() {
        require(isTrustedForwarder(msg.sender), "Counter:429");
        _;
    }

    constructor(address trustedForwarder) {
        owner = msg.sender;
        _trustedForwarder = trustedForwarder;
    }

    function setTrustedForwarder(address trustedForwarder) external onlyOwner {
        _trustedForwarder = trustedForwarder;
    }

    function isTrustedForwarder(address forwarder) public view virtual returns (bool) {
        return forwarder == _trustedForwarder;
    }

    function _msgSender() internal view virtual override returns (address sender) {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            assembly {
                sender := shr(0x60, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 72];
        } else {
            return super._msgData();
        }
    }

    function _msgNFT() internal view returns (IForwardRequest.NFT memory) {
        uint256 chainId;
        uint256 tokenId;
        address contractAddress;
        // if (isTrustedForwarder(msg.sender)) {
        assembly {
            chainId := calldataload(sub(calldatasize(), 104))
            contractAddress := shr(0x60, calldataload(sub(calldatasize(), 40)))
            tokenId := calldataload(sub(calldatasize(), 72))
        }
        // }

        return IForwardRequest.NFT({contractAddress: contractAddress, tokenId: tokenId, chainId: chainId});
    }
}
