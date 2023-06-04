// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IForwardRequest} from "contracts/fwd/IForwardRequest.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EssentialForwarder} from "contracts/fwd/EssentialForwarder.sol";
import "forge-std/Test.sol";

contract SigUtils is Test {
    using ECDSA for bytes32;
    bytes32 internal DOMAIN_SEPARATOR;
    EssentialForwarder internal forwarder;
    address internal implementationContract;
    uint256 internal nonce;
    uint256 internal ownershipSignerPrivateKey;
    uint256 internal eoaPrivateKey;

    constructor(
        bytes32 _DOMAIN_SEPARATOR,
        EssentialForwarder _forwarder,
        address _implementationContract,
        uint256 _ownershipSignerPrivateKey,
        uint256 _eoaPrivateKey
    ) {
        DOMAIN_SEPARATOR = _DOMAIN_SEPARATOR;
        forwarder = _forwarder;
        implementationContract = _implementationContract;
        ownershipSignerPrivateKey = _ownershipSignerPrivateKey;
        eoaPrivateKey = _eoaPrivateKey;
    }

    bytes32 public constant ERC721_TYPEHASH =
        keccak256(
            "ForwardRequest(address to,address from,address authorizer,address nftContract,uint256 nonce,uint256 nftChainId,uint256 nftTokenId,uint256 targetChainId,bytes data)"
        );

    // computes the hash of the fully encoded EIP-712 message for the domain, which can be used to recover the signer
    function getTypedDataHash(IForwardRequest.ERC721ForwardRequest memory req) public view returns (bytes32) {
        return
            ECDSA.toTypedDataHash(
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        ERC721_TYPEHASH,
                        req.to,
                        req.from,
                        req.authorizer,
                        req.nftContract,
                        req.nonce,
                        req.nftChainId,
                        req.nftTokenId,
                        req.targetChainId,
                        keccak256(req.data)
                    )
                )
            );
    }

    // helper for building request struct
    function buildRequest(bytes memory selector, address from, address authorizer) external returns (IForwardRequest.ERC721ForwardRequest memory req) {
        req = IForwardRequest.ERC721ForwardRequest({
            to: implementationContract,
            from: from,
            authorizer: authorizer,
            nftContract: address(42069),
            nonce: nonce,
            nftChainId: block.chainid,
            nftTokenId: nonce,
            targetChainId: block.chainid,
            value: 0,
            gas: 1e6,
            data: selector
        });

        nonce += 1;
    }

    // helper for signing request struct
    function signRequest(IForwardRequest.ERC721ForwardRequest memory request) external returns (bytes memory) {
        bytes32 digest = getTypedDataHash(request);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(eoaPrivateKey, digest);
        return abi.encodePacked(r, s, v);
    }

    // helper for mocking REST API for signing ownership
    function mockOwnershipSig(IForwardRequest.ERC721ForwardRequest memory request) external returns (bytes memory) {
        bytes32 message = forwarder
            .createMessage(
                request.from,
                request.authorizer,
                request.nonce,
                request.nftChainId,
                request.nftContract,
                request.nftTokenId,
                block.timestamp
            )
            .toEthSignedMessageHash();

        (uint8 vMock, bytes32 rMock, bytes32 sMock) = vm.sign(ownershipSignerPrivateKey, message);
        return abi.encodePacked(rMock, sMock, vMock);
    }
}
