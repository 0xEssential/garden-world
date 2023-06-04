# Solidity API

## IForwardRequest

### ERC721ForwardRequest

```solidity
struct ERC721ForwardRequest {
  address from;
  address authorizer;
  address to;
  address nftContract;
  uint256 nftTokenId;
  uint256 nftChainId;
  uint256 targetChainId;
  uint256 value;
  uint256 gas;
  uint256 nonce;
  bytes data;
}
```

### MetaTransaction

```solidity
struct MetaTransaction {
  uint256 nonce;
  address from;
  bytes functionSignature;
}
```

### PlaySession

```solidity
struct PlaySession {
  address authorized;
  uint256 expiresAt;
}
```

### NFT

```solidity
struct NFT {
  address contractAddress;
  uint256 tokenId;
}
```

