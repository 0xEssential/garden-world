import {
  Entity,
  HasValue,
  NotValue,
  defineExitSystem,
  defineSystem,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { PhaserLayer } from "../createPhaserLayer";
import { SEED_HUD_NAME, THEME, TILE_WIDTH } from "../constants";

import {
  placeIsometricSprite,
  tileCoordToIsometricCoord,
} from "./isometricTileMap";

import { queryMetadata } from "../../../../../hooks/useIPFSMetadata";
import { queryIndexedMetadata } from "../../../../../hooks/useMetadata";

import { alive, deadBlock, loadRemoteSpritesheet } from "../../../../utils";
import { utils } from "ethers";
import { createPlantHUD } from "../components/plantSystemComponents";

let hudContainer: Phaser.GameObjects.Container;
let block: number;
let blockSubscription: any;
const deadBlocks: Record<string, number> = {};

export function createPlantSystem(layer: PhaserLayer) {
  const {
    world,

    networkLayer: {
      components: { Plants, Projects },
      systemCalls: { water, compost },
      network: {
        growerAddress,
        network: { blockNumber$ },
      },
    },
    scenes: { Main },
  } = layer;

  const plantLayer = Main.phaserScene.add.layer();

  blockSubscription?.unsubscribe();
  blockSubscription = blockNumber$.subscribe((_block: number) => {
    block = _block;
    console.log("block", block);
    Object.entries(deadBlocks).forEach(([key, value]) => {
      if (value === block) {
        delete deadBlocks[key];
        const sprite = plantLayer.getByName(key);
        (sprite as Phaser.GameObjects.Sprite).tint = parseInt(
          THEME.accentOrange.replace("#", ""),
          16
        );
      }
    });
  });

  defineExitSystem(
    world,
    [
      HasValue(Plants, { grower: growerAddress?.toLowerCase() }),
      NotValue(Plants, { lifecycleStage: 0 }),
    ],
    ({ entity }) => {
      console.log("exited", entity);

      const sprite = plantLayer.getByName(entity);
      if (sprite) {
        console.warn("destroying sprite", sprite);
        sprite.destroy();
      }
    },
    { runOnInit: false }
  );

  defineSystem(
    world,
    [
      HasValue(Plants, { grower: growerAddress?.toLowerCase() }),
      NotValue(Plants, { lifecycleStage: 0 }),
    ],
    ({ entity }) => {
      const plantData = getComponentValueStrict(Plants, entity);
      const {
        plot,
        lifecycleStage,
        ipfsHash,
        chainId,
        contractAddress,
        tokenId,
      } = plantData as any;

      const projectData = getComponentValueStrict(
        Projects,
        utils.hexZeroPad(contractAddress, 32) as Entity
      );

      const metadata = ipfsHash
        ? queryMetadata(ipfsHash as string)
        : queryIndexedMetadata(chainId, contractAddress, tokenId.toString());

      metadata.then((metadata) => {
        loadRemoteSpritesheet(
          metadata.sprite,
          contractAddress,
          TILE_WIDTH,
          240,
          Main.phaserScene
        ).finally(() => {
          const unpackedX = Math.floor(plot / 5);
          const unpackedY = plot % 5;

          const { screenX, screenY } = tileCoordToIsometricCoord(
            unpackedX,
            unpackedY,
            Main.phaserScene.cameras.main
          );
          const sprite = plantLayer.getByName(entity);
          sprite?.destroy();
          if (lifecycleStage === 0) return;
          const plant = placeIsometricSprite(
            Main.phaserScene,
            screenX,
            screenY,
            contractAddress,
            lifecycleStage - 1,
            plantLayer
          );
          const _alive = alive({
            currentBlock: block,
            growthCycleBlocks: projectData?.growthCycleBlocks as bigint,
            wateredAt: plantData?.wateredAt as bigint,
          });
          console.warn(Number(plantData?.wateredAt));
          if (!_alive) {
            plant.tint = parseInt(THEME.accentOrange.replace("#", ""), 16);
          } else {
            deadBlocks[entity] = deadBlock({
              currentBlock: block,
              growthCycleBlocks: projectData?.growthCycleBlocks as bigint,
              wateredAt: plantData?.wateredAt as bigint,
            });
          }

          plant.setDepth(plot);

          plant.setData(metadata);

          plant.setName(entity);
          plant.setInteractive({
            draggable: false,
            dropZone: false,
            useHandCursor: true,
            pixelPerfect: true,
            alphaTolerance: 0,
          });

          plant.on("pointerover", () => {
            Main.phaserScene.tweens.add({
              targets: plant,
              duration: 60,
              scaleX: 1.02,
              scaleY: 1.02,
              y: plant.y - 2,
            });
          });

          plant.on("pointerout", () => {
            Main.phaserScene.tweens.add({
              targets: plant,
              duration: 80,
              scaleX: 1,
              scaleY: 1,
              y: plant.y + 2,

              onComplete: () => {
                // plant.clearTint();
              },
            });
          });

          plant.on("pointerdown", () => {
            const seedHud = Main.phaserScene.children.getByName(SEED_HUD_NAME);
            (seedHud as Phaser.GameObjects.Container)?.setVisible(false);

            hudContainer?.destroy();

            hudContainer = createPlantHUD(
              Main.phaserScene,
              {
                ...metadata,
                ...plantData,
                block: blockNumber$,
                project: projectData,
              },
              _alive
                ? async () =>
                    water(
                      plantData.chainId,
                      plantData.contractAddress,
                      plantData.tokenId
                    ).then(() => {
                      deadBlocks[entity] =
                        block + Number(projectData.growthCycleBlocks);
                    })
                : async () => {
                    compost(
                      plantData.chainId,
                      plantData.contractAddress,
                      plantData.tokenId
                    );
                  }
            );

            hudContainer.setPosition(
              plant.x + plant.width * 1.2,
              plant.y - plant.height
            );

            hudContainer.setVisible(true);
          });
        });
      });
    }
  );
}
