import { TILE_WIDTH, TILE_HEIGHT } from "../constants";

export function mapStartingBounds(camera: Phaser.Cameras.Scene2D.Camera) {
  const centerX = camera.centerX;
  const centerY = camera.centerY;

  const startX = centerX - TILE_WIDTH / 2;
  const startY = centerY - TILE_HEIGHT * 2;
  return { startX, startY };
}

export function tileCoordToIsometricCoord(
  x: number,
  y: number,
  camera: Phaser.Cameras.Scene2D.Camera,
  tileHeight = TILE_HEIGHT
) {
  const { startX, startY } = mapStartingBounds(camera);
  const screenX = startX + (x - y) * (TILE_WIDTH / 2);
  const screenY = startY + (x + y) * (tileHeight / 2);
  return { screenX, screenY };
}

export function placeIsometricSprite(
  scene: Phaser.Scene,
  x: number,
  y: number,
  tilesetKey: any,
  tileKey: any,
  layer: any
): Phaser.GameObjects.Sprite {
  const sprite = scene.add.sprite(x, y, tilesetKey, tileKey);
  sprite.setOrigin(0.5, 1);
  // sprite.setDepth(y * 5);
  return layer.add(sprite);
}
