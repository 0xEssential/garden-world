# Solidity API

## SignedOwnershipProof

_Based on SignedAllowance by Simon Fremaux (@dievardump)
see https://github.com/dievardump/signed-minting_

### _ownershipSigner

```solidity
address _ownershipSigner
```

### createMessage

```solidity
function createMessage(address signer, address authorizer, uint256 nonce, uint256 nftChainId, address nftContract, uint256 tokenId, uint256 timestamp) public view returns (bytes32)
```

Construct message that _ownershipSigner must sign as ownership proof

_The RPC server uses this view function to create the ownership proof_

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | the address that currently owns the L1 NFT |
| authorizer | address | the address that currently owns the L1 NFT |
| nonce | uint256 | the meta-transaction nonce for account |
| nftChainId | uint256 | the chainId for the nftContract |
| nftContract | address | the contract address for the NFT being utilized |
| tokenId | uint256 | the tokenId from nftContract for the NFT being utilized |
| timestamp | uint256 | the timestamp from the OffchainLookup error |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | the message _ownershipSigner should sign |

### verifyOwnershipProof

```solidity
function verifyOwnershipProof(struct IForwardRequest.ERC721ForwardRequest req, bytes signature, uint256 timestamp) public view returns (bool)
```

Verify signed OffchainLookup proof against meta-tx request data

_Ensures that _ownershipSigner signed a message containing (nftOwner OR authorized address, nonce, nftContract, tokenId)_

| Name | Type | Description |
| ---- | ---- | ----------- |
| req | struct IForwardRequest.ERC721ForwardRequest | structured data submitted by EOA making a meta-transaction request |
| signature | bytes | the signature proof created by the ownership signer EOA |
| timestamp | uint256 |  |

### ownershipSigner

```solidity
function ownershipSigner() public view returns (address)
```

Get ownershipSigner address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | the ownership proof signer address |

### _setOwnershipSigner

```solidity
function _setOwnershipSigner(address newSigner) internal
```

_This signer should hold no assets and is only used for signing L1 ownership proofs._

| Name | Type | Description |
| ---- | ---- | ----------- |
| newSigner | address | the new signer&#x27;s public address |

