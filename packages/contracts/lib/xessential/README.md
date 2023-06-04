# @xessential

0xEssential's tooling helps developers build decentralized applications in the Ethereum ecosystem with great user experience.

Our full-stack solution supports apps with:

- Account Delegation
- MultiChain Connections (coming soon)
- Gasless Transactions (coming soon)
- NFT Global Entry (coming soon)
- Burner Wallets (coming soon)

You can mix and match these capabilities based on your needs. Every component is free, permissionless and open-source, leveraging the tools you already use.

## Contract Integration

Depending on which features you plan to use, your contracts require certain capabilities. In some cases 0xEssential's tooling will work with contracts that are already deployed.

Our Solidity SDK for MultiChain Connections, Gasless Transactions and NFT Global Entry will be released soon.

Contract requirements for Account Delegation and Burner Wallets depend on your specific use-case.

Dapps can also use the `react` package for functionality like reading blockchain or indexer state from a Delegated Account without any contract changes.

## Client Packages

The client tooling is split into two ESM packages - `@xessential/react` and `@xessential/signer`.

### react

The `react` package offers React hooks based on `wagmi` that superpower your dapp - make it easy for users to connect a hot wallet, use their vault's holdings with NFT Global Entry, submit network-agnostic meta-transactions, or choose to switch chains and submit direct transactions. No matter how you or your users want to transact `@xessential/react` has got your back.

[View react Readme](./packages/react/README.md)

### signer

The `signer` package offers a Signer based on `ethers` and utilities that can be used in any Node environment.

If you're using the `react` package you won't need to deal with the `signer` package directly.
