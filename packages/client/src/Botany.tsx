import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Has, getComponentValueStrict } from "@latticexyz/recs";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { FileUpload } from "./components/FileUpload";
import { useState } from "react";
import { parseEther } from "ethers/lib/utils.js";

export function secondsToDaysHours(seconds: number, singular = false) {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const daysStr = days === 1 || singular ? "day" : "days";
  const hoursStr = hours === 1 || singular ? "hour" : "hours";
  const minutesStr = minutes === 1 || singular ? "minute" : "minutes";
  if (!days && !hours) return `${minutes} ${minutesStr}`; // less than an hour (or less
  if (!days) return `${hours} ${hoursStr}`; // only hours (or less
  if (!hours) return `${days} ${daysStr}`;
  return `${days} ${daysStr} and ${hours} ${hoursStr}`;
}
const images = ["image", "sprite"];

async function uploadFiles(
  files: File[],
  _metadata: Record<string, string>
): Promise<string> {
  const url = "https://api.nft.storage/upload";

  // Create FormData object
  let formData = new FormData();

  // Add each file to FormData with 'file' as name and the filename
  for (const file of files) {
    formData.append("file", file, file.name);
  }

  // Send POST request with FormData as body and Content-Type header
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQwN2I4Yjc0RURGQzUyM0IwM2MyYWQ3OTM2Q0MwZGUwMjk4MjQ0RmEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4NDYwMjQ0MTE3NSwibmFtZSI6ImdhcmRlbiJ9.p5E8ceRFFHWMUYc46SBRxsy-5Ds_Wv5kHvREeLEX3m4`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error uploading files: ${response.statusText}`);
  }

  const pinData = await response.json();

  const metadata = {
    ..._metadata,
    image: "ipfs://" + pinData.value.cid + "/image.png",
    sprite: "ipfs://" + pinData.value.cid + "/sprite.png",
  };

  // Send POST request with FormData as body and Content-Type header
  const metadataResponse = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQwN2I4Yjc0RURGQzUyM0IwM2MyYWQ3OTM2Q0MwZGUwMjk4MjQ0RmEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4NDYwMjQ0MTE3NSwibmFtZSI6ImdhcmRlbiJ9.p5E8ceRFFHWMUYc46SBRxsy-5Ds_Wv5kHvREeLEX3m4`,
    },
    body: new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  });
  if (!metadataResponse.ok) {
    throw new Error(`Error uploading files: ${response.statusText}`);
  }

  const json = await metadataResponse.json();
  console.log("Metadata:", json);
  return json.value.cid;
}

export const Botany = () => {
  const [files, setFiles] = useState<File[]>([]);
  const {
    systemCalls: { deploySpecies },
  } = useMUD();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [mintPrice, setMintPrice] = useState("0.01");
  const [totalSupply, setTotalSupply] = useState(10000);

  const [growthCycleBlocks, setGrowthCycleBlocks] = useState(302400);
  const [lifecycleLength, setLifecycleLength] = useState(3);
  return (
    <div className="form">
      <h1>Create a Plant</h1>
      <h2>Your own NFT varietal that anyone can grow</h2>
      <div className="form-section">
        <p>🌼 Deployed as a standalone ERC721 contract that you own</p>
        <p>🌼 Immediately available in our nursery for minting</p>
        <p>
          🌼 No charge - just pay gas to deploy on Arbitrum Nova. You may need
          to{" "}
          <a
            href="https://bridge.arbitrum.io/?l2ChainId=42170"
            target="_blank"
            rel="noreferrer"
          >
            bridge ETH
          </a>
          .
        </p>

        <p>
          🌼 Set mint price and total supply - we charge 2% on each mint, you
          get the rest
        </p>
        <p>🌼 Up to 4 rarity tiers - we handle the randomness</p>
      </div>

      <h3>Game Art</h3>
      <div className="form-section">
        <p>
          Upload a spritesheet that shows your plant in various states and
          rarities. We pin your spritesheet to IPFS alongside your NFT metadata.
        </p>
        <p>
          See our <a>Figma template</a> for creating your spritesheet.
        </p>

        <FileUpload
          filename={"sprite"}
          onSelected={(filename, file) => {
            const fileWithFilename = new File([file], "sprite.png");
            console.warn("File selected", filename, file);
            setFiles([...files, fileWithFilename]);
          }}
        />
      </div>

      <h3>Game Logic</h3>
      <div className="form-section">
        <p>
          <code>GROWTH_CYCLE_BLOCKS</code> determines how often a plant must be
          watered. Players can only water a plant after 75% of{" "}
          <code>GROWTH_CYCLE_BLOCKS</code> have elapsed since last watered. If{" "}
          <code>GROWTH_CYCLE_BLOCKS</code> pass between waterings, the plant
          dies.
        </p>
        <div className="input">
          <label htmlFor="logic">Growth Cycle Blocks</label>
          <input
            id="logic"
            type="number"
            value={growthCycleBlocks}
            onChange={(event) => setGrowthCycleBlocks(event.target.value)}
          />
          <small>
            About {secondsToDaysHours(growthCycleBlocks * 2)} with a{" "}
            {secondsToDaysHours(growthCycleBlocks * 2 * 0.25, true)} watering
            window
          </small>
        </div>
        <p>
          Plants go through lifecycle stages from <code>GERMINATING</code> to{" "}
          <code>SEEDLING</code> to <code>FLOWERING</code>.
        </p>
        <p>
          Lifecycle Length is the number of times a plant must be watered to
          progress to the next stage.
        </p>
        <p>
          If your plant has rarity levels, rarity is reveaaled on progressing to
          the <code>FLOWERING</code> stage.
        </p>{" "}
        <div className="input">
          <label htmlFor="logic">Lifecycle Length</label>
          <input
            id="logic"
            type="number"
            value={lifecycleLength}
            onChange={(event) => setLifecycleLength(event.target.value)}
          />
          <small></small>
        </div>
      </div>
      <h3>Metadata</h3>
      <div className="form-section">
        <p>
          Every token from your collection will have the same metadata, so
          marketplaces will not reflect game state for a token.
        </p>
        <div className="input-row">
          <div className="input">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Flower"
            />
          </div>

          <div className="input">
            <label htmlFor="symbol">Symbol</label>
            <input
              id="symbol"
              type="text"
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="FLWR"
            />
          </div>
        </div>

        <div className="input">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div>
          <FileUpload
            filename="image"
            onSelected={(filename, file) => {
              const fileWithFilename = new File([file], "image.png");
              console.warn("File selected", filename, file);
              setFiles([...files, fileWithFilename]);
            }}
          />
          <small>
            Image in token metadata - we recommend using a seed packet or
            composite image rather than game art
          </small>
        </div>
      </div>

      <h3>Mint Settings</h3>
      <div className="form-section">
        <p>
          Set your mint cost and maximum supply. You own the contract, so can
          manage it on marketplaces to set royalties or create your own mint
          site.
        </p>

        <div className="input-row">
          <div className="input">
            <label htmlFor="mintPrice">Mint Price</label>
            <input
              id="mintPrice"
              type="text"
              value={mintPrice}
              onChange={(event) => setMintPrice(event.target.value)}
              placeholder="0.01"
            />
            ETH
          </div>
          <div className="input">
            <label htmlFor="mintPrice">Total Supply</label>
            <input
              id="totalSupply"
              type="number"
              value={totalSupply}
              onChange={(event) => setTotalSupply(event.target.value)}
              placeholder="10000"
            />
          </div>
        </div>
        <small>We charge a 2% fee on minting</small>
      </div>

      <button
        className="button"
        onClick={async (event) => {
          event.preventDefault();
          const ipfsHash = await uploadFiles(files, {
            name,
            symbol,
            description,
          });
          console.log("IPFS Hash:", ipfsHash);
          console.log(
            "Deployed to:",
            await deploySpecies(
              ipfsHash,
              name,
              symbol,
              parseEther(mintPrice),
              growthCycleBlocks,
              lifecycleLength
            )
          );
        }}
      >
        Create Species
      </button>
    </div>
  );
};
