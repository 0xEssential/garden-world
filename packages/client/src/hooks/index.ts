export type GardenMetadata = {
  name: string;
  description: string;
  image: string;
  gardenImages?: {
    SEED: string;
    GERMINATING: string;
    SEEDLING: string;
    FLOWERING: string;
    DROUGHT_STRESS: string;
    COLD_STRESS: string;
    HEAT_STRESS: string;
    PEST_ATTACK: string;
    NUTRIENT_DEFICIENCY: string;
  };
};

export enum LifecycleStage {
  "SEED",
  "SEEDLING",
  "BUD",
  "COMMON_FLOWER",
  "UNCOMMON_FLOWER",
  "RARE_FLOWER",
  "LEGENDARY_FLOWER",
}
