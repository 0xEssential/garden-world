import { PLANT_HUD_NAME, THEME, TILE_HEIGHT, TILE_WIDTH } from "../constants";

import { closeButton } from "../../../huds";
import { secondsToDaysHours } from "../../../../../Botany";
import {
  alive,
  fullPercent,
  isWithinBounds,
  titleCase,
  waterable,
} from "../../../../utils";
import { LifecycleStage } from "../../../../../hooks";

let scene: Phaser.Scene;
let hudContainer: Phaser.GameObjects.Container;
let hudText: Phaser.GameObjects.Text;
let hudBackground: Phaser.GameObjects.Rectangle;
let block: number;
let blockSubscription: any;

export function createPlantHUD(
  scene: Phaser.Scene,
  plant: any,
  onClick: () => Promise<void>
) {
  hudContainer = scene.add.container(TILE_WIDTH * 2, TILE_HEIGHT * 3);
  hudContainer.setVisible(false);
  hudContainer.setDepth(1000);
  hudContainer.name = PLANT_HUD_NAME;
  // Create a background rectangle
  // var rect = scene.add.rexRoundRectangle(
  //   x,
  //   y,
  //   width,
  //   height,
  //   radius,
  //   fillColor,
  //   fillAlpha
  // );

  const hudBorder = scene.add.rectangle(
    0,
    0,
    TILE_WIDTH * 2 + 4,
    148,
    parseInt(THEME.earthyBrown.replace("#", "0x"), 16)
  );
  hudBorder.setOrigin(0.5, 0);

  hudBackground = scene.add.rectangle(0, 2, TILE_WIDTH * 2, 144, 0xeeee9b);
  hudBackground.setOrigin(0.5, 0);

  // Image
  // const sprite = scene.add.sprite(
  //   hudBackground.x - hudBackground.width / 2 + 16,
  //   hudBackground.y + 16,
  //   plant.contractAddress,
  //   plant.lifecycleStage - 1
  // );
  // sprite.setOrigin(0, 0.5);
  // sprite.scale = 0.35;

  // Title
  hudText = scene.add.text(8, 28, plant.name, {
    fontSize: "28px",
    color: THEME.deepGreen,
    fontFamily: "Montserrat",
  });
  hudText.setOrigin(0.5, 0.5);
  hudText.width = 80;
  // Growth stage
  const stage = scene.add.text(
    -TILE_WIDTH / 2,
    50,
    titleCase(LifecycleStage[plant.lifecycleStage]),
    {
      fontSize: "12px",
      color: THEME.earthyBrown,
      fontFamily: "Montserrat",
    }
  );
  stage.width = TILE_WIDTH / 2;
  stage.setOrigin(0.5, 0);

  // Age
  const age = scene.add.text(
    TILE_WIDTH / 2,
    50,
    secondsToDaysHours(Number(plant?.plantedAt)),
    {
      fontSize: "12px",
      color: THEME.earthyBrown,
      fontFamily: "Montserrat",
    }
  );
  age.width = TILE_WIDTH / 2;

  age.setOrigin(0.5, 0);

  // hudText.autoRound = true;
  // Add rows of text/number data

  // Separator
  const separator = scene.add.rectangle(
    24 - TILE_WIDTH,
    70,
    TILE_WIDTH * 2 - 48,
    2,
    parseInt(THEME.deepGreen.replace("#", ""), 16)
  );
  separator.setOrigin(0, 0);

  // Add UI elements to the container
  hudContainer.add([
    hudBorder,
    hudBackground,
    hudText,
    stage,
    age,
    // sprite,
    separator,
  ]);
  closeButton(scene, hudContainer, hudBackground);

  // Add a progress bar for water level
  const progressBarWidth = hudBackground.width * 0.8;
  const progressBarHeight = 17;
  const progressBarBackground = scene.add.rectangle(
    0,
    88,
    progressBarWidth,
    progressBarHeight,
    parseInt(THEME.earthyBrown.replace("#", ""), 16)
  );

  const waterableIndicator = scene.add.rectangle(
    -progressBarWidth / 4,
    88,
    2,
    progressBarHeight,
    parseInt(THEME.lightGreen.replace("#", ""), 16)
  );
  waterableIndicator.setOrigin(0, 0.5);

  const progressBar = scene.add.rectangle(
    progressBarBackground.x - progressBarBackground.width / 2,
    progressBarBackground.y,
    0,
    progressBarHeight,
    0x3399ff
  );
  progressBar.setOrigin(0.5, 0.5);

  // Create the "Water" button
  const waterButton = scene.add
    .rectangle(
      0,
      0,
      progressBarWidth,
      27,
      parseInt(THEME.accentOrange.replace("#", ""), 16)
    )
    .setOrigin(0.5, 0)
    .on("pointerdown", () => {
      console.log("Water button clicked");
      onClick?.()?.then(() => {
        console.log("Watered");
        hudContainer.destroy();
        // hudContainer = createPlantHUD(scene, plant, onClick);
        // hudContainer.setVisible(true);
        // progressBar.width = progressBarWidth;
      });
    });
  const waterButtonContainer = scene.add.container(0, 104);
  waterButtonContainer.add(waterButton);
  const waterButtonText = scene.add
    .text(0, 13, "", {
      fontSize: "12px",
      color: "white",
      backgroundColor: THEME.accentOrange,
      fontFamily: "Montserrat",
    })
    .setOrigin(0.5, 0.5);

  // Enable/disable the Water button based on the condition
  let isWaterButtonEnabled = false;
  const subscribe = plant?.block.subscribe((block: number) => {
    progressBar.width =
      progressBarWidth *
      fullPercent({
        currentBlock: block,
        growthCycleBlocks: plant?.project?.growthCycleBlocks,
        wateredAt: plant?.wateredAt,
      });

    const _alive = alive({
      wateredAt: plant?.wateredAt,
      currentBlock: block,
      growthCycleBlocks: plant?.project?.growthCycleBlocks,
    });

    isWaterButtonEnabled =
      !_alive ||
      waterable({
        currentBlock: block,
        growthCycleBlocks: plant?.project?.growthCycleBlocks,
        wateredAt: plant?.wateredAt,
      });

    waterButtonText.text = _alive ? "Water" : "Compost";

    // waterButtonContainer.visible = isWaterButtonEnabled;
    if (waterButton?.input) waterButton.input.enabled = isWaterButtonEnabled;
    waterButton.setInteractive({
      useHandCursor: isWaterButtonEnabled,
    });

    age.text = _alive
      ? secondsToDaysHours(block - Number(plant?.plantedAt))
      : "Dead";
  });
  waterButtonContainer.add(waterButtonText);
  // Add the UI elements to the container
  hudContainer.add([
    progressBarBackground,
    progressBar,
    waterableIndicator,
    waterButtonContainer,
  ]);
  hudBackground.setInteractive({ useHandCursor: false });

  const handler = scene.input.on(
    "pointerdown",
    (pointer: Phaser.Input.Pointer) => {
      if (
        !hudContainer.visible ||
        isWithinBounds(pointer.x, pointer.y, hudContainer)
      ) {
        return;
      }
      // hudContainer.setVisible(false);
    }
  );
  hudContainer.on("destroy", () => {
    subscribe?.unsubscribe();
    handler.removeListener("pointerdown");
  });

  return hudContainer;
}
