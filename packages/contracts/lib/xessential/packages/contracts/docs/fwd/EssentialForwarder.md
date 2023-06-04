# Solidity API

## EssentialForwarder

EIP-2771 based MetaTransaction Forwarding Contract with EIP-3668 OffchainLookup for cross-chain token gating

_Allows a Relayer to submit meta-transactions that utilize an NFT (i.e. in a game) on behalf of EOAs. Transactions
     are only executed if the Relayer provides a signature from a trusted signer. The signature must include the current
     owner of the Layer 1 NFT being used, or a Burner EOA the owner has authorized to use its NFTs.

     EssentialForwarder can be used to build Layer 2 games that use Layer 1 NFTs without bridging and with superior UX.
     End users can specify a Burner EOA from their primary EOA, and then use that burner address to play games.
     The Burner EOA can then sign messages for game moves without user interaction without any risk to the NFTs or other
     assets owned by the primary EOA._

### Session

```solidity
event Session(address owner, address authorized, uint256 length)
```

### Unauthorized

```solidity
error Unauthorized()
```

### InvalidSignature

```solidity
error InvalidSignature()
```

### InvalidOwnership

```solidity
error InvalidOwnership()
```

### OffchainLookup

```solidity
error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)
```

### ADMIN_ROLE

```solidity
bytes32 ADMIN_ROLE
```

### ERC721_TYPEHASH

```solidity
bytes32 ERC721_TYPEHASH
```

### _nonces

```solidity
mapping(address &#x3D;&gt; uint256) _nonces
```

### _sessions

```solidity
mapping(address &#x3D;&gt; struct IForwardRequest.PlaySession) _sessions
```

### urls

```solidity
string[] urls
```

### PlaySession

```solidity
contract IEssentialPlaySession PlaySession
```

### constructor

```solidity
constructor(string name, string[] _urls) public
```

### setOwnershipSigner

```solidity
function setOwnershipSigner(address newSigner) external
```

Change the ownership signer

### setPlaySessionOperator

```solidity
function setPlaySessionOperator(address playSession) external
```

Change the PlaySession source

### getNonce

```solidity
function getNonce(address from) external view returns (uint256)
```

Get current nonce for EOA

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

### preflight

```solidity
function preflight(struct IForwardRequest.ERC721ForwardRequest req, bytes signature) public view
```

Submit a meta-tx request and signature to check validity and receive
a response with data useful for fetching a trusted proof per EIP-3668.

_Per EIP-3668, a valid signature will cause a revert with useful error params._

### executeWithProof

```solidity
function executeWithProof(bytes response, bytes extraData) external payable returns (bool, bytes)
```

Re-submit a valid meta-tx request with trust-minimized proof to execute the transaction.

_The RPC call and re-submission should be handled by your Relayer client_

| Name | Type | Description |
| ---- | ---- | ----------- |
| response | bytes | The unaltered bytes reponse from a call made to an RPC url from OffchainLookup::urls |
| extraData | bytes | The unaltered bytes from OffchainLookup::extraData |

### verify

```solidity
function verify(struct IForwardRequest.ERC721ForwardRequest req, bytes signature) public view returns (bool)
```

Submit a meta-tx request where a proof of ownership is not required.

_Useful for transactions where the signer is not using a specific NFT, but values
are still required in the signature - use the zero address for nftContract and 0 for tokenId_

### execute

```solidity
function execute(struct IForwardRequest.ERC721ForwardRequest req, bytes signature) public payable returns (bool, bytes)
```

### verifyRequest

```solidity
function verifyRequest(struct IForwardRequest.ERC721ForwardRequest req, bytes signature) internal view returns (bool)
```

### verifyAuthorization

```solidity
function verifyAuthorization(struct IForwardRequest.ERC721ForwardRequest req) internal view returns (bool)
```



