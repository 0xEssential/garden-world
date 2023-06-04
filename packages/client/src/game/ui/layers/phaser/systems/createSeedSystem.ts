import { TILE_HEIGHT, TILE_WIDTH, SEED_HUD_NAME, THEME } from "../constants";
import { PhaserLayer } from "../createPhaserLayer";
import {
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { queryMetadata } from "../../../../../hooks/useIPFSMetadata";
import { queryIndexedMetadata } from "../../../../../hooks/useMetadata";
import { closeButton } from "../../../huds";
import { isWithinBounds, loadRemoteSpritesheet } from "../../../../utils";

let hudText: Phaser.GameObjects.Text;
let hudBackground: Phaser.GameObjects.Rectangle;
let mask: Phaser.GameObjects.Graphics;
let scrollbar: Phaser.GameObjects.Rectangle;
let seedsStartY: number;
let currentSeedsY: number;
let seedsDragStartY: number;
let hud: Phaser.GameObjects.Container;
let seeds: any[] = [];

const seedEntities: any[] = [];

async function loadSeedData(seed: any, scene: Phaser.Scene) {
  if (!scene) return;

  const metadata = seed.ipfsHash
    ? await queryMetadata(seed.ipfsHash as string)
    : await queryIndexedMetadata(
        seed.chainId as number,
        seed.contractAddress as string,
        (seed.tokenId as bigint).toString()
      );

  await loadRemoteSpritesheet(
    metadata.sprite,
    seed.contractAddress as string,
    TILE_WIDTH,
    240,
    scene
  ).catch((e) => {
    console.error("error loading seed spritesheet", e);
  });

  return { ...seed, metadata };
}

function createSeedElement(
  scene: Phaser.Scene,
  seed: any,
  x: number,
  y: number,
  width: number,
  height: number,
  onClick: (args: any) => void
): Phaser.GameObjects.Container {
  const seedElement = scene.add.container(x, y);

  const sprite = scene.add.sprite(0, height / 4 - 20, seed.contractAddress, 2);
  sprite.setOrigin(0.5, 1);
  sprite.scale = 0.35;

  seedElement.add(sprite);
  const seedNameText = scene.add
    .text(0, height / 4 - 2, seed.metadata.name, {
      fontSize: "1rem",
      fontFamily: "Open Sans",
      color: THEME.deepGreen,
    })
    .setOrigin(0.5);
  seedElement.add(seedNameText);

  sprite.setInteractive({
    useHandCursor: true,
  });
  sprite.on("pointerover", () => {
    sprite.setScale(0.4);
  });

  sprite.on("pointerout", () => {
    sprite.setScale(0.35);
  });
  sprite.on("pointerdown", () => {
    const plot = hud.getData("plot");
    onClick({
      chainId: seed.chainId,
      contractAddress: seed.contractAddress,
      tokenId: seed.tokenId,
      plot,
    });
  });
  return seedElement;
}

// function setupScrollEvents() {
//   hudContainer.setInteractive(
//     new Phaser.Geom.Rectangle(
//       -hudBackground.width / 2,
//       -hudBackground.height / 2,
//       hudBackground.width,
//       hudBackground.height
//     ),
//     Phaser.Geom.Rectangle.Contains
//   );

//   hudContainer.on("pointerdown", (pointer: any) => {
//     seedsDragStartY = pointer.y;
//   });

//   hudContainer.on("pointermove", (pointer: any) => {
//     if (!pointer.isDown) return;

//     const dy = pointer.y - seedsDragStartY;
//     currentSeedsY += dy;

//     // Bounds checking
//     const minY = seedsStartY;
//     const maxY = -seedsStartY;

//     currentSeedsY = Math.min(maxY, Math.max(minY, currentSeedsY));

//     // Update seed elements position
//     hudContainer.iterate(
//       (child: Phaser.GameObjects.Text | Phaser.GameObjects.Rectangle) => {
//         if (
//           child !== hudBackground &&
//           child !== hudText &&
//           child !== scrollbar
//         ) {
//           child.setY(currentSeedsY);
//         }
//       }
//     );

//     // Update scrollbar position
//     scrollbar.setY(
//       ((currentSeedsY - minY) / (maxY - minY)) *
//         (hudBackground.height - scrollbar.height * 2) -
//         hudBackground.height / 2
//     );

//     seedsDragStartY = pointer.y;

//     // Stop the event from propagating to other objects
//     pointer.event.stopPropagation();
//   });
// }

function addSeedToGrid(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  seed: any,
  onClick: any,
  index: number
) {
  const columnCount = 2;
  const padding = 10;
  const elementWidth =
    (hudBackground.width - padding * (columnCount + 1)) / columnCount;
  const elementHeight = 100;

  seedsStartY = 40;

  const column = index % columnCount;
  const row = Math.floor(index / columnCount);

  const x =
    -hudBackground.width / 2 +
    padding +
    column * (elementWidth + padding) +
    elementWidth / 2;
  const y =
    seedsStartY + padding + row * (elementHeight + padding) + elementHeight / 2;

  // Create seed element
  const seedElement = createSeedElement(
    scene,
    seed,
    x,
    y,
    elementWidth,
    elementHeight,
    onClick
  );

  seedElement.setName(seed.id);

  // Add seed element to the hudContainer
  (container.getByName("scroll") as Phaser.GameObjects.Container)?.add(
    seedElement
  );
}

function createHUD(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const hudContainer = scene.add.container(TILE_WIDTH * 2, TILE_HEIGHT * 3);
  hudContainer.setVisible(false);
  hudContainer.setDepth(1000);
  hudContainer.name = SEED_HUD_NAME;
  // Create a background rectangle
  hudBackground = scene.add.rectangle(
    0,
    0,
    TILE_WIDTH * 2,
    TILE_HEIGHT * 3,
    0xeeee9b
  );
  // hudBackground.setAlpha(0.5);
  hudBackground.setOrigin(0.5, 0);

  // Create the text element
  hudText = scene.add.text(0, 10, "Grow", {
    fontSize: "24px",
    color: THEME.deepGreen,
    fontFamily: "Montserrat",
  });
  hudText.setOrigin(0.5, 0);
  hudText.autoRound = true;
  hudText.scale = 1;
  // Add UI elements to the container
  const scrollableContainer = scene.add.container(
    hudContainer.width,
    hudContainer.height
  );
  // scrollableContainer.setOrigin(0.5, 0);

  scrollableContainer.setName("scroll");

  hudContainer?.add([hudBackground, hudText]);
  closeButton(scene, hudContainer, hudBackground);
  hudContainer?.add(scrollableContainer);

  mask = scene.make.graphics(
    {
      fillStyle: { color: 0xffffff },
    },
    true
  );
  mask.setName("scrollMask");

  mask.fillRect(
    scrollableContainer.x, // Start at the left edge of the HUD
    scrollableContainer.y, // Start at the top edge of the HUD, if you want some padding, you could use paddingTop value instead of 0
    400, // The width of the mask should match the HUD's width
    400 // The height of the mask should match the HUD's height
  );
  mask.visible = true;
  mask.alpha = 0;

  scrollableContainer.setMask(
    new Phaser.Display.Masks.GeometryMask(scene, mask)
  );

  // Create a scrollbar
  scrollbar = scene.add
    .rectangle(
      hudBackground.width / 2 - 4,
      40,
      4,
      hudBackground.height - 48,
      0xffffff
    )
    .setOrigin(1, 0);
  hudContainer.add(scrollbar);

  // Initialize scroll variables
  seedsStartY = currentSeedsY = 40;
  seedsDragStartY = 0;

  // Setup scroll events
  // setupScrollEvents();

  scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    if (
      !hudContainer.visible ||
      isWithinBounds(pointer.x, pointer.y, hudContainer)
    ) {
      return;
    }
    hudContainer.setVisible(false);
  });

  return hudContainer;
}

