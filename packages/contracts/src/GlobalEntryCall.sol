// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {ResourceSelector} from "@latticexyz/world/src/ResourceSelector.sol";

import {FunctionSelectors} from "@latticexyz/world/src/modules/core/tables/FunctionSelectors.sol";
import {Systems} from "@latticexyz/world/src/modules/core/tables/Systems.sol";

library GlobalEntryCall {
    /**
     * Call a contract with delegatecall/call and append the given msgSender to the calldata.
     * If the call is successfall, return the returndata as bytes memory.
     * Else, forward the error (with a revert)
     */
    function withSender(address target, bytes memory callData) internal returns (bytes memory) {
        (bool success, bytes memory data) = target.delegatecall(callData);

        // Forward returned data if the call succeeded
        if (success) return data;

        // Forward error if the call failed
        assembly {
            // data+32 is a pointer to the error message, mload(data) is the length of the error message
            revert(add(data, 0x20), mload(data))
        }
    }
}
