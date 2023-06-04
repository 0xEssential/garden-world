import { Tileset } from "../../../../../artTypes/grass";
import { SEED_HUD_NAME, PLANT_HUD_NAME, TILE_WIDTH } from "../constants";
import { PhaserLayer } from "../createPhaserLayer";

import {
  placeIsometricSprite,
  tileCoordToIsometricCoord,
} from "./isometricTileMap";

const gridWidth = 5;
const gridHeight = 5;

const spritesheetKey = "Grass";

export function createMapSystem(layer: PhaserLayer) {
  const {
    scenes: { Main },
  } = layer;

  Main.phaserScene.cameras.main.setBackgroundColor("#276B3A");
  const backgroundLayer = Main.phaserScene.add.layer();

  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      const { screenX, screenY } = tileCoordToIsometricCoord(
        x,
        y,
        Main.phaserScene.cameras.main
      );

      const grass = placeIsometricSprite(
        Main.phaserScene,
        screenX,
        screenY,
        spritesheetKey,
        Tileset.Grass,
        backgroundLayer
      );

      grass.setInteractive({
        draggable: false,
        dropZone: false,
        useHandCursor: true,
        pixelPerfect: true,
        alphaTolerance: 0,
      });

      grass.on("pointerdown", () => {
        const plantHud = Main.phaserScene.children.getByName(PLANT_HUD_NAME);
        (plantHud as Phaser.GameObjects.Container)?.destroy();

        const seedHud = Main.phaserScene.children.getByName(
          SEED_HUD_NAME
        ) as Phaser.GameObjects.Container;

        if (seedHud?.visible) {
          seedHud.setVisible(false);
        } else {
          seedHud.setPosition(
            grass.x + grass.width * 1.5,
            grass.y - grass.height * 2
          );

          const mask = Main.phaserScene.make.graphics(
            {
              fillStyle: { color: 0xffffff },
            },
            true
          );

          mask.fillRect(
            seedHud.x - TILE_WIDTH,
            seedHud.y + 40,
            400, // The width of the mask should match the HUD's width
            260 // The height of the mask should match the HUD's height
          );

          mask.visible = true;
          mask.alpha = 0;

          (seedHud?.getByName("scroll") as any)?.setMask(
            mask &&
              new Phaser.Display.Masks.GeometryMask(Main.phaserScene, mask)
          );

          seedHud.setData("plot", x * 5 + y);

          // Reset the seeds grid Y-coordinate before displaying the HUD
          // currentSeedsY = seedsStartY;

          seedHud?.setVisible(true);

          // Update the plant information in the HUD/UI text element
        }
      });
    }
  }
}
