import { useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import {
  Entity,
  Has,
  HasValue,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { Network, Alchemy, OwnedNft } from "alchemy-sdk";
import { useEffect, useMemo, useState } from "react";
import { useDelegatedAccount } from "@xessential/react";
import { PlantWithMetadata } from "./components/GrowingPlant";
import { queryMetadata } from "./hooks/useIPFSMetadata";
import { queryIndexedMetadata } from "./hooks/useMetadata";
import { BigNumber, utils } from "ethers";
import { PlaceablePlant } from "./components/PlaceablePlant";
import PhaserComponent from "./components/PhaserComponent";

interface Chain {
  apiKey: string;
  network: Network | string;
  chainId: number;
  provider?: string;
}

export type PlantNFT = OwnedNft & {
  chainId: number;
  growing?: boolean;
};

const networks: Chain[] = [
  {
    apiKey: "XSaG7vG7AeKlCp6jR_eV3VgCVVEwEvXl",
    network: Network.ETH_MAINNET,
    chainId: 1,
    provider: "alchemy",
  },
  {
    apiKey: "XSaG7vG7AeKlCp6jR_eV3VgCVVEwEvXl",
    network: "foundry",
    chainId: 31337,
    provider: "ipfs",
  },
  {
    apiKey: "XSaG7vG7AeKlCp6jR_eV3VgCVVEwEvXl",
    network: "foundry",
    chainId: 421613,
    provider: "ipfs",
  },
];

const entityId = (
  chainId: number,
  contractAddress: string,
  tokenId: number | BigNumber
): Entity =>
  [chainId, contractAddress, tokenId]
    .reduce((acc, arg) => {
      return [...acc, utils.hexZeroPad(utils.hexlify(arg), 32)];
    }, [] as string[])
    .join(":") as Entity;

export const App = () => {
  const { address } = useDelegatedAccount({ chainId: 1, type: 1 });
  const [plants, setPlants] = useState<PlantWithMetadata[]>();
  const [growingPlants, setGrowingPlants] = useState<any[]>();
  const {
    components: { Plants, Projects },
  } = useMUD();

  const _projects = useEntityQuery([Has(Projects)]);
  const _plants = useEntityQuery([
    Has(Plants),
    HasValue(Plants, { grower: address?.toLowerCase() }),
  ]);
  const projects = useMemo(
    () =>
      _projects.reduce((acc, entity) => {
        const project = getComponentValueStrict(Projects, entity);
        return [...acc, project];
      }, [] as any[]),
    [Projects, _projects]
  );

  useEffect(() => {
    const fetchAllPlants = async () => {
      const allPlants = await Promise.all(
        _plants.map(async (entity) => {
          const plant = getComponentValueStrict(Plants, entity);
          const metadata = plant.ipfsHash
            ? await queryMetadata(plant.ipfsHash as string)
            : await queryIndexedMetadata(
                plant.chainId,
                plant.contractAddress,
                plant.tokenId.toString()
              );
          return {
            ...plant,
            metadata,
            id: entity,
          };
        })
      );
      setGrowingPlants(allPlants);
    };

    fetchAllPlants();
  }, [Plants, _plants]);

  useEffect(() => {
    if (!projects.length || !address || !growingPlants || plants) return;
    setPlants([]);

    const fetchCrosschainPlants = async () => {
      const fetchNfts = async (network: Chain) => {
        const alchemy = new Alchemy(network as any);
        const response = (
          await alchemy.nft.getNftsForOwner(address, {
            contractAddresses: projects.map(
              (project) => project.contractAddress
            ),
          })
        ).ownedNfts;

        // if (network.provider === "ipfs") {
        //   nfts = growingPlants?.map((plant) => {
        //     return plant;
        //   });
        // }
        console.log(growingPlants);
        return response.map((nft) => {
          const growingPlant = growingPlants?.find(
            (plant) =>
              plant.contractAddress.toLowerCase() ===
                nft.contract.address.toLowerCase() &&
              plant.tokenId.toString() === nft.tokenId
          );

          return growingPlant
            ? growingPlant
            : {
                id: entityId(
                  1,
                  nft.contract.address,
                  BigNumber.from(nft.tokenId)
                ),
                chainId: 1,
                contractAddress: nft.contract.address,
                tokenId: BigInt(nft.tokenId),
                metadata: {
                  name: nft.title,
                  description: nft.description,
                  image: nft.media[0].gateway,
                },
                lifecycleStage: 0,
                water: 0,
                sunlight: 0,
                nutrients: 0,
                timestamp: 0,
              };
        });
      };

      const tokens = await fetchNfts(networks[0]);

      setPlants(tokens);
    };

    fetchCrosschainPlants();
  }, [address, growingPlants, plants, projects]);

  return (
    <>
      {/* {growingPlants?.length ? (
        <PhaserComponent
          plants={growingPlants?.filter((p) => p.lifecycleStage > 0)}
        />
      ) : null} */}
      {/* <h1>Growing</h1>
      <div className="plant-grid">
        {growingPlants
          ?.filter((p) => p.lifecycleStage > 0)
          ?.map((plant) => (
            <GrowingPlant plant={plant} key={plant.id} />
          ))}
      </div> */}
      {plants?.some((p) => !growingPlants?.some((gp) => gp.id === p.id)) ? (
        <h1>Seeds</h1>
      ) : null}
      <div className="plant-grid">
        {plants
          ?.filter((p) => !growingPlants?.some((gp) => gp.id === p.id))
          ?.map((plant) => (
            <PlaceablePlant plant={plant} key={plant.id} />
          ))}
      </div>
    </>
  );
};
