import { setupMUDV2Network } from "@latticexyz/std-client";
import { getSnapSyncRecords } from "@latticexyz/network";
import { getNetworkConfig } from "./getNetworkConfig";
import { defineContractComponents } from "./contractComponents";
import { world } from "./world";
import { Contract, Signer, Wallet } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
import { getTableIds } from "@latticexyz/utils";
import storeConfig from "contracts/mud.config";
import { EssentialSigner } from "@xessential/signer";
import { createFastTxExecutor } from "./createFastTxExecutor";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork(config: any, signer?: Signer, wallet?: any) {
  console.warn("setupNetwork");
  const { relayerUri, forwarderAddress, domainName, readProvider } =
    config as any;
  const contractComponents = defineContractComponents(world);
  const networkConfig = await getNetworkConfig();
  const result = await setupMUDV2Network<
    typeof contractComponents,
    typeof storeConfig
  >({
    networkConfig,
    world,
    contractComponents,
    syncThread: "main",
    storeConfig,
    syncStoreCache: true,
    fetchSystemCalls: false,
    worldAbi: IWorld__factory.abi,
  });

  const provider = result.network.providers.get().json;

  const address = await signer?.getAddress();

  // Persistent Burner Wallet
  const walletAddress = await wallet?.getAddressString();
  const _wallet = wallet
    ? new Wallet(
        wallet.getPrivateKey(),
        readProvider({ chainId: import.meta.env.VITE_CHAIN_ID })
      )
    : null;

  const _address = walletAddress || address;
  const _signer = _wallet || signer;

  const essentialSigner =
    _signer &&
    new EssentialSigner(_address, _signer, {
      domainName,
      forwarderAddress,
      relayerUri,
      chainId: import.meta.env.VITE_CHAIN_ID,
      readProvider: () => provider,
      // TODO: onSubmit fires when a meta-tx is POSTed to the relayer
      // and should reflect some loading state prior to having a tx.hash
      // onSubmit,
    });

  const signerOrProvider = signer ?? provider;
  // Create a World contract instance
  const worldContract = IWorld__factory.connect(
    networkConfig.worldAddress,
    signerOrProvider
  );

  if (essentialSigner && networkConfig.snapSync) {
    const currentBlockNumber = await provider.getBlockNumber();
    const tableRecords = await getSnapSyncRecords(
      networkConfig.worldAddress,
      getTableIds(storeConfig),
      currentBlockNumber,
      signerOrProvider
    );
    console.log(`Syncing ${tableRecords.length} records`, currentBlockNumber);
    result.startSync(tableRecords, currentBlockNumber);
  } else if (essentialSigner) {
    result.startSync();
  }

  // Create a fast tx executor
  const fastTxExecutor = essentialSigner
    ? await createFastTxExecutor(
        import.meta.env.VITE_CHAIN_ID,
        signerOrProvider as Signer & { provider: JsonRpcProvider },
        essentialSigner
      )
    : null;

  // TODO: infer this from fastTxExecute signature?
  type BoundFastTxExecuteFn<C extends Contract> = <F extends keyof C>(
    func: F,
    args: Parameters<C[F]>,
    options?: {
      retryCount?: number;
      txMode?: "std" | "meta";
    }
  ) => Promise<ReturnType<C[F]>>;

  function bindFastTxExecute<C extends Contract>(
    contract: C
  ): BoundFastTxExecuteFn<C> {
    return async function (...args) {
      if (!fastTxExecutor) {
        throw new Error("no signer");
      }
      const { tx } = await fastTxExecutor.fastTxExecute(contract, ...args);
      return await tx;
    };
  }

  return {
    ...result,
    growerAddress: address || walletAddress,
    worldContract,
    worldSend: bindFastTxExecute(worldContract),
    fastTxExecutor,
  };
}