export function createSeedSystem(layer: PhaserLayer) {
  const {
    scenes: {
      Main,
      Main: { objectPool },
    },
    networkLayer: {
      components: { Plants },
      network: { growerAddress },
      systemCalls: { plantSeed },
      world,
    },
  } = layer;

  // if (Main.phaserScene) {
  hud = createHUD(Main.phaserScene);
  // }
  console.log(seeds);
  defineEnterSystem(
    world,
    [
      HasValue(Plants, {
        grower: growerAddress?.toLowerCase(),
        lifecycleStage: 0,
      }),
    ],
    async ({ entity }) => {
      console.warn("defineEnterSystem", entity);
      console.warn(Main.phaserScene);
      const seed = getComponentValueStrict(Plants, entity);
      await loadSeedData(seed, Main.phaserScene).then((seedWithMetadata) => {
        const plantSeedOnClick = async (args: any) => {
          await plantSeed(
            args.chainId,
            args.contractAddress,
            args.tokenId,
            args.plot
          );
        };

        addSeedToGrid(
          Main.phaserScene,
          hud,
          { ...seedWithMetadata, id: entity },
          plantSeedOnClick,
          seeds.length
        );
        seeds.push({ ...seedWithMetadata, id: entity });
      });
    },
    { runOnInit: true }
  );

  defineExitSystem(
    world,
    [
      HasValue(Plants, {
        grower: growerAddress?.toLowerCase(),
        lifecycleStage: 0,
      }),
    ],
    ({ entity }) => {
      console.log({ hud });
      // destroy and recreate hud
      hud?.setVisible(false);
      hud?.destroy();
      hud = createHUD(Main.phaserScene);

      console.warn("defineExitSystem", entity);
      // remove seed from cache
      seeds = seeds.filter((seed: any) => seed.id !== entity);

      seeds.forEach((seed: any, index: number) => {
        const plantSeedOnClick = async (args: any) => {
          await plantSeed(
            args.chainId,
            args.contractAddress,
            args.tokenId,
            args.plot
          );
        };
        addSeedToGrid(Main.phaserScene, hud, seed, plantSeedOnClick, index);
      });
    },
    { runOnInit: false }
  );
}
