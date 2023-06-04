// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {SigUtils} from "./utils/SigUtils.sol";
import {EssentialForwarder} from "contracts/fwd/EssentialForwarder.sol";
import {IForwardRequest} from "contracts/fwd/IForwardRequest.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "forge-std/console.sol";

contract AnOnchainGameTest is Test {
    using ECDSA for bytes32;

    AnOnchainGame internal gameContract;
    EssentialForwarder internal forwarder;
    SigUtils internal sigUtils;

    uint256 internal playerPrivateKey;
    address internal player;
    uint256 internal playerNonce;

    uint256 internal player2PrivateKey;
    address internal player2;
    uint256 internal player2Nonce;

    uint256 internal ownershipSignerPrivateKey;
    address internal ownershipSigner;
    string[] internal urls;

    // AnOnchainGame.Space[] internal spaces;
    // AnOnchainGame.StartSpaces[] internal startSpaces;

    uint256[] internal adjacentSpaces;

    function setUp() public {
        forwarder = new EssentialForwarder("EssentialForwarder", urls);
        sigUtils = new SigUtils(forwarder._domainSeparatorV4());
        gameContract = new AnOnchainGame(0x9d53b0303A02fFd8ef29Ea5f03054Ef3d806c248, address(forwarder));

        playerPrivateKey = 0xC11CE;
        player = vm.addr(playerPrivateKey);

        ownershipSignerPrivateKey = 0xB12CE;
        ownershipSigner = vm.addr(ownershipSignerPrivateKey);

        forwarder.setOwnershipSigner(ownershipSigner);
    }

    // helper for building request struct
    function buildRequest(bytes memory selector) internal returns (IForwardRequest.ERC721ForwardRequest memory req) {
        req = IForwardRequest.ERC721ForwardRequest({
            to: address(gameContract),
            from: player,
            authorizer: player,
            nftContract: player,
            nonce: playerNonce,
            nftChainId: block.chainid,
            nftTokenId: 1,
            targetChainId: block.chainid,
            value: 0,
            gas: 1e6,
            data: selector
        });

        playerNonce += 1;
    }

    // helper for signing request struct
    function signRequest(IForwardRequest.ERC721ForwardRequest memory request) internal returns (bytes memory) {
        bytes32 digest = sigUtils.getTypedDataHash(request);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(playerPrivateKey, digest);
        return abi.encodePacked(r, s, v);
    }

    // helper for mocking REST API for signing ownership
    function mockOwnershipSig(IForwardRequest.ERC721ForwardRequest memory request) internal returns (bytes memory) {
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

    function metaTx(bytes memory encodedFunc) internal {
        IForwardRequest.ERC721ForwardRequest memory req = buildRequest(encodedFunc);

        bytes memory sig = signRequest(req);
        bytes memory data = abi.encode(block.timestamp, req, sig);
        bytes memory response = mockOwnershipSig(req);

        forwarder.executeWithProof(response, data);
    }

    function setMap() internal {
        string memory path = "./fixture-starts.json";
        string memory  json = vm.readFile(path);

        bytes memory spaceData = vm.parseJson(json, ".spaces");
        (AnOnchainGame.Space[] memory spaces) = abi.decode(spaceData, (AnOnchainGame.Space[]));

        bytes memory startData = vm.parseJson(json, ".teams");
        (AnOnchainGame.StartSpaces[] memory startSpaces) = abi.decode(startData, (AnOnchainGame.StartSpaces[]));
        
        gameContract.setMap(spaces,startSpaces);
    }

    function register() internal {
        metaTx(abi.encode(keccak256("register()")));
    }

    // We use EIP-3668 OffchainLookup for trust-minimized cross-chain token gating.
    // The forwarding contract will revert with an OffchainLookup error in the
    // "happy path" - the revert is expected and has params we may want to assert
    function testFailRegister() public {
        IForwardRequest.ERC721ForwardRequest memory request = buildRequest(abi.encode(keccak256("register()")));

        bytes memory sig = signRequest(request);

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
                player,
                urls,
                callData,
                EssentialForwarder.executeWithProof.selector,
                abi.encode(block.timestamp, request, sig)
            )
        );
        register();
    }

    // If we know that EssentialForwarder#preflight reverts with OffchainLookup,
    // we can unit test EssentialForwarder#executeWithProof by mocking out the
    // signature that our API would normally provide.
    function testTrustedRegister() public {
        register();

        uint256 playerCount = gameContract.playerCount();
        assertEq(playerCount, 1);

        uint256 spaceId = gameContract.playerLocation(player);
        assertEq(spaceId, 1);

        uint256 count = gameContract.playersPerTeam(1);
        assertEq(count, 1);

        uint8 team = gameContract.playerTeam(player);
        assertEq(team, 0);
    }

    function testGameStart() public {
        uint256 start = gameContract.gameStart();
        assertEq(start, block.timestamp);
    }

    function testCurrentRound() public {
        uint256 turnLength = gameContract.turnLength();
        uint256 teamCount = gameContract.teamCount();

        uint256 round = gameContract.currentRound();
        assertEq(round, 1);

        vm.warp(block.timestamp + (turnLength * teamCount));

        uint256 round2 = gameContract.currentRound();
        assertEq(round2, 2);

        vm.warp(block.timestamp + (turnLength * teamCount));

        uint256 round3 = gameContract.currentRound();
        assertEq(round3, 3);
    }

    function testCurrentTeamMove() public {
        uint256 team = gameContract.currentTeamMove();
        assertEq(team, 0);

        uint256 turnLength = gameContract.turnLength();
        vm.warp(block.timestamp + turnLength);

        uint256 team2 = gameContract.currentTeamMove();
        assertEq(team2, 1);

        vm.warp(block.timestamp + turnLength);

        uint256 team3 = gameContract.currentTeamMove();
        assertEq(team3, 2);

        vm.warp(block.timestamp + turnLength);

        uint256 team1 = gameContract.currentTeamMove();
        assertEq(team1, 0);
    }

    function testCurrentRoundStart() public {
        uint256 turnLength = gameContract.turnLength();
        uint256 teamCount = gameContract.teamCount();
        uint256 start = gameContract.gameStart();

        uint256 round1Start = gameContract.currentRoundStart();
        assertEq(round1Start, block.timestamp);

        vm.warp(block.timestamp + (turnLength * teamCount));

        uint256 round2Start = gameContract.currentRoundStart();
        assertEq(round2Start, start + (turnLength * teamCount));
    }

    function testSetMap() public {
        uint256 oneToTwo = gameContract.adjacentSpaces(1, 0);
        assertEq(oneToTwo, 2);

        uint256 twoToOne = gameContract.adjacentSpaces(2, 0);
        assertEq(twoToOne, 1);

        uint256 twoToThree = gameContract.adjacentSpaces(2, 1);
        assertEq(twoToThree, 3);

        uint256 threeToTwo = gameContract.adjacentSpaces(3, 0);
        assertEq(threeToTwo, 2);
    }

    function testTrustedMove() public {
        register();
        
        uint256 spaceId = gameContract.playerLocation(player);
        assertEq(spaceId, 1);

        metaTx(abi.encodeWithSignature("performMove(uint256)", uint256(2)));

        spaceId = gameContract.playerLocation(player);
        assertEq(spaceId, 2);

        uint256 lastMove = gameContract.playerLastMove(player);
        assertEq(lastMove, block.timestamp);

        uint8 playerTeam = gameContract.playerTeam(player);
        uint8 spaceControllerTeam = gameContract.controlledSpaces(2);
        assertEq(spaceControllerTeam, playerTeam);
    }
}
