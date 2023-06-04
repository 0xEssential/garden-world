# Solidity API

## EssentialERC2771Context

_Context variant with ERC2771 support._

### _trustedForwarder

```solidity
address _trustedForwarder
```

### owner

```solidity
address owner
```

### onlyOwner

```solidity
modifier onlyOwner()
```

### onlyForwarder

```solidity
modifier onlyForwarder()
```

### constructor

```solidity
constructor(address trustedForwarder) internal
```

### setTrustedForwarder

```solidity
function setTrustedForwarder(address trustedForwarder) external
```

### isTrustedForwarder

```solidity
function isTrustedForwarder(address forwarder) public view virtual returns (bool)
```

### _msgSender

```solidity
function _msgSender() internal view virtual returns (address sender)
```

### _msgData

```solidity
function _msgData() internal view virtual returns (bytes)
```

### _msgNFT

```solidity
function _msgNFT() internal view returns (struct IForwardRequest.NFT)
```

