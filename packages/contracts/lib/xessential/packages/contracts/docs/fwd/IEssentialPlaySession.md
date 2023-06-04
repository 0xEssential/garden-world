# Solidity API

## IEssentialPlaySession

### getSession

```solidity
function getSession(address authorizer) external view returns (struct IForwardRequest.PlaySession)
```

### createSession

```solidity
function createSession(address authorized, uint256 length) external
```

### verifyAuthorization

```solidity
function verifyAuthorization(struct IForwardRequest.ERC721ForwardRequest req) external view returns (bool)
```

