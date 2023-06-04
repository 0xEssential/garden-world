//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./IForwardRequest.sol";
import "./EssentialEIP712Base.sol" as EssentialEIP712Base;

/// @title SignedOwnershipProof
/// @author Sammy Bauch
/// @dev Based on SignedAllowance by Simon Fremaux (@dievardump)
/// see https://github.com/dievardump/signed-minting

contract SignedOwnershipProof {
    using ECDSA for bytes32;

    // address used to sign proof of ownership
    address private _ownershipSigner;

    /// @notice Construct message that _ownershipSigner must sign as ownership proof
    /// @dev The RPC server uses this view function to create the ownership proof
    /// @param signer the address that currently owns the L1 NFT
    /// @param authorizer the address that currently owns the L1 NFT
    /// @param nonce the meta-transaction nonce for account
    /// @param nftChainId the chainId for the nftContract
    /// @param nftContract the contract address for the NFT being utilized
    /// @param tokenId the tokenId from nftContract for the NFT being utilized
    /// @param timestamp the timestamp from the OffchainLookup error
    /// @return the message _ownershipSigner should sign
    function createMessage(
        address signer,
        address authorizer,
        uint256 nonce,
        uint256 nftChainId,
        address nftContract,
        uint256 tokenId,
        uint256 timestamp
    ) public view returns (bytes32) {
        return
            keccak256(
                abi.encode(signer, authorizer, nonce, nftChainId, nftContract, tokenId, block.chainid, timestamp)
            );
    }

    /// @notice Verify signed OffchainLookup proof against meta-tx request data
    /// @dev Ensures that _ownershipSigner signed a message containing (nftOwner OR authorized address, nonce, nftContract, tokenId)
    /// @param req structured data submitted by EOA making a meta-transaction request
    /// @param signature the signature proof created by the ownership signer EOA
    function verifyOwnershipProof(
        IForwardRequest.ERC721ForwardRequest memory req,
        bytes memory signature,
        uint256 timestamp
    ) public view returns (bool) {
        // TODO: what are the drift requirements here?
        require(block.timestamp - timestamp < 10 minutes, "Stale");

        bytes32 message = createMessage(
            req.from,
            req.authorizer,
            req.nonce,
            req.nftChainId,
            req.nftContract,
            req.nftTokenId,
            timestamp
        ).toEthSignedMessageHash();

        return message.recover(signature) == _ownershipSigner;
    }

    /// @notice Get ownershipSigner address
    /// @return the ownership proof signer address
    function ownershipSigner() public view returns (address) {
        return _ownershipSigner;
    }

    /// @dev This signer should hold no assets and is only used for signing L1 ownership proofs.
    /// @param newSigner the new signer's public address
    function _setOwnershipSigner(address newSigner) internal {
        _ownershipSigner = newSigner;
    }
}
