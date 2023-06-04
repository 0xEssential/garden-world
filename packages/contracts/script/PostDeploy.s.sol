// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// solhint-disable no-console

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {GlobalEntryWorld} from "../src/GlobalEntryWorld.sol";

import {SigUtils} from "../utils/SigUtils.sol";

import {EssentialForwarder} from "@xessential/contracts/fwd/EssentialForwarder.sol";
import {IForwardRequest} from "@xessential/contracts/fwd/IForwardRequest.sol";
import {DelegationRegistry} from "../test/DelegationRegistry.sol";
import {IWorld} from "../src/codegen/world/IWorld.sol";

contract PostDeploy is Script {
    EssentialForwarder internal forwarder;
    DelegationRegistry internal registry;
    SigUtils internal sigUtils;

    bytes initCode = type(DelegationRegistry).creationCode;
    bytes32 salt = 0x00000000000000000000000000000000000000008b99e5a778edb02572010000;

    function tokenGatedMetaTx(uint256 pk, bytes memory encodedFunc, address nftContract, uint256 tokenId) internal {
        address eoa = vm.addr(pk);

        IForwardRequest.ERC721ForwardRequest memory req =
            sigUtils.buildRequest(encodedFunc, eoa, eoa, nftContract, tokenId);

        bytes memory sig = sigUtils.signRequest(pk, req);
        bytes memory data = abi.encode(block.timestamp, req, sig);
        bytes memory response = sigUtils.mockOwnershipSig(req);
        (bool success, bytes memory returnData) = forwarder.executeWithProof(response, data);
        console.log("success", success);
        // console.log("returnData", returnData);
    }

    function metaTx(uint256 pk, bytes memory func) internal {
        address eoa = vm.addr(pk);

        bytes memory encodedFunc = abi.encode(keccak256(func));

        IForwardRequest.ForwardRequest memory req = sigUtils.buildRequest(encodedFunc, eoa, eoa);

        bytes memory sig = sigUtils.signRequest(pk, req);
        forwarder.execute(req, sig);
    }

    function run(address worldAddress) external {
        // // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console.log("deployer", vm.addr(deployerPrivateKey));
        vm.startBroadcast(deployerPrivateKey);
        // payable(0x0090720FeD7Fed66eD658118b7B3BB0189D3A495).transfer(1 ether);
        // payable(0x04E59B44847b37957858892cA78fBf26C0b4956C).transfer(1 ether);
        // // Deploy a forwarder instance
        // // In prod will use canonical forwarder address on any supported chain
        // // 0x000000000066b3aED7Ae8263588dA67fF381FfCa
        // // forwarder = new EssentialForwarder();
        // // console.log("Deployed Forwarder at", address(forwarder));

        // // registry = new DelegationRegistry();
        // // console.log("Deployed DelegateCash at", address(registry));
        // // forwarder.setDelegationRegistry(address(registry));
        // // registry.delegateForAll(0x0090720FeD7Fed66eD658118b7B3BB0189D3A495, true);

        // uint256 ownershipSignerPrivateKey = deployerPrivateKey;
        // address ownershipSigner = vm.addr(ownershipSignerPrivateKey);
        // string[] memory urls = new string[](1);
        // urls[0] = "http://localhost:9200";
        // forwarder.setUrls(urls);
        // forwarder.setOwnershipSigner(ownershipSigner);
        // vm.allowCheatcodes(ownershipSigner);
        // sigUtils = new SigUtils(
        //         forwarder._domainSeparatorV4(),
        //         forwarder,
        //         address(worldAddress),
        //         ownershipSignerPrivateKey
        //     );
        // // Let signature utils use cheatcodes
        // vm.allowCheatcodes(address(sigUtils));

        // // ADMIN BOOTSTRAPPING
        // GlobalEntryWorld w = GlobalEntryWorld(payable(worldAddress));

        // // Set trusted forwarder to just-deployed instance
        // w.setTrustedForwarder(address(forwarder));

        // // // Send test transaction with mocked signature
        // metaTx(deployerPrivateKey, "increment()");
        // uint32 value = Counter.get(IWorld(worldAddress));
        // console.log("Increment via meta-tx:", value);

        // // Send test transaction to directly integrate a project
        // // IWorld(worldAddress).integrateProject(1, address(0x941ee2e831d278DB802A541d3855A8de749ef635), "CryptOrchids");

        // // fails bc not owner
        // // tokenGatedMetaTx(
        // //     deployerPrivateKey,
        // //     abi.encodeWithSignature(
        // //         "plantSeed(uint256,address,uint256)", 1, address(0x941ee2e831d278DB802A541d3855A8de749ef635), 14
        // //     ),
        // //     address(0x941ee2e831d278DB802A541d3855A8de749ef635),
        // //     14
        // // );

        // console.log("Planted seed");

        // // IWorld(worldAddress).plantSeed(1, address(0x941ee2e831d278DB802A541d3855A8de749ef635), 14);

        // IWorld(worldAddress).deploySpecies(
        //     "bafkreieb4zvu44cn4ti2knhkmcrzuwlk2abptfoanrldyxcgz6gah4axsa", "WTRMLN", "Watermelon", 0, 302400, 3
        // );

        // IWorld(worldAddress).deploySpecies(
        //     "bafkreifmjdsxn3evhj3oyys6m7lrwn7jfmiw4uhkmyzzrj2q6f3nco225q",
        //     "SHROOM",
        //     "Nouns Mushroom",
        //     0.01 ether,
        //     44000,
        //     2
        // );

        // IWorld(worldAddress).deploySpecies(
        //     "bafkreigv3erxju475r3zjso6cdt6xz3fviirkznqbwrqh574ba3obwedlq", "Blitmap Rose", "ROSE", 0.01 ether, 44000, 2
        // );

        // IWorld(worldAddress).deploySpecies(
        //     "bafkreie3c63h3eiqzepr7ftl4vapzussspjr6fs5huym6qqaa2cx75q4fy", "CrypToadz", "TOADZ", 0.01 ether, 44000, 2
        // );

        // // // toadz
        // // // bafkreie3c63h3eiqzepr7ftl4vapzussspjr6fs5huym6qqaa2cx75q4fy
        vm.stopBroadcast();
    }
}
