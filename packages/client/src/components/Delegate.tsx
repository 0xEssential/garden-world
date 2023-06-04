import { DelegateCash, DELEGATION_TYPES } from "@xessential/react";
import { useDelegatedAccount } from "@xessential/react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

import { useNetwork, useSwitchNetwork } from "wagmi";
import { useBurnerWallet } from "../hooks/useBurnerWallet";

export default function Delegate() {
  const [_curr, forceUpdate] = useReducer((x) => x + 1, 0);
  const { address: burnerAddress } = useBurnerWallet();

  const { createDelegation, allAddresses, delegatedAddresses } =
    useDelegatedAccount({
      chainId: import.meta.env.VITE_CHAIN_ID,
      type: DELEGATION_TYPES.ALL,
      registryAddress: DelegateCash.address,
    });

  const { switchNetworkAsync } = useSwitchNetwork({});
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  const { chain } = useNetwork();

  const _createDelegation = useCallback(async () => {
    if (!burnerAddress || !chain) return;
    if (chain?.id !== parseInt(import.meta.env.VITE_CHAIN_ID))
      return switchNetworkAsync?.(parseInt(import.meta.env.VITE_CHAIN_ID)).then(
        () => {
          setSwitchingNetwork(true);
        }
      );

    createDelegation({
      delegationArgs: {
        chainId: parseInt(import.meta.env.VITE_CHAIN_ID),
        delegate: burnerAddress,
        type: DELEGATION_TYPES.ALL,
        registryAddress: DelegateCash.address,
      },
      transactionArgs: {
        onSubmit: (data) => {
          console.log("onSubmit", data);
        },
        onError: (e) => {
          forceUpdate();
        },
        onValidated: (data) => {
          forceUpdate();
        },
      },
    });
  }, [burnerAddress, chain, createDelegation, switchNetworkAsync]);

  useEffect(() => {
    if (!switchingNetwork) return;
    if (chain?.id === import.meta.env.VITE_CHAIN_ID) return;
    setSwitchingNetwork(false);
    _createDelegation();
  }, [_createDelegation, chain?.id, switchingNetwork]);

  const burnerIsDelegated = useMemo(() => {
    if (!burnerAddress || !delegatedAddresses) return false;
    console.log({ allAddresses, burnerAddress, delegatedAddresses });
    return delegatedAddresses?.some((delegate: `0x${string}`) => {
      return delegate.toLowerCase() === burnerAddress.toLowerCase();
    });
  }, [burnerAddress, allAddresses, delegatedAddresses]);

  if (burnerIsDelegated) {
    return (
      <p className="text-center font-ArialNarrowerStd text-xl text-green">
        with NFT delegation
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <p className="text-center font-ArialNarrowerStd text-xl text-yellow">
          but it needs permission for your NFTs
        </p>
        <button
          key={_curr}
          onClick={async () => {
            if (!burnerAddress) return;
            _createDelegation();
          }}
        >
          Delegate
        </button>
      </div>
      <div className="mb-0 mt-4 flex flex-row justify-center">
        <a
          target="_blank"
          href={`https://delegate.cash?delegate=${burnerAddress}`}
          className="external mx-3 my-1 text-xl"
          rel="noreferrer"
        >
          You can also delegate on delegate.cash
        </a>
      </div>{" "}
    </>
  );
}
