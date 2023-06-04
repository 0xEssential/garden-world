# Solidity API

## AccessControl

_Contract module that allows children to implement role-based access
control mechanisms. This is a lightweight version that doesn&#x27;t allow enumerating role
members except through off-chain means by accessing the contract event logs. Some
applications may benefit from on-chain enumerability, for those cases see
{AccessControlEnumerable}.

Roles are referred to by their &#x60;bytes32&#x60; identifier. These should be exposed
in the external API and be unique. The best way to achieve this is by
using &#x60;public constant&#x60; hash digests:

&#x60;&#x60;&#x60;
bytes32 public constant MY_ROLE &#x3D; keccak256(&quot;MY_ROLE&quot;);
&#x60;&#x60;&#x60;

Roles can be used to represent a set of permissions. To restrict access to a
function call, use {hasRole}:

&#x60;&#x60;&#x60;
function foo() public {
    require(hasRole(MY_ROLE, msg.sender));
    ...
}
&#x60;&#x60;&#x60;

Roles can be granted and revoked dynamically via the {grantRole} and
{revokeRole} functions. Each role has an associated admin role, and only
accounts that have a role&#x27;s admin role can call {grantRole} and {revokeRole}.

By default, the admin role for all roles is &#x60;DEFAULT_ADMIN_ROLE&#x60;, which means
that only accounts with this role will be able to grant or revoke other
roles. More complex role relationships can be created by using
{_setRoleAdmin}.

WARNING: The &#x60;DEFAULT_ADMIN_ROLE&#x60; is also its own admin: it has permission to
grant and revoke this role. Extra precautions should be taken to secure
accounts that have been granted it._

### RoleData

```solidity
struct RoleData {
  mapping(address &#x3D;&gt; bool) members;
  bytes32 adminRole;
}
```

### _roles

```solidity
mapping(bytes32 &#x3D;&gt; struct AccessControl.RoleData) _roles
```

### DEFAULT_ADMIN_ROLE

```solidity
bytes32 DEFAULT_ADMIN_ROLE
```

### onlyRole

```solidity
modifier onlyRole(bytes32 role)
```

_Modifier that checks that an account has a specific role. Reverts
with a standardized message including the required role.

The format of the revert reason is given by the following regular expression:

 /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/

_Available since v4.1.__

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

### hasRole

```solidity
function hasRole(bytes32 role, address account) public view virtual returns (bool)
```

_Returns &#x60;true&#x60; if &#x60;account&#x60; has been granted &#x60;role&#x60;._

### _checkRole

```solidity
function _checkRole(bytes32 role) internal view virtual
```

_Revert with a standard message if &#x60;_msgSender()&#x60; is missing &#x60;role&#x60;.
Overriding this function changes the behavior of the {onlyRole} modifier.

Format of the revert message is described in {_checkRole}.

_Available since v4.6.__

### _checkRole

```solidity
function _checkRole(bytes32 role, address account) internal view virtual
```

_Revert with a standard message if &#x60;account&#x60; is missing &#x60;role&#x60;.

The format of the revert reason is given by the following regular expression:

 /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/_

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) public view virtual returns (bytes32)
```

_Returns the admin role that controls &#x60;role&#x60;. See {grantRole} and
{revokeRole}.

To change a role&#x27;s admin, use {_setRoleAdmin}._

### grantRole

```solidity
function grantRole(bytes32 role, address account) public virtual
```

_Grants &#x60;role&#x60; to &#x60;account&#x60;.

If &#x60;account&#x60; had not been already granted &#x60;role&#x60;, emits a {RoleGranted}
event.

Requirements:

- the caller must have &#x60;&#x60;role&#x60;&#x60;&#x27;s admin role._

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) public virtual
```

_Revokes &#x60;role&#x60; from &#x60;account&#x60;.

If &#x60;account&#x60; had been granted &#x60;role&#x60;, emits a {RoleRevoked} event.

Requirements:

