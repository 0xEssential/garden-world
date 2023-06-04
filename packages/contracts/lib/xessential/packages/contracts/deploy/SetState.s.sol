// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {EssentialForwarder} from "../contracts/fwd/EssentialForwarder.sol";
import "forge-std/Test.sol";
import "forge-std/console.sol";

contract SetState is Script {
    EssentialForwarder immutable forwarder = EssentialForwarder(0x0000000000498Ae1a155c9b1843426E29ce41938);
    address OwnershipSigner = 0xEd0DA2E00Ae45afd92EB55605dfaD11284087480;
    address DelegateCash = 0x00000000000076A84feF008CDAbe6409d2FE638B;
    
    string[] urls;


    function run() external {
      vm.startBroadcast();

      forwarder.setOwnershipSigner(OwnershipSigner);
      forwarder.setDelegationRegistry(DelegateCash);


      urls.push("https://middleware.nfight.xyz");

      forwarder.setUrls(urls);

      vm.stopBroadcast();
    }
}


