// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// solhint-disable no-console

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {GlobalEntryWorld} from "../src/GlobalEntryWorld.sol";

import {SigUtils} from "../utils/SigUtils.sol";

import {EssentialForwarder} from "@xessential/contracts/fwd/EssentialForwarder.sol";
import {IForwardRequest} from "@xessential/contracts/fwd/IForwardRequest.sol";
import {IWorld} from "../src/codegen/world/IWorld.sol";

contract ProdDeploy is Script {
    function run(address worldAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        IWorld(worldAddress).deploySpecies(
            // "deploySpecies(string,string,string,uint256,uint32,uint8)": FunctionFragment;
            "bafkreieb4zvu44cn4ti2knhkmcrzuwlk2abptfoanrldyxcgz6gah4axsa",
            "WTRMLN",
            "Watermelon",
            0 ether,
            uint32(44000),
            uint8(3)
        );

        // IWorld(worldAddress).deploySpecies(
        //     "bafkreifmjdsxn3evhj3oyys6m7lrwn7jfmiw4uhkmyzzrj2q6f3nco225q",
        //     "SHROOM",
        //     "Nouns Mushroom",
        //     0.01 ether,
        //     44000,
        //     2
        // );

        // // IWorld(worldAddress).deploySpecies(
        // //     "bafkreigv3erxju475r3zjso6cdt6xz3fviirkznqbwrqh574ba3obwedlq", "Blitmap Rose", "ROSE", 0.01 ether, 44000, 2
        // // );

        // IWorld(worldAddress).deploySpecies(
        //     "bafkreie3c63h3eiqzepr7ftl4vapzussspjr6fs5huym6qqaa2cx75q4fy", "CrypToadz", "TOADZ", 0.01 ether, 44000, 2
        // );
        vm.stopBroadcast();
    }
}
