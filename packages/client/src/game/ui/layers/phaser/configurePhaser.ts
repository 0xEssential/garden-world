import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";

import { TileAnimations, Tileset } from "../../../../artTypes/grass";
import { Assets, Maps, Scenes, TILE_HEIGHT, TILE_WIDTH } from "./constants";

const ANIMATION_INTERVAL = 200;

const mainMap = {
  chunkSize: 8160, // tile size * tile amount
  tileWidth: TILE_WIDTH,
  tileHeight: TILE_HEIGHT,
  backgroundTile: [Tileset.Grass],
  animationInterval: ANIMATION_INTERVAL,
  tileAnimations: TileAnimations,
  layers: {
    layers: {
      Background: { tilesets: ["Default", "Grass"] },
      Foreground: { tilesets: ["Default", "Grass"] },
    },
    // defaultLayer: "Background",
  },
};

export const phaserConfig = {
  pixelArt: false,
  type: Phaser.AUTO,
  // plugins: {
  //   global: [
  //     {
  //       key: "rexRoundRectanglePlugin",
  //       plugin: RoundRectanglePlugin,
  //       start: true,
  //     },
  //     // ...
  //   ],
  // },
  sceneConfig: {
    [Scenes.Main]: defineSceneConfig({
      assets: {
        // [Assets.Tileset]: {
        //   type: AssetType.Image,
        //   key: Assets.Tileset,
        //   path: grassTileset,
        // },
        closeButton: {
          type: AssetType.Image,
          key: "closeButton",
          path: "assets/close.png",
        },
        Grass: {
          key: Assets.Grass,
          type: AssetType.SpriteSheet,
          path: "assets/tilesets/grass.png",
          options: {
            frameWidth: TILE_WIDTH,
            frameHeight: TILE_HEIGHT,
          },
        },
      },
      maps: {
        [Maps.Main]: mainMap,
      },
      animations: [],
      tilesets: [],
    }),
  },
  scale: defineScaleConfig({
    parent: "phaser-game",
    zoom: 1,
    mode: Phaser.Scale.NONE,
    scale: 1,
  }),
  cameraConfig: defineCameraConfig({
    pinchSpeed: 1,
    wheelSpeed: 1,
    maxZoom: 1,
    minZoom: 1,
  }),

  cullingChunkSize: 8160,
};
