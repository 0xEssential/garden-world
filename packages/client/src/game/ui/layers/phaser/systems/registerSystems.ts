import { PhaserLayer } from "../createPhaserLayer";
import { createCamera } from "./createCamera";
import { createMapSystem } from "./createMapSystem";
import { createPlantSystem } from "./createPlantSystem";
import { createSeedSystem } from "./createSeedSystem";

export const registerSystems = (layer: PhaserLayer) => {
  createCamera(layer);
  createMapSystem(layer);
  createSeedSystem(layer);
  createPlantSystem(layer);
};