- the caller must have &#x60;&#x60;role&#x60;&#x60;&#x27;s admin role._

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) public virtual
```

_Revokes &#x60;role&#x60; from the calling account.

Roles are often managed via {grantRole} and {revokeRole}: this function&#x27;s
purpose is to provide a mechanism for accounts to lose their privileges
if they are compromised (such as when a trusted device is misplaced).

If the calling account had been revoked &#x60;role&#x60;, emits a {RoleRevoked}
event.

Requirements:

- the caller must be &#x60;account&#x60;._

### _setupRole

```solidity
function _setupRole(bytes32 role, address account) internal virtual
```

_Grants &#x60;role&#x60; to &#x60;account&#x60;.

If &#x60;account&#x60; had not been already granted &#x60;role&#x60;, emits a {RoleGranted}
event. Note that unlike {grantRole}, this function doesn&#x27;t perform any
checks on the calling account.

[WARNING]
&#x3D;&#x3D;&#x3D;&#x3D;
This function should only be called from the constructor when setting
up the initial roles for the system.

Using this function in any other way is effectively circumventing the admin
system imposed by {AccessControl}.
&#x3D;&#x3D;&#x3D;&#x3D;

NOTE: This function is deprecated in favor of {_grantRole}._

### _setRoleAdmin

```solidity
function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual
```

_Sets &#x60;adminRole&#x60; as &#x60;&#x60;role&#x60;&#x60;&#x27;s admin role.

Emits a {RoleAdminChanged} event._

### _grantRole

```solidity
function _grantRole(bytes32 role, address account) internal virtual
```

_Grants &#x60;role&#x60; to &#x60;account&#x60;.

Internal function without access restriction._

### _revokeRole

```solidity
function _revokeRole(bytes32 role, address account) internal virtual
```

_Revokes &#x60;role&#x60; from &#x60;account&#x60;.

Internal function without access restriction._

## IAccessControl

_External interface of AccessControl declared to support ERC165 detection._

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 role, bytes32 previousAdminRole, bytes32 newAdminRole)
```

_Emitted when &#x60;newAdminRole&#x60; is set as &#x60;&#x60;role&#x60;&#x60;&#x27;s admin role, replacing &#x60;previousAdminRole&#x60;

&#x60;DEFAULT_ADMIN_ROLE&#x60; is the starting admin for all roles, despite
{RoleAdminChanged} not being emitted signaling this.

_Available since v3.1.__

### RoleGranted

```solidity
event RoleGranted(bytes32 role, address account, address sender)
```

_Emitted when &#x60;account&#x60; is granted &#x60;role&#x60;.

&#x60;sender&#x60; is the account that originated the contract call, an admin role
bearer except when using {AccessControl-_setupRole}._

### RoleRevoked

```solidity
event RoleRevoked(bytes32 role, address account, address sender)
```

_Emitted when &#x60;account&#x60; is revoked &#x60;role&#x60;.

&#x60;sender&#x60; is the account that originated the contract call:
  - if using &#x60;revokeRole&#x60;, it is the admin role bearer
  - if using &#x60;renounceRole&#x60;, it is the role bearer (i.e. &#x60;account&#x60;)_

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```

_Returns &#x60;true&#x60; if &#x60;account&#x60; has been granted &#x60;role&#x60;._

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```

_Returns the admin role that controls &#x60;role&#x60;. See {grantRole} and
{revokeRole}.

To change a role&#x27;s admin, use {AccessControl-_setRoleAdmin}._

### grantRole

```solidity
function grantRole(bytes32 role, address account) external
```

_Grants &#x60;role&#x60; to &#x60;account&#x60;.

If &#x60;account&#x60; had not been already granted &#x60;role&#x60;, emits a {RoleGranted}
event.

Requirements:

- the caller must have &#x60;&#x60;role&#x60;&#x60;&#x27;s admin role._

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external
```

_Revokes &#x60;role&#x60; from &#x60;account&#x60;.

If &#x60;account&#x60; had been granted &#x60;role&#x60;, emits a {RoleRevoked} event.

Requirements:

- the caller must have &#x60;&#x60;role&#x60;&#x60;&#x27;s admin role._

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external
```

_Revokes &#x60;role&#x60; from the calling account.

Roles are often managed via {grantRole} and {revokeRole}: this function&#x27;s
purpose is to provide a mechanism for accounts to lose their privileges
if they are compromised (such as when a trusted device is misplaced).

If the calling account had been granted &#x60;role&#x60;, emits a {RoleRevoked}
event.

Requirements:

- the caller must be &#x60;account&#x60;._

## Context

_Provides information about the current execution context, including the
sender of the transaction and its data. While these are generally available
via msg.sender and msg.data, they should not be accessed in such a direct
manner, since when dealing with meta-transactions the account sending and
paying for execution may not be the actual sender (as far as an application
is concerned).

This contract is only required for intermediate, library-like contracts._

### _msgSender

```solidity
function _msgSender() internal view virtual returns (address)
```

### _msgData

```solidity
function _msgData() internal view virtual returns (bytes)
```

## Strings

_String operations._

### _HEX_SYMBOLS

```solidity
bytes16 _HEX_SYMBOLS
```

### toString

```solidity
function toString(uint256 value) internal pure returns (string)
```

_Converts a &#x60;uint256&#x60; to its ASCII &#x60;string&#x60; decimal representation._

### toHexString

```solidity
function toHexString(uint256 value) internal pure returns (string)
```

