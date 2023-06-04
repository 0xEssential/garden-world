# Solidity API

## EssentialPlaySession

### Session

```solidity
event Session(address owner, address authorized, uint256 length)
```

### _sessions

```solidity
mapping(address &#x3D;&gt; struct IForwardRequest.PlaySession) _sessions
```

### permissionlessSessions

```solidity
bool permissionlessSessions
```

### constructor

```solidity
constructor(address trustedForwarder) public
```

### getSession

```solidity
function getSession(address authorizer) external view returns (struct IForwardRequest.PlaySession)
```

Get current session for Primary EOA

### createSession

```solidity
function createSession(address authorized, uint256 length) external
```

Allow &#x60;authorized&#x60; to use your NFTs in a game for &#x60;length&#x60; seconds. Your NFTs
        will not be held in custody or approved for transfer.

### createSignedSession

```solidity
function createSignedSession(address authorized, uint256 length) external
```

Allow &#x60;authorized&#x60; to use your NFTs in a game for &#x60;length&#x60; seconds through a
signed message from the primary EOA

### invalidateSession

```solidity
function invalidateSession() external
```

Stop allowing your current authorized burner address to use your NFTs.

### verifyAuthorization

```solidity
function verifyAuthorization(struct IForwardRequest.ERC721ForwardRequest req) external view returns (bool)
```

### _createSession

```solidity
function _createSession(address authorized, uint256 length, address authorizer) internal
```

