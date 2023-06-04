import { mudConfig } from "@latticexyz/world/register";
import "@latticexyz/world/snapsync";

export default mudConfig({
  snapSync: true,
  worldContractName: "GlobalEntryWorld",
  systems: {
    PlantSystem: {
      name: "PlantSystem",
      openAccess: true,
    },
    ProjectSystem: {
      name: "ProjectSystem",
      openAccess: true,
    },
    SpeciesSystem: {
      name: "SpeciesSystem",
      openAccess: true,
    },
  },
  enums: {
    PlantLifecycleStage: [
      "SEED",
      "SEEDLING",
      "BUD",
      "COMMON_FLOWER",
      "UNCOMMON_FLOWER",
      "RARE_FLOWER",
      "LEGENDARY_FLOWER",
    ],
  },
  tables: {
    Plants: {
      schema: {
        chainId: "uint32",
        contractAddress: "address",
        tokenId: "uint256",
        grower: "address",
        plot: "uint8",
        plantedAt: "uint256",
        wateredAt: "uint256",
        entropy: "uint256",
        lifecycleStage: "PlantLifecycleStage",
        ipfsHash: "string",
      },
      keySchema: {
        chainId_: "uint32",
        contractAddress_: "address",
        tokenId_: "uint256",
      },
    },
    Projects: {
      schema: {
        growthCycleBlocks: "uint256",
        lifecycleLength: "uint8",
        name: "string",
        ipfsHash: "string",
      },
    },
  },
  modules: [
    {
      name: "UniqueEntityModule",
      root: true,
      args: [],
    },
  ],
});
