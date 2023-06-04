import { world } from "../../../../mud/world";
import { setup } from "../../../../mud/setup";

export type NetworkLayer = Awaited<ReturnType<typeof createNetworkLayer>>;

export const createNetworkLayer = async ({
  components,
  network: { singletonEntity },
  systemCalls,
}: any) => {
  // Give components a Human-readable ID
  Object.entries(components).forEach(([name, component]) => {
    (component as any).id = name;
  });

  return {
    world,
    singletonEntity,
    systemCalls,
    components,
  };
};
