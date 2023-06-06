import { BigNumber, Contract, Overrides, Signer, Transaction } from "ethers";
import { JsonRpcProvider, TransactionRequest } from "@ethersproject/providers";
import { EssentialSigner, IForwardRequest } from "@xessential/signer";
import { EssentialOverrides } from "@xessential/signer/dist/types/EssentialSigner";
// import * as devObservables from "@latticexyz/dev-tools";

/**
 * Create a stateful util to execute transactions using the appropriate signer and transaction flow.
 *
 * @param chainId The chainId of the network to execute transactions on
 * @param externalSigner User's connected external signer
 * @param essentialSigner EssentialSigner for NFT Global Entry transactions and meta-txs
 * @param globalOptions Options to apply to all transactions
 *
 * EssentialSigner is an ethers based Signer that handles different transaction flows
 * depending on the nature of the transaction and user context. It abstracts functionality
 * like meta-transactions, burner wallet support with account delegation, and NFT Global Entry.
 *
 * User Context:
 * - Wraps user's connected external signer by default, adding meta-tx support
 * - Supports Burner wallets with access to a privateKey for meta-txs without popups
 * - Abstracts NFT ownership with DelegateCash for NFT Global Entry
 *
 * Transaction Mode Context:
 * - Calls that specify `options.txMode = 'std'` are routed through the user's connected
 *   external signer as native transactions. Transactions with value must always be `'std'`
 * - Calls that specify `options.txMode = 'meta'` are routed through EssentialSigner
 *   as meta-txs. If the user is connected with a burner wallet, it is used to sign and relay
 *   the meta-tx without a wallet popup. Otherwise, the user's connected external signer will
 *   request a signature for the meta-tx.
 *
 * NFT Global Entry:
 *
 * Global Entry is crosschain tooling that allows users to "use" NFTs in transactions.
 * EIP-3668 provides instructions for fetching a proof from our RPC, and the proof is included
 * in the final transaction to authenticate crosschain NFT ownership. NFT being "used" can be
 * specified in the `customData` field of the transaction. An `authorizer` address
 * must also be specified in the `customData` field when user is connected to a burner wallet
 * and using an NFT owned by the external signer.
 *
 * ```
 * overrides: {
 *   customData: {
 *    authorizer: "0x...", // NFT owner with DelegateCash access
 *    nftChainId: 1,
 *    nftContractAddress: "0x...",
 *    nftTokenId: 1,
 *   }
 * }
 * ```
 *
 * - With a meta-tx, the relaying infrastructure handles the NFT ownership proof.
 *    - If a user is authenticated with a burner wallet, EssentialSigner uses the burner wallet
 *      to sign and relay a meta-tx.
 *    - If a user is not authenticated with a burner wallet, EssentialSigner uses the user's connected
 *      external signer to sign and relay a meta-tx.
 *
 * - With a native transaction, the ownership proof is pre-fetched, and thw user's connected
 *   external signer is prompted to submit a native transaction with the ownership proof.
 *
 */
