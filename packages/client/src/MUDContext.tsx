import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { setupNetwork } from "./mud/setupNetwork";
import { createClientComponents } from "./mud/createClientComponents";
import { createSystemCalls } from "./mud/createSystemCalls";

import { useSigner } from "wagmi";
import { Signer } from "ethers";
import { Login } from "./components/Login";
import { useBurnerWallet, useConfig } from "./hooks/useBurnerWallet";
import { SetupResult } from "./mud/setup";

type NetworkSetup = Awaited<ReturnType<typeof setupNetwork>>;
type ComponentSetup = Awaited<ReturnType<typeof createClientComponents>>;
type SystemCallsSetup = ReturnType<typeof createSystemCalls>;

type MUDContextValue = SetupResult & {
  network?: NetworkSetup;
  components?: ComponentSetup;
  systemCalls?: SystemCallsSetup;
  world?: NetworkSetup["world"];
};

const MUDContext = createContext<MUDContextValue>({} as MUDContextValue);

const MUDProvider = ({
  children,
}: {
  children: ReactElement | ReactNode | ReactElement[] | ReactNode[];
}): ReactElement => {
  const [initialized, setInitialized] = useState(false);
  const [components, setComponents] = useState<ComponentSetup>(
    {} as ComponentSetup
  );
  const [network, setNetwork] = useState<NetworkSetup>();
  const [systemCalls, setSystemCalls] = useState<SystemCallsSetup>(
    {} as SystemCallsSetup
  );

  const { data: signer, isLoading } = useSigner();
  const config = useConfig();
  const { wallet, isConnected, loading } = useBurnerWallet();

  useEffect(() => {
    if (signer) {
      setInitialized(false);
      setComponents({} as ComponentSetup);
      setNetwork(undefined);
      setSystemCalls({} as SystemCallsSetup);
    }
  }, [signer]);

  useEffect(() => {
    if (!config.relayerUri || loading || isLoading || (!isConnected && !signer))
      return;
    console.warn("init", signer, wallet, config, isConnected, loading);
    const init = async (c: any, s: any, wallet: any) => {
      const _network = await setupNetwork(c, s, wallet);
      setNetwork(_network);
    };
    init(config, signer as Signer, wallet);
  }, [signer, wallet, config, isConnected, loading, isLoading]);

  useEffect(() => {
    if (!network || initialized) return;
    setComponents(createClientComponents(network));
  }, [network, initialized]);

  useEffect(() => {
    if (!components || !network || initialized) return;
    setSystemCalls(createSystemCalls(network, components));
    setInitialized(true);
  }, [components, network, initialized]);

  // I'm a bit concerned we're doing weird rerender shit with context
  // and the Wagmi / Rainbow / Essential context above.
  console.log("initialized", initialized);

  return (
    <MUDContext.Provider
      value={{
        components,
        network,
        systemCalls,
        world: network?.world,
      }}
    >
      {initialized ? children : <Login />}
    </MUDContext.Provider>
  );
};

const useMUD = () => {
  const value = useContext(MUDContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};

export { MUDContext, useMUD };
export default MUDProvider;