_Converts a &#x60;uint256&#x60; to its ASCII &#x60;string&#x60; hexadecimal representation._

### toHexString

```solidity
function toHexString(uint256 value, uint256 length) internal pure returns (string)
```

_Converts a &#x60;uint256&#x60; to its ASCII &#x60;string&#x60; hexadecimal representation with fixed length._

## ECDSA

_Elliptic Curve Digital Signature Algorithm (ECDSA) operations.

These functions can be used to verify that a message was signed by the holder
of the private keys of a given address._

### RecoverError

```solidity
enum RecoverError {
  NoError,
  InvalidSignature,
  InvalidSignatureLength,
  InvalidSignatureS,
  InvalidSignatureV
}
```

### _throwError

```solidity
function _throwError(enum ECDSA.RecoverError error) private pure
```

### tryRecover

```solidity
function tryRecover(bytes32 hash, bytes signature) internal pure returns (address, enum ECDSA.RecoverError)
```

_Returns the address that signed a hashed message (&#x60;hash&#x60;) with
&#x60;signature&#x60; or error string. This address can then be used for verification purposes.

The &#x60;ecrecover&#x60; EVM opcode allows for malleable (non-unique) signatures:
this function rejects them by requiring the &#x60;s&#x60; value to be in the lower
half order, and the &#x60;v&#x60; value to be either 27 or 28.

IMPORTANT: &#x60;hash&#x60; _must_ be the result of a hash operation for the
verification to be secure: it is possible to craft signatures that
recover to arbitrary addresses for non-hashed data. A safe way to ensure
this is by receiving a hash of the original message (which may otherwise
be too long), and then calling {toEthSignedMessageHash} on it.

Documentation for signature generation:
- with https://web3js.readthedocs.io/en/v1.3.4/web3-eth-accounts.html#sign[Web3.js]
- with https://docs.ethers.io/v5/api/signer/#Signer-signMessage[ethers]

_Available since v4.3.__

### recover

```solidity
function recover(bytes32 hash, bytes signature) internal pure returns (address)
```

_Returns the address that signed a hashed message (&#x60;hash&#x60;) with
&#x60;signature&#x60;. This address can then be used for verification purposes.

The &#x60;ecrecover&#x60; EVM opcode allows for malleable (non-unique) signatures:
this function rejects them by requiring the &#x60;s&#x60; value to be in the lower
half order, and the &#x60;v&#x60; value to be either 27 or 28.

IMPORTANT: &#x60;hash&#x60; _must_ be the result of a hash operation for the
verification to be secure: it is possible to craft signatures that
recover to arbitrary addresses for non-hashed data. A safe way to ensure
this is by receiving a hash of the original message (which may otherwise
be too long), and then calling {toEthSignedMessageHash} on it._

### tryRecover

```solidity
function tryRecover(bytes32 hash, bytes32 r, bytes32 vs) internal pure returns (address, enum ECDSA.RecoverError)
```

_Overload of {ECDSA-tryRecover} that receives the &#x60;r&#x60; and &#x60;vs&#x60; short-signature fields separately.

See https://eips.ethereum.org/EIPS/eip-2098[EIP-2098 short signatures]

_Available since v4.3.__

### recover

```solidity
function recover(bytes32 hash, bytes32 r, bytes32 vs) internal pure returns (address)
```

_Overload of {ECDSA-recover} that receives the &#x60;r and &#x60;vs&#x60; short-signature fields separately.

_Available since v4.2.__

### tryRecover

```solidity
function tryRecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address, enum ECDSA.RecoverError)
```

_Overload of {ECDSA-tryRecover} that receives the &#x60;v&#x60;,
&#x60;r&#x60; and &#x60;s&#x60; signature fields separately.

_Available since v4.3.__

### recover

```solidity
function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address)
```

_Overload of {ECDSA-recover} that receives the &#x60;v&#x60;,
&#x60;r&#x60; and &#x60;s&#x60; signature fields separately.
/_

### toEthSignedMessageHash

```solidity
function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32)
```

_Returns an Ethereum Signed Message, created from a &#x60;hash&#x60;. This
produces hash corresponding to the one signed with the
https://eth.wiki/json-rpc/API#eth_sign[&#x60;eth_sign&#x60;]
JSON-RPC method as part of EIP-191.

See {recover}.
/_

### toEthSignedMessageHash

```solidity
function toEthSignedMessageHash(bytes s) internal pure returns (bytes32)
```

_Returns an Ethereum Signed Message, created from &#x60;s&#x60;. This
produces hash corresponding to the one signed with the
https://eth.wiki/json-rpc/API#eth_sign[&#x60;eth_sign&#x60;]
JSON-RPC method as part of EIP-191.

See {recover}.
/_

### toTypedDataHash

```solidity
function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash) internal pure returns (bytes32)
```

_Returns an Ethereum Signed Typed Data, created from a
&#x60;domainSeparator&#x60; and a &#x60;structHash&#x60;. This produces hash corresponding
to the one signed with the
https://eips.ethereum.org/EIPS/eip-712[&#x60;eth_signTypedData&#x60;]
JSON-RPC method as part of EIP-712.

See {recover}.
/_

## ERC165

_Implementation of the {IERC165} interface.

Contracts that want to implement ERC165 should inherit from this contract and override {supportsInterface} to check
for the additional interface id that will be supported. For example:

&#x60;&#x60;&#x60;solidity
function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    return interfaceId &#x3D;&#x3D; type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
}
&#x60;&#x60;&#x60;

Alternatively, {ERC165Storage} provides an easier to use but more expensive implementation._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

## IERC165

_Interface of the ERC165 standard, as defined in the
https://eips.ethereum.org/EIPS/eip-165[EIP].

Implementers can declare support of contract interfaces, which can then be
queried by others ({ERC165Checker}).

For an implementation, see {ERC165}._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

_Returns true if this contract implements the interface defined by
&#x60;interfaceId&#x60;. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

## EssentialEIP712

_https://eips.ethereum.org/EIPS/eip-712[EIP 712] is a standard for hashing and signing of typed structured data.

The encoding specified in the EIP is very generic, and such a generic implementation in Solidity is not feasible,
thus this contract does not implement the encoding itself. Protocols need to implement the type-specific encoding
they need in their contracts using a combination of &#x60;abi.encode&#x60; and &#x60;keccak256&#x60;.

This contract implements the EIP 712 domain separator ({_domainSeparatorV4}) that is used as part of the encoding
scheme, and the final step of the encoding to obtain the message digest that is then signed via ECDSA
({_hashTypedDataV4}). 0xEssential removes the chainId from domainSeparator, instead including chainId as
a bytes32 representation as the salt. This allows wallets to sign from any network, while still ensuring signatures
can only be used on the target chain.

The implementation of the domain separator was designed to be as efficient as possible while still properly updating
the chain id to protect against replay attacks on an eventual fork of the chain.

NOTE: This contract implements the version of the encoding known as &quot;v4&quot;, as implemented by the JSON RPC method
https://docs.metamask.io/guide/signing-data.html[&#x60;eth_signTypedDataV4&#x60; in MetaMask].

_Available since v3.4.__

### _CACHED_DOMAIN_SEPARATOR

```solidity
bytes32 _CACHED_DOMAIN_SEPARATOR
```

### _CACHED_CHAIN_ID

```solidity
uint256 _CACHED_CHAIN_ID
```

### _HASHED_NAME

```solidity
bytes32 _HASHED_NAME
```

### _HASHED_VERSION

```solidity
bytes32 _HASHED_VERSION
```

### _TYPE_HASH

```solidity
bytes32 _TYPE_HASH
```

### constructor

```solidity
constructor(string name, string version) internal
```

_Initializes the domain separator and parameter caches.

The meaning of &#x60;name&#x60; and &#x60;version&#x60; is specified in
https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator[EIP 712]:

- &#x60;name&#x60;: the user readable name of the signing domain, i.e. the name of the DApp or the protocol.
- &#x60;version&#x60;: the current major version of the signing domain.

NOTE: These parameters cannot be changed except through a xref:learn::upgrading-smart-contracts.adoc[smart
contract upgrade]._

### _domainSeparatorV4

```solidity
function _domainSeparatorV4() internal view returns (bytes32)
```

_Returns the domain separator for the current chain._

### _buildDomainSeparator

```solidity
function _buildDomainSeparator(bytes32 typeHash, bytes32 nameHash, bytes32 versionHash) private view returns (bytes32)
```

### _hashTypedDataV4

```solidity
function _hashTypedDataV4(bytes32 structHash) internal view virtual returns (bytes32)
```

_Given an already https://eips.ethereum.org/EIPS/eip-712#definition-of-hashstruct[hashed struct], this
function returns the hash of the fully encoded EIP712 message for this domain.

This hash can be used together with {ECDSA-recover} to obtain the signer of a message. For example:

&#x60;&#x60;&#x60;solidity
bytes32 digest &#x3D; _hashTypedDataV4(keccak256(abi.encode(
    keccak256(&quot;Mail(address to,string contents)&quot;),
    mailTo,
    keccak256(bytes(mailContents))
)));
address signer &#x3D; ECDSA.recover(digest, signature);
&#x60;&#x60;&#x60;_

### getChainId

```solidity
function getChainId() public view returns (uint256 id)
```

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

