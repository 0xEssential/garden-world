// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Bytes} from "@latticexyz/store/src/Bytes.sol";

import {IBaseWorld} from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
import {ISystemHook} from "@latticexyz/world/src/interfaces/ISystemHook.sol";

import {ResourceSelector} from "@latticexyz/world/src/ResourceSelector.sol";
import {ROOT_NAMESPACE} from "@latticexyz/world/src/constants.sol";
import {AccessControl} from "@latticexyz/world/src/AccessControl.sol";
import {Call} from "@latticexyz/world/src/Call.sol";
import {GlobalEntryCall} from "./GlobalEntryCall.sol";
import {Systems} from "@latticexyz/world/src/modules/core/tables/Systems.sol";
import {SystemHooks} from "@latticexyz/world/src/modules/core/tables/SystemHooks.sol";

import {World} from "@latticexyz/world/src/World.sol";
import {FunctionSelectors} from "@latticexyz/world/src/modules/core/tables/FunctionSelectors.sol";

import {EssentialERC2771Context} from "@xessential/contracts/fwd/EssentialERC2771Context.sol";
import {IForwardRequest} from "@xessential/contracts/fwd/IForwardRequest.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract GlobalEntryWorld is World, EssentialERC2771Context {
    using ResourceSelector for bytes32;

    event Transfer(address indexed from, address indexed to, uint256 indexed id);

    constructor() EssentialERC2771Context(address(0x000000000066b3aED7Ae8263588dA67fF381FfCa)) World() {}
    /**
     * Call the system at the given namespace and name.
     * If the system is not public, the caller must have access to the namespace or name.
     */

    function call(bytes16 namespace, bytes16 name, bytes memory funcSelectorAndArgs)
        external
        payable
        override
        returns (bytes memory)
    {
        if (isTrustedForwarder(msg.sender)) {
            // When called via the trusted forwarder, we include msg.data in the delegated call
            // which includes an encoded IForwardRequest.NFT struct. msgSender() is appened in _call()
            bytes memory validFuncSelectorAndArgs = abi.encodePacked(funcSelectorAndArgs, msg.data);

            return _call(namespace, name, validFuncSelectorAndArgs, msg.value);
        }
        return _call(namespace, name, funcSelectorAndArgs, msg.value);
    }

    /**
     * Call the system at the given namespace and name and pass the given value.
     * If the system is not public, the caller must have access to the namespace or name.
     */
    function _call(bytes16 namespace, bytes16 name, bytes memory funcSelectorAndArgs, uint256)
        internal
        override
        returns (bytes memory data)
    {
        // Load the system data
        bytes32 resourceSelector = ResourceSelector.from(namespace, name);
        (address systemAddress, bool publicAccess) = Systems.get(resourceSelector);

        // Check if the system exists
        if (systemAddress == address(0)) revert ResourceNotFound(resourceSelector.toString());

        // Allow access if the system is public or the caller has access to the namespace or name
        if (!publicAccess) AccessControl.requireAccess(namespace, name, _msgSender());

        // Get system hooks
        address[] memory hooks = SystemHooks.get(resourceSelector);

        // Call onBeforeCallSystem hooks (before calling the system)
        for (uint256 i; i < hooks.length; i++) {
            ISystemHook hook = ISystemHook(hooks[i]);
            hook.onBeforeCallSystem(msg.sender, systemAddress, funcSelectorAndArgs);
        }

        // Call the system and forward any return data
        data = GlobalEntryCall.withSender({
            target: systemAddress,
            callData: abi.encodePacked(funcSelectorAndArgs, _msgSender())
        });

        // Call onAfterCallSystem hooks (after calling the system)
        for (uint256 i; i < hooks.length; i++) {
            ISystemHook hook = ISystemHook(hooks[i]);
            hook.onAfterCallSystem(msg.sender, systemAddress, funcSelectorAndArgs);
        }
    }

    function extractAndReplaceArgs(bytes memory data, bytes memory newArgs) public pure returns (bytes memory) {
        bytes4 functionSignature;
        bytes memory modifiedData = new bytes(data.length - 4 + newArgs.length);

        assembly {
            // Load the first 4 bytes of the data (function signature)
            functionSignature := mload(add(data, 32))

            // Store the function signature in the modified data
            mstore(add(modifiedData, 32), functionSignature)
        }

        // Copy the new arguments into the modified data
        uint256 argOffset = 4 + 32; // 4 bytes for function signature and 32 bytes for padding/size
        for (uint256 i = 0; i < newArgs.length; i++) {
            modifiedData[argOffset + i] = newArgs[i];
        }

        return modifiedData;
    }
}
