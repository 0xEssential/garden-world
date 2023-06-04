import { Abi } from 'abitype';
import { Signer } from 'ethers';
import * as React from 'react';
import { UseContractWriteConfig } from 'wagmi';

import { useDelegatedAccount } from './useDelegatedAccount.js';
import {
  SendTransactionResult,
  WriteContractMode,
  WriteContractPreparedArgs,
} from '@wagmi/core';

export function useContractWrite<
  TMode extends WriteContractMode = WriteContractMode,
  TAbi extends Abi | readonly {}[] = Abi,
  TFunctionName extends string = string,
>(
  config: UseContractWriteConfig<TMode, TAbi, TFunctionName> & {
    signer: Signer;
    proof?: `0x${string}`;
    onSuccess?: (data: SendTransactionResult) => void;
  },
) {
  const [data, setData] = React.useState<SendTransactionResult>();
  const [isLoading, setLoading] = React.useState(false);

  const { address, abi, functionName, chainId, mode, signer } = config;
  const { request } = config as WriteContractPreparedArgs<TAbi, TFunctionName>;

  const defaultValues = {
    error: false,
    isError: false,
    isIdle: true,
    isLoading: false,
    isSuccess: false,
  };

  const write = React.useCallback(async () => {
    if (!signer) return;
    
    setLoading(true);
    signer
      .sendTransaction(request)
      .then((response) => {
        setData(response as SendTransactionResult);
        config?.onSuccess?.(response as SendTransactionResult, {} as any, null);
      })
      .catch((e: Error) => {
        config?.onError?.(e, {} as any, null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [address, chainId, abi, functionName, mode, request, signer]);

  return {
    ...defaultValues,
    isLoading,
    data,
    write,
  };
}
