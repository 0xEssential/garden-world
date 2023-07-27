import { useContractRead } from "wagmi";
import { useMUD } from "../MUDContext";
import { useIPFSMetadata } from "../hooks/useIPFSMetadata";
import abi from "../abis/PlantSpeciesERC721.json";
import { formatEther } from "ethers/lib/utils.js";
import { BigNumber } from "ethers";
import React, { useState } from "react";

export const MintablePlant = ({ project }: { project: any }) => {
  console.warn("project", project);
  const {
    systemCalls: { mintSpecies },
  } = useMUD();
  const [count, setCount] = useState(1);
  const plantContract = {
    chainId: project.chainId,
    address: project.contractAddress,
    abi,
  };

  const { data: mintPrice, error } = useContractRead({
    // contracts: [
    //   {
    ...plantContract,
    functionName: "mintPrice",
    //   },
    //   {
    //     ...plantContract,
    //     functionName: "owner",
    //   },
    // ],
  });

  console.log("error", error);

  const { data: owner } = useContractRead({
    ...plantContract,
    functionName: "owner",
  });

  console.log("data", mintPrice, owner);

  const metadata = useIPFSMetadata(project.ipfsHash);
  console.log("metadata", metadata, project);

  return (
    <div className="plant">
      <div className="plant-image">
        <img src={metadata?.image} />
      </div>
      <div className="plant-info">
        <div key={project.contractAddress}>
          <h2>{metadata?.name}</h2>
          <p>{metadata?.description || <>&nbsp;</>}</p>
          <p>Created by</p>
          <p>{owner as string}</p>
        </div>
      </div>
      <div className="input-row">
        <input
          style={{ width: 40 }}
          type="number"
          value={count}
          onChange={(event) => setCount(parseInt(event.target.value))}
        />
        <button
          onClick={async (event) => {
            event.preventDefault();
            console.log(
              "MINTED!",
              await mintSpecies(
                project.contractAddress,
                mintPrice as bigint,
                count
              )
            );
          }}
        >
          Mint {count} for{" "}
          {mintPrice
            ? `${formatEther((mintPrice as bigint) * BigInt(count))} ETH`
            : "Free"}
        </button>
      </div>
    </div>
  );
};
