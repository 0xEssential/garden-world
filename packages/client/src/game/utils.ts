export interface BlockData {
  currentBlock: number;
  growthCycleBlocks: bigint;
  wateredAt: bigint;
}

export const alive = ({
  currentBlock,
  growthCycleBlocks,
  wateredAt,
}: BlockData): boolean => {
  const targetBlock = Number(wateredAt) + Number(growthCycleBlocks);
  return currentBlock < targetBlock;
};

export const deadBlock = ({
  growthCycleBlocks,
  wateredAt,
}: BlockData): number => {
  return Number(wateredAt) + Number(growthCycleBlocks);
};

export const waterableBlock = ({
  currentBlock,
  growthCycleBlocks,
  wateredAt,
}: BlockData): number => {
  return Number(wateredAt) + (Number(growthCycleBlocks) * 3) / 4;
};

export const blocksToWaterable = ({
  currentBlock,
  growthCycleBlocks,
  wateredAt,
}: BlockData): number => {
  return (
    waterableBlock({
      currentBlock,
      growthCycleBlocks,
      wateredAt,
    }) - currentBlock
  );
};

export const waterable = ({
  currentBlock,
  growthCycleBlocks,
  wateredAt,
}: BlockData): boolean => {
  if (!alive({ currentBlock, growthCycleBlocks, wateredAt })) return false;
  const targetBlock = waterableBlock({
    currentBlock,
    growthCycleBlocks,
    wateredAt,
  });
  return currentBlock >= targetBlock;
};

export const fullPercent = ({
  currentBlock,
  growthCycleBlocks,
  wateredAt,
}: BlockData): number => {
  const targetBlock = Number(wateredAt) + Number(growthCycleBlocks);
  const progress = currentBlock - Number(wateredAt);
  const maxProgress = targetBlock - Number(wateredAt);
  let percentage = progress / maxProgress;
  if (percentage > 1) {
    percentage = 1;
  }
  return 1 - percentage;
};

export function isWithinBounds(
  x: number,
  y: number,
  gameObject: Phaser.GameObjects.Container
) {
  const { width, height } = gameObject.getBounds();
  return (
    x >= gameObject.x - width / 2 &&
    x <= gameObject.x + width / 2 &&
    y >= gameObject.y &&
    y <= gameObject.y + height
  );
}

export function loadRemoteSpritesheet(
  url: string,
  key: string,
  frameWidth: number,
  frameHeight: number,
  scene: Phaser.Scene
) {
  return new Promise<void>((resolve, reject) => {
    try {
      if (scene?.textures?.exists(key)) {
        resolve();
        return;
      }

      const loader = new Phaser.Loader.LoaderPlugin(scene);

      loader.spritesheet(key, url, { frameWidth, frameHeight });
      loader.once("complete", () => resolve());
      loader.once("error", (file: File, error: Error) => reject(error));
      loader.start();
    } catch (error) {
      reject(error);
    }
  });
}

export function titleCase(str: string) {
  return str.replace(/[-_]/g, " ").replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
