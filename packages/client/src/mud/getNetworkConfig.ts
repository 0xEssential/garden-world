import { SetupContractConfig, getBurnerWallet } from "@latticexyz/std-client";
import worldsJson from "contracts/worlds.json";
import { supportedChains } from "./supportedChains";
import { MUDChain } from "@latticexyz/common/chains";
import { arbitrumGoerli } from "wagmi/chains";

const worlds = worldsJson as Partial<
  Record<string, { address: string; blockNumber?: number }>
>;

type NetworkConfig = SetupContractConfig & {
  privateKey: string;
  faucetServiceUrl?: string;
  snapSync?: boolean;
  chainConfig?: MUDChain;
};

export async function getNetworkConfig(): Promise<NetworkConfig> {
  const params = new URLSearchParams(window.location.search);

  const chainId = Number(
    params.get("chainId") || import.meta.env.VITE_CHAIN_ID
  );
  const chainIndex = supportedChains.findIndex((c) => c.id === chainId);
  const chain = supportedChains[chainIndex];
  if (!chain) {
    throw new Error(`Chain ${chainId} not found`);
  }

  const world = worlds[chain.id.toString()];
  const worldAddress = params.get("worldAddress") || world?.address;
  if (!worldAddress) {
    throw new Error(
      `No world address found for chain ${chainId}. Did you run \`mud deploy\`?`
    );
  }
  console.warn({ world });
  const initialBlockNumber = params.has("initialBlockNumber")
    ? Number(params.get("initialBlockNumber"))
    : world?.blockNumber ?? -1; // -1 will attempt to find the block number from RPC

  return {
    // ????
    // cacheAgeThreshold: 5000,
    // cacheInterval: 50000,
    clock: {
      period: 1000,
      initialTime: 0,
      syncInterval: 2000,
    },
    provider: {
      chainId,
      jsonRpcUrl:
        "https://still-orbital-slug.arbitrum-goerli.quiknode.pro/34b170f5e28481fbc03288e1993b5968b59f5292/",
      wsRpcUrl:
        "wss://still-orbital-slug.arbitrum-goerli.quiknode.pro/34b170f5e28481fbc03288e1993b5968b59f5292/",
      options: {
        pollingInterval: 20_000,
        batch: true,
        skipNetworkCheck: true,
      },
    },
    chainConfig: {
      ...arbitrumGoerli,
    },
    privateKey: getBurnerWallet().value,
    chainId,
    modeUrl: params.get("mode") ?? chain.modeUrl,
    faucetServiceUrl: params.get("faucet") ?? chain.faucetUrl,
    worldAddress,
    initialBlockNumber,
    snapSync: true,
    disableCache: params.get("cache") === "false",
  };
}
