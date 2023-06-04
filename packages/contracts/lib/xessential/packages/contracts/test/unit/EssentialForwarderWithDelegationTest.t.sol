// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {Counter} from "contracts/test/Counter.sol";
import {SigUtils} from "./utils/SigUtils.sol";
import {EssentialForwarder} from "contracts/fwd/EssentialForwarder.sol";
import {IForwardRequest} from "contracts/fwd/IForwardRequest.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "forge-std/console.sol";

// TODO: Deploy delegation registry, delegate permission,
// assert that Forwarder still works when msg signed by delegate
// but using vault NFT

contract EssentialForwarderWithDelegationTest is Test {
    Counter internal counter;
    EssentialForwarder internal forwarder;
    SigUtils internal sigUtils;

    uint256 internal eoaPrivateKey;
    address public eoa;
    uint256 eoaNonce;

    uint256 internal ownershipSignerPrivateKey;
    address internal ownershipSigner;
    string[] internal urls;

    function metaTx(bytes memory func) internal {
        bytes memory encodedFunc = abi.encode(keccak256(func));
        
        IForwardRequest.ERC721ForwardRequest memory req = sigUtils.buildRequest(encodedFunc, eoa, eoa);

        bytes memory sig = sigUtils.signRequest(req);
        bytes memory data = abi.encode(block.timestamp, req, sig);
        bytes memory response = sigUtils.mockOwnershipSig(req);

        forwarder.executeWithProof(response, data);
    }

    function setUp() public {
        eoaPrivateKey = 0xC11CE;
        eoa = vm.addr(eoaPrivateKey);

        ownershipSignerPrivateKey = 0xB12CE;
        ownershipSigner = vm.addr(ownershipSignerPrivateKey);

        forwarder = new EssentialForwarder();
        counter = new Counter(address(forwarder));
        sigUtils = new SigUtils(
            forwarder._domainSeparatorV4(),
            forwarder, 
            address(counter),
            ownershipSignerPrivateKey,
            eoaPrivateKey
        );

        vm.prank(0x2cE6BD653220436eB8f35E146B0Dd1a6013E97a7);
        forwarder.setOwnershipSigner(ownershipSigner);
    }

    // We use EIP-3668 OffchainLookup for trust-minimized cross-chain token gating.
    // The forwarding contract will revert with an OffchainLookup error in the
    // "happy path" - the revert is expected and has params we may want to assert
    function testFailIncrement() public {
        IForwardRequest.ERC721ForwardRequest memory request = sigUtils.buildRequest(
            abi.encode(keccak256("increment()")),
            eoa,
            eoa
        );

        bytes memory sig = sigUtils.signRequest(request);

        bytes memory callData = abi.encode(
            request.from,
            request.authorizer,
            request.nonce,
            request.nftChainId,
            request.nftContract,
            request.nftTokenId,
            block.chainid,
            block.timestamp
        );

        vm.expectRevert(
            abi.encodeWithSignature(
                "OffchainLookup(address,string[],bytes,bytes4,bytes)",
                eoa,
                urls,
                callData,
                EssentialForwarder.executeWithProof.selector,
                abi.encode(block.timestamp, request, sig)
            )
        );

        forwarder.preflight(request, sig);
    }

    // If we know that EssentialForwarder#preflight reverts with OffchainLookup,
    // we can unit test EssentialForwarder#executeWithProof by mocking out the
    // signature that our API would normally provide.
    function testForwardedIncrement() public {
        metaTx('increment()');
        uint256 count = counter.count(eoa);
        assertEq(count, 1);
    }
}