export async function createFastTxExecutor(
  chainId: number,
  externalSigner: Signer & { provider: JsonRpcProvider },
  essentialSigner: EssentialSigner,
  globalOptions: { priorityFeeMultiplier: number } = {
    priorityFeeMultiplier: 1,
  }
) {
  const currentNonce = {
    nonce: await externalSigner.getTransactionCount(),
  };

  // This gas config is updated
  const gasConfig: {
    maxPriorityFeePerGas?: number;
    maxFeePerGas?: BigNumber;
  } = {};
  await updateFeePerGas(globalOptions.priorityFeeMultiplier);

  /**
   * Execute a transaction as fast as possible by skipping a couple unnecessary RPC calls ethers does.
   */
  async function fastTxExecute<C extends Contract, F extends keyof C>(
    contract: C,
    func: F,
    args: Parameters<C[F]>,
    options: {
      retryCount?: number;
      txMode?: "std" | "meta";
    } = { retryCount: 0 }
  ): Promise<{ hash: string; tx: ReturnType<C[F]> }> {
    const functionName = `${func as string}(${args
      .map((arg) => `'${arg}'`)
      .join(",")})`;
    console.log(
      `executing transaction: ${functionName} with nonce ${currentNonce.nonce}`
    );

    try {
      // Separate potential overrides from the args to extend the overrides below
      const { argsWithoutOverrides, overrides } =
        separateOverridesFromArgs(args);

      // Separate NFT custom data from the other overrides
      const { customData, ...txOverrides } = overrides as {
        customData: EssentialOverrides;
      } & Overrides;

      // Estimate gas if no gas limit was provided
      const gasLimit =
        txOverrides.gasLimit ??
        (await contract.estimateGas[func as string].apply(null, args));

      // Apply default overrides
      const fullOverrides = {
        type: 2,
        gasLimit,
        nonce: currentNonce.nonce++,
        ...gasConfig,
        ...txOverrides,
      };

      // Populate the transaction
      const populatedTx = await contract.populateTransaction[func as string](
        ...argsWithoutOverrides,
        fullOverrides
      );
      populatedTx.chainId = chainId;

      // Execute the transaction
      let hash: string;
      let proof = "";

      // For a native transaction with NFT Global Entry, pre-fetch the NFT ownership proof
      if (
        options?.txMode == "std" &&
        customData?.nftTokenId &&
        customData?.nftContract
      ) {
        // get proof
        proof = (await essentialSigner?.preflightNative({
          ...populatedTx,
          ...(overrides?.customData as EssentialOverrides),
          targetChainId: chainId,
          authorizer: populatedTx.from as string,
          value: 0,
          gas: 1e6,
        } as IForwardRequest.ERC721ForwardRequestStruct)) as string;
      }

      // If the transaction is a meta-tx, prepare, sign and relay it
      // EssentialSigner is handling burner vs external signer logic,
      // and proof generation for NFT Global Entry is handled by the relaying infrastructure
      // via EIP-3668 OffchainLookup
      if (options?.txMode === "meta") {
        // TODO: `from` feels a little wonky - we should probably ensure that the `from` address
        // in populatedTx is the expected signer address and pass in authorizer separately
        const { from, to } = populatedTx;

        const req = await essentialSigner?.prepareTransaction({
          ...populatedTx,
          from: essentialSigner.address,
          to: to as string,
          customData: {
            ...(overrides?.customData ? overrides?.customData : {}),
            authorizer: from,
          } as EssentialOverrides,
        });

        const tx = await essentialSigner.sendTransaction(
          req as TransactionRequest & EssentialOverrides
        );

        console.warn("meta-tx hash", tx);

        hash = tx.hash;
      } else if (proof != "") {
        // TODO: this could also use the try sign / send fallback pattern
        const tx = await externalSigner.sendTransaction({
          to: essentialSigner.forwarder.address,
          data: proof,
        });
        hash = tx.hash;
        console.log(hash);
      } else {
        try {
          // Attempt to sign the transaction and send it raw for higher performance
          const signedTx = await externalSigner.signTransaction(populatedTx);
          hash = await externalSigner.provider.perform("sendTransaction", {
            signedTransaction: signedTx,
          });
        } catch (e) {
          // Some signers don't support signing without sending (looking at you MetaMask),
          // so sign+send using the signer as a fallback
          console.warn("signing failed, falling back to sendTransaction", e);
          console.warn(populatedTx);

          const tx = await externalSigner.sendTransaction(populatedTx);
          hash = tx.hash;
        }
      }

      // TODO: emit txs that fail gas estimation so we can display em in dev tools
      // devObservables.transactionHash$.next(hash);

      // Return the transaction promise and transaction hash.
      // The hash is available immediately, the full transaction is available as a promise
      const tx = externalSigner.provider.getTransaction(hash) as ReturnType<
        C[F]
      >;

      return { hash, tx };
    } catch (error: any) {
      // Handle "transaction already imported" errors
      if (error?.message.includes("transaction already imported")) {
        if (options.retryCount === 0) {
          updateFeePerGas(globalOptions.priorityFeeMultiplier * 1.1);
          return fastTxExecute(contract, func, args, {
            retryCount: options.retryCount++,
          });
        } else {
          throw new Error(
            `Gas estimation error for ${functionName}: ${error?.reason}`
          );
        }
      }

      // TODO: potentially handle more transaction errors here, like:
      // "insufficient funds for gas * price + value" -> request funds from faucet
      // "invalid nonce" -> update nonce

      // Rethrow all other errors
      throw error;
    }
  }

  /**
   * Set the maxFeePerGas and maxPriorityFeePerGas based on the current base fee and the given multiplier.
   * The multiplier is used to allow replacing pending transactions.
   * @param multiplier Multiplier to apply to the base fee
   */
  async function updateFeePerGas(multiplier: number) {
    // Compute maxFeePerGas and maxPriorityFeePerGas like ethers, but allow for a multiplier to allow replacing pending transactions
    const feeData = await externalSigner.provider.getFeeData();
    if (!feeData.lastBaseFeePerGas)
      throw new Error("Can not fetch lastBaseFeePerGas from RPC");

    // Set the priority fee to 0 for development chains with no base fee, to allow transactions from unfunded wallets
    gasConfig.maxPriorityFeePerGas = feeData.lastBaseFeePerGas.eq(0)
      ? 0
      : Math.floor(1_500_000_000 * multiplier);
    gasConfig.maxFeePerGas = feeData.lastBaseFeePerGas
      .mul(2)
      .add(gasConfig.maxPriorityFeePerGas);
  }

  return {
    fastTxExecute,
    updateFeePerGas,
    gasConfig: gasConfig as Readonly<typeof gasConfig>,
    currentNonce: currentNonce as Readonly<typeof currentNonce>,
  };
}

function separateOverridesFromArgs<T>(args: Array<T>) {
  // Extract existing overrides from function call
  const hasOverrides = args.length > 0 && isOverrides(args[args.length - 1]);
  const overrides = (hasOverrides ? args[args.length - 1] : {}) as Overrides;
  const argsWithoutOverrides = hasOverrides
    ? args.slice(0, args.length - 1)
    : args;

  return { argsWithoutOverrides, overrides };
}

function isOverrides(obj: any): obj is Overrides {
  if (typeof obj !== "object" || Array.isArray(obj) || obj === null)
    return false;
  return (
    "gasLimit" in obj ||
    "gasPrice" in obj ||
    "maxFeePerGas" in obj ||
    "maxPriorityFeePerGas" in obj ||
    "nonce" in obj ||
    "type" in obj ||
    "accessList" in obj ||
    "customData" in obj ||
    "value" in obj ||
    "blockTag" in obj ||
    "from" in obj
  );
}
