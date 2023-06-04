import { useEffect } from "react";
import { useStore } from "../store";
import { PhaserLayer } from "./PhaserLayer";
import { UIRoot } from "./UIRoot";
import { useMUD } from "../../MUDContext";

export const Game = () => {
  const network = useMUD();

  useEffect(() => {
    if (network) {
      useStore.setState({ networkLayer: network });
    }

    return () => network?.world?.dispose();
  }, [network]);

  return (
    <div>
      <PhaserLayer networkLayer={network} />

      <UIRoot />
    </div>
  );
};
