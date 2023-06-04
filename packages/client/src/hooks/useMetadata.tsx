import { useEffect, useState } from "react";

import { Network, Alchemy, OwnedNft } from "alchemy-sdk";
import { GardenMetadata } from ".";

interface Chain {
  apiKey: string;
  network: Network;
}

export type PlantNFT = OwnedNft & {
  chainId: number;
  growing?: boolean;
};

const networks: Record<number, Chain> = {
  1: {
    apiKey: "XSaG7vG7AeKlCp6jR_eV3VgCVVEwEvXl",
    network: Network.ETH_MAINNET,
  },
};

export async function queryIndexedMetadata(
  chainId: number,
  contractAddress: string,
  tokenId: string
): Promise<GardenMetadata> {
  const alchemy = new Alchemy(networks[chainId]);
  const response = await alchemy.nft.getNftMetadata(
    contractAddress,
    tokenId,
    {}
  );

  const metadata = {
    name: response.title,
    description: response.description,
    image: response.media[0].gateway,
  };

  return metadata;
}

export function useMetadata(
  chainId: number,
  contractAddress: string,
  tokenId: string
) {
  const [metadata, setMetadata] = useState<any>();
  useEffect(() => {
    const fetchMetadata = async () => {
      const raw = await queryIndexedMetadata(chainId, contractAddress, tokenId);
      setMetadata(raw);
    };
    fetchMetadata();
  }, [chainId, contractAddress, tokenId]);

  return metadata;
}
