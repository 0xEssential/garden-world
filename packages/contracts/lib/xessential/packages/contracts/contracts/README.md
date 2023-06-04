# @0xessential/contracts

This repo contains the Solidity source code for the contracts used in 0xEssential's [Cross-Chain Token Gating](https://0xessential.gitbook.io/cross-chain-token-gating/) meta-transaction stack.

The contracts are available as an NPM package and can also be installed as a Foundry dependency.

0xEssential provides deployed versions of `EssentialForwarder` on Polygon's Mumbai testnet and Matic mainnet.

Developers are also free to deploy their own versions of `EssentialForwarder` - you may want to deploy your own version so that you can change the `domainName` that is displayed to users when signing a meta-transaction with their wallet.

## Install

With NPM:

```bash
  yarn add @0xessential/contracts
```

With Foundry:

```bash

```

Then add the following line to your `remappings.txt`:

```txt
essential-contracts/=lib/essential-contracts/
```

## Use Deployed Instances

If you're building a layer 2 contract that uses Cross-Chain Token Gating and don't wish to customize the domain name displayed to users, you need to inherit `EssentialERC2771Context` in your contract. We also provide `EssentialERC2771ContextUpgradeable` if your contract is an upgradeable proxy.

```solidity
pragma solidity ^0.8.13;

import "essential-contracts/contracts/fwd/EssentialERC2771Context.sol";

contract MyContract is EssentialERC2771Context {}
```

Then add the `EssentialERC2771Context` constructor call:

```solidity
  constructor(address trustedForwarder) EssentialERC2771Context(trustedForwarder) {
```

The deployed `EssentialForwarder` instances are available at the following addresses. You will need the `name` value in your frontend.

| Network | Address | name|
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Mumbai  | [`0x9928351FD354D4E45416fc53e90457a428960cF4`](https://mumbai.polygonscan.com/address/0x9928351FD354D4E45416fc53e90457a428960cF4) |  0xEssential Playsession |
| Mainnet | [`0x9bbb4217115B7296630183Bb23703DEC93E8edCf`](https://polygonscan.com/address/0x9bbb4217115B7296630183Bb23703DEC93E8edCf) |  0xEssential Playsession |

## Deploy Your Own

If you require customizing the name of the forwarder shown to users when signing meta-transactions, you need to deploy your own version of an `EssentialForwarder`.

You can do this by creating your own contract that inherits `EssentialForwarder` and calls its constructor with your custom name:

```solidity
pragma solidity ^0.8.13;

import "@0xessential/contracts/fwd/EssentialForwarder.sol";

contract MyCustomForwarder is EssentialForwarder {
  constructor(string[] memory _urls) 
  EssentialForwarder("My Custom Forwarder Name", _urls)
  {}
}

```

The `_urls` constructor argument is an array of HTTPS URLs that serve 0xEssential's open source Ownership Lookup RPC API.

You may specify the instance 0xEssential runs - `https://middleware.nfight.xyz` or see that repo for deploying your own version.