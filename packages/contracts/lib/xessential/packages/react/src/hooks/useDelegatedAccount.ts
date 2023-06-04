import { FetchBalanceResult, GetAccountResult, Provider } from '@wagmi/core';
import { BigNumber, BigNumberish, constants } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, useBalance, useContractRead } from 'wagmi';

import { abi, address as delegateCashAddress } from '../abis/DelegateCash.js';

enum DELEGATION_TYPES {
  NONE,
  ALL,
  CONTRACT,
  TOKEN,
}

type Delegation = {
  type: DELEGATION_TYPES;
  contract_?:  `0x${string}`;
  tokenId: BigNumberish;
}

type DelegatedAccountResult = {
  /* 
    The primary address for user context. If the user is connected to a delegated wallet,
    this will return the vault wallet. Useful for ENS names, NFT holdings and token balances. 
  */
  address?: `0x${string}`;

  /** Gas token balance for connected address */
  connectedBalance?: FetchBalanceResult;

  /** Array of addresses to which the connected address has delegated authority */
  delegatedAddresses: `0x${string}`[];

  /** Convenience function for the connected address having 0 balance */
  isBurner: boolean;

  /** Boolean for whether connected address is delegate of a vaultAddress */
  isDelegated: boolean;

  /** Connected address used for transaction signing.  */
  signerAddress?: `0x${string}`;

  setVaultAddress: (address: `0x${string}`) => void;

  /*
    Current selected vault address. If connected address is delegate of > 1 vaults, 
    a best guess default is selected. See `setVaultAddress`.
  */
  vaultAddress?: `0x${string}`;

  /** Array of addresses that have delegated to connected address */
  vaultAddresses?: `0x${string}`[];
};

export function useDelegatedAccount(
  {
    chainId,
    type,
    contract,
    tokenId,
  }: {
    chainId?: number;
    type: DELEGATION_TYPES;
    contract?: `0x${string}`;
    tokenId?: BigNumberish;
  } = {
    chainId: 1,
    type: DELEGATION_TYPES.ALL,
  },
): DelegatedAccountResult & GetAccountResult<Provider> {
  const { address: signerAddress, ...account } = useAccount();
  const [vaultAddress, setVaultAddress] = useState<`0x${string}`>();

  // Delegates for current connected address
  // Useful for instructing a user to switch to a delegated wallet
  // with a valid delegation for the application context
  const txConfig = {
    address: delegateCashAddress,
    abi,
    chainId,
    enabled: account.isConnected,
  };

  const delegationArgs = useMemo(() => {
    const DELEGATION_ARGS = {
      [DELEGATION_TYPES.ALL]: {
        functionName: 'getDelegatesForAll',
        args: [signerAddress],
      },
      [DELEGATION_TYPES.CONTRACT]: {
        functionName: 'getDelegatesForContract',
        args: [signerAddress, contract],
      },
      [DELEGATION_TYPES.TOKEN]: {
        functionName: 'getDelegatesForToken',
        args: [signerAddress, contract, BigNumber.from(tokenId || 0)],
      },
    } as Record<DELEGATION_TYPES, any>;

    return {
      ...txConfig,
      ...DELEGATION_ARGS[type],
    };
  }, [type, contract, tokenId, signerAddress]);

  const { data: delegatedAddresses } = useContractRead({
    ...txConfig,
    ...delegationArgs,
    enabled: account.isConnected,
  });

  // Vaults for current connected address
  // Useful for showing user identity context when connected to a hot wallet
  // i.e. display a user's ENS name and avatar for a vault when connected
  // to a delegated wallet
  const { data: delegations } = useContractRead({
    ...txConfig,
    functionName: 'getDelegationsByDelegate',
    args: [signerAddress || constants.AddressZero],
    enabled: account.isConnected,
  }) as { data: Delegation[]};

  const validDelegations = useMemo(() => {
    if (type === DELEGATION_TYPES.ALL) return delegations;
    return delegations.reduce((vd: any[], delegation) => {
      if (type === DELEGATION_TYPES.TOKEN && tokenId !== delegation.tokenId)
        return vd;

      if (contract !== delegation.contract_) return vd;

      return [delegation, ...vd];
    }, []);
  }, [type, contract, tokenId, delegations]);

  const isDelegated = useMemo(
    () =>
      Boolean(
        validDelegations?.find(
          (delegation) => delegation.delegate === signerAddress,
        ),
      ),
    [signerAddress, validDelegations],
  );

  const { data: connectedBalance } = useBalance({
    address: signerAddress,
    chainId,
  });

  const vaultAddresses = useMemo(
    () => validDelegations?.map((delegation) => delegation.vault),
    [validDelegations],
  );

  const isBurner = useMemo(() => {
    return connectedBalance?.decimals === 0;
  }, [connectedBalance]);

  useEffect(() => {
    setVaultAddress(vaultAddresses?.[0]);
  }, [vaultAddresses]);

  return {
    connectedBalance,
    delegatedAddresses: delegatedAddresses as `0x${string}`[],
    isBurner,
    isDelegated,
    signerAddress,
    setVaultAddress,
    vaultAddress,
    vaultAddresses,
    ...(account as GetAccountResult),
    address: vaultAddress || signerAddress,
  } as unknown as DelegatedAccountResult & GetAccountResult<Provider>;
}
