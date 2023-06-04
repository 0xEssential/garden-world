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

The canonical `EssentialForwarder` is deployed at the same address across every chain we support.

The current initCode hash is `0x834bf54c861481fbb7ba3ceeef86d59b15b883a6d3253e970c5b7ca60609a96e` and the deployment salt is `0x00000000000000000000000000000000000000003db581b25d19d926ebb359e5`.


ssh into box and:

```bash
sudo apt install build-essential -y; curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y; source "$HOME/.cargo/env"; git clone https://github.com/0age/create2crunch && cd create2crunch; sed -i 's/0x4/0x40/g' src/lib.rs
```

Search code:

```bash
export FACTORY="0x0000000000ffe8b47b3e2130213b802212439497"; export CALLER="0x0000000000000000000000000000000000000000"; export INIT_CODE_HASH="0x834bf54c861481fbb7ba3ceeef86d59b15b883a6d3253e970c5b7ca60609a96e"; export LEADING=5; export TOTAL=7; cargo run --release $FACTORY $CALLER $INIT_CODE_HASH 0 $LEADING $TOTAL

```


| Salt | Address |
| ---- | ------- |
| `0x00000000000000000000000000000000000000003db581b25d19d926ebb359e5` | `0x0000000000Cbb6a3EEb0CB823e814E4DE0e8e4DF` |

| Network | Address | name|
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Goerli  | [`0x00000000002679091dE1205C3938017357f3c99A`](https://goerli.etherscan.io/address/0x00000000002679091dE1205C3938017357f3c99A) |  EssentialForwarder |
| Mumbai  | [`0x00000000002679091dE1205C3938017357f3c99A`](https://mumbai.polygonscan.com/address/0x00000000002679091dE1205C3938017357f3c99A) |  EssentialForwarder |



Additional `EssentialForwarder` instances are available at the following addresses. You will need the `name` value in your frontend.

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

