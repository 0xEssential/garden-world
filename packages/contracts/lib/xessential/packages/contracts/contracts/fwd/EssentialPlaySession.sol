//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "./EssentialERC2771Context.sol";
import "./IForwardRequest.sol";

contract EssentialPlaySession is EssentialERC2771Context {
    event DelegateForAll(address vault, address delegate, bool value);

    mapping(address => IForwardRequest.PlaySession) internal _sessions;

    constructor(address trustedForwarder) EssentialERC2771Context(trustedForwarder) {}

    /// @notice Get current session for Primary EOA
    function getSession(address authorizer) external view returns (IForwardRequest.PlaySession memory) {
        return _sessions[authorizer];
    }

    function checkDelegateForAll(address delegate, address vault) external view returns (bool) {
        return _sessions[vault].authorized == delegate && _sessions[vault].expiresAt >= block.timestamp;
    }

    /// @notice Allow `authorized` to use your NFTs in a game for `length` seconds. Your NFTs
    ///         will not be held in custody or approved for transfer.
    function delegateForAll(address delegate, bool value) external {
        if (value) {
            _createSession(delegate, tx.origin);
        }
    }

    /// @notice Allow `authorized` to use your NFTs in a game for `length` seconds through a
    /// signed message from the primary EOA
    function createSignedSession(address authorized) external onlyForwarder {
        _createSession(authorized, _msgSender());
    }

    function _createSession(address authorized, address authorizer) internal {
        _sessions[authorizer] = IForwardRequest.PlaySession({
            authorized: authorized,
            expiresAt: block.timestamp + 365 days
        });

        emit DelegateForAll(authorizer, authorized, true);
    }
}
