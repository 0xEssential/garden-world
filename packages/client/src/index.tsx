import "./reset.min.css";
import "./globals.css";
import "react-toastify/dist/ReactToastify.minimal.css";

import "@rainbow-me/rainbowkit/styles.css";
import { Slide, ToastContainer } from "react-toastify";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import ReactDOM from "react-dom/client";
import { mount as mountDevTools } from "@latticexyz/dev-tools";
import MUDProvider from "./MUDContext";
import {
  configureChains,
  createClient,
  useAccount,
  useSigner,
  WagmiConfig,
} from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

import { App } from "./App";
import { Botany } from "./Botany";

import {
  darkTheme,
  getDefaultWallets,
  midnightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { EssentialProvider } from "@xessential/react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { arbitrumNova, arbitrumGoerli, foundry, mainnet } from "@wagmi/chains";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Nursery } from "./Nursery";
import { Game } from "./game/ui/Game";
import { useEffect } from "react";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { arbGoerli } from "./mud/arbGoerli";
import { useBurnerWallet } from "./hooks/useBurnerWallet";
import { Login } from "./components/Login";

const infuraName = (chainId: number) => {
  switch (chainId) {
    case 137:
      return "polygon-mainnet";
    case 80001:
      return "polygon-mumbai";
    case 421613:
      return "arbitrum-goerli";
  }
};

const _chains = [arbitrumGoerli];
const { chains, provider } = configureChains(_chains as any, [
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  // infuraProvider({
  //   apiKey: import.meta.env.VITE_INFURA_KEY,
  // }),
  // jsonRpcProvider({
  //   rpc: (chain) =>
  //     chain.id === 42170
  //       ? {
  //           http: `https://nova.arbitrum.io/rpc`,
  //         }
  //       : {
  //           http: `https://${infuraName(chain.id)}.infura.io/v3/${
  //             import.meta.env.VITE_INFURA_KEY
  //           }`,
  //         },
  // }),

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  alchemyProvider({ apiKey: "vmhRKsnCBTvlpFnzQOKRpgz8E1k5NO-N" }),
  // publicProvider(),
]);

const { connectors } = getDefaultWallets({
  appName: "Garden🪻",
  chains,
});

export const client = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <>
    <WagmiConfig client={client}>
      <EssentialProvider
        config={{
          burnerApiKey: import.meta.env.VITE_BURNER_API_KEY,
          burnerApiUrl: "https://burner-auth-api.herokuapp.com/",
          relayerUri:
            "https://api.defender.openzeppelin.com/autotasks/b50e2557-a4c9-4836-9b97-d05d25b32f0f/runs/webhook/8c55425f-87ed-485b-998c-162c3cf2b412/8WNNSvhPzYxU8JNnW3iT2o",
          readProvider: provider,
        }}
      >
        <RainbowKitProvider
          chains={chains}
          theme={midnightTheme({
            accentColor: "#eeee9b",
            accentColorForeground: "#276B3A",
            // borderRadius: "small",
          })}
        >
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            limit={10}
            draggable={false}
            closeButton={false}
            hideProgressBar={true}
            closeOnClick={true}
          />
          <Router>
            <Routes>
              <Route path="/" element={<GameLayout />}>
                <Route path="/" index element={<Game />} />
                <Route path="/nursery" element={<Nursery />} />
              </Route>
              <Route path="/" element={<Layout />}>
                <Route path="/botany" element={<Botany />} />
              </Route>
            </Routes>
          </Router>
        </RainbowKitProvider>
      </EssentialProvider>
    </WagmiConfig>
    {/* {}{" "} */}
  </>
);
// });

function GameLayout() {
  useEffect(() => {
    mountDevTools();
  }, []);

  const burner = useBurnerWallet();
  const signer = useSigner();

  if (burner.loading || signer.isLoading || signer.isRefetching) {
    return null;
  }

  if (!burner.wallet && !signer.data) {
    return <Login />;
  }

  return (
    <>
      <Header />
      <MUDProvider>
        <Outlet />
      </MUDProvider>
      <Footer />
    </>
  );
}

function Layout() {
  const burner = useBurnerWallet();
  const signer = useSigner();

  if (burner.loading || signer.isLoading || signer.isRefetching) {
    return null;
  }

  if (!burner.wallet && !signer.data) {
    return <Login />;
  }

  return (
    <>
      <Header />
      <Outlet />

      <Footer />
    </>
  );
}
