import { useEffect, useState } from "react";

export const IPFS_GATEWAY_BASE_URL = "https://nftstorage.link/ipfs/";

export async function queryMetadata(rootHash: string) {
  return fetch(IPFS_GATEWAY_BASE_URL + rootHash)
    .then((resp) => resp.json())
    .then(({ image, sprite, ...rest }) => ({
      image: image.startsWith("ipfs://")
        ? image.replace("ipfs://", IPFS_GATEWAY_BASE_URL)
        : image,
      sprite: sprite.startsWith("ipfs://")
        ? sprite.replace("ipfs://", IPFS_GATEWAY_BASE_URL)
        : sprite,
      ...rest,
    }));
}

export function useIPFSMetadata(rootHash: string) {
  const [metadata, setMetadata] = useState<any>();
  useEffect(() => {
    const fetchMetadata = async () => {
      const raw = await queryMetadata(rootHash);
      setMetadata(raw);
    };
    fetchMetadata();
  }, [rootHash]);

  return metadata;
}
