import { awaitStreamValue } from "@latticexyz/utils";
import { SetupNetworkResult } from "./setupNetwork";
import { toast } from "react-toastify";
import { BigNumber } from "ethers";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({
  worldSend,
  txReduced$,
}: SetupNetworkResult) {
  const deploySpecies = async (
    ipfsHash: string,
    name: string,
    symbol: string,
    mintPrice: BigNumber,
    growthCycleBlocks: number,
    lifecycleLength: number
  ) => {
    const tx = await worldSend("deploySpecies", [
      ipfsHash,
      name,
      symbol,
      mintPrice,
      growthCycleBlocks,
      lifecycleLength,
    ]);
    const deployedTo = await awaitStreamValue(
      txReduced$,
      (txHash) => txHash === tx.hash
    );
    toast(() => <p>Contract deployed to {deployedTo}</p>);

    return deployedTo;
  };

  const mintSpecies = async (
    contract: string,
    mintPrice: BigNumber,
    count: number
  ) => {
    const value = mintPrice.mul(count);
    const tx = await worldSend(
      "mintSpecies",
      [
        contract,
        count,
        {
          value,
        },
      ],
      {
        txMode: value.gt(0) ? "std" : "meta",
      }
    );
    const deployedTo = await awaitStreamValue(
      txReduced$,
      (txHash) => txHash === tx.hash
    );
    toast(() => <p>Minted {count} seeds</p>);
    return deployedTo;
  };

  const plantSeed = async (
    chainId: any,
    contract: string,
    tokenId: bigint,
    plot: bigint
  ) => {
    const tx = await worldSend(
      "plantSeed",
      [
        plot,
        {
          customData: {
            nftChainId: chainId,
            nftContract: contract,
            nftTokenId: tokenId.toString(),
          },
        },
      ],
      {
        txMode: "meta",
      }
    );
    toast("Planted seed");

    const watered = await awaitStreamValue(
      txReduced$,
      (txHash) => txHash === tx.hash
    );
    return watered;
  };

  const water = async (chainId: any, contract: string, tokenId: any) => {
    const tx = await worldSend(
      "water",
      [
        {
          customData: {
            nftChainId: chainId,
            nftContract: contract,
            nftTokenId: tokenId.toString(),
          },
        },
      ],
      {
        txMode: "meta",
      }
    );
    toast("Plant watered");
    const watered = await awaitStreamValue(
      txReduced$,
      (txHash) => txHash === tx.hash
    );
    return watered;
  };

  const compost = async (chainId: any, contract: string, tokenId: any) => {
    const tx = await worldSend(
      "compost",
      [
        {
          customData: {
            nftChainId: chainId,
            nftContract: contract,
            nftTokenId: tokenId.toString(),
          },
        },
      ],
      {
        txMode: "meta",
      }
    );
    const composted = await awaitStreamValue(
      txReduced$,
      (txHash) => txHash === tx.hash
    );
    toast("Composted - seed can be replanted");

    return composted;
  };

  return {
    deploySpecies,
    mintSpecies,
    plantSeed,
    water,
    compost,
  };
}
