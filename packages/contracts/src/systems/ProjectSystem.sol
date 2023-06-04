// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {System} from "@latticexyz/world/src/System.sol";

import {Projects} from "../codegen/Tables.sol";

contract ProjectSystem is System {
    function integrateProject(uint16 chainId, address contract_, string calldata name) public {
        bytes32 newEntity = keccak256(abi.encodePacked(chainId, contract_));

        // Projects.set(newEntity, chainId, contract_, false, name, "");
    }
}
