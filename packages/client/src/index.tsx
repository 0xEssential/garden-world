import "./reset.min.css";
import "./globals.css";
import "react-toastify/dist/ReactToastify.minimal.css";

import "@rainbow-me/rainbowkit/styles.css";
import { ToastContainer } from "react-toastify";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import ReactDOM from "react-dom/client";
import { mount as mountDevTools } from "@latticexyz/dev-tools";
import MUDProvider from "./MUDContext";
import { configureChains, createConfig, mainnet, WagmiConfig } from "wagmi";
import { arbitrumGoerli } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

import { Botany } from "./Botany";

import {
  darkTheme,
  getDefaultWallets,
  midnightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";

import { EssentialProvider } from "@xessential/react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Nursery } from "./Nursery";
import { Game } from "./game/ui/Game";
import { useEffect } from "react";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { useBurnerWallet } from "./hooks/useBurnerWallet";
import { Login } from "./components/Login";
import { useEthersSigner } from "./hooks/useEthersSigner";
import { providers } from "ethers";

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

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, arbitrumGoerli],
  [
    infuraProvider({
      apiKey: import.meta.env.VITE_INFURA_KEY,
    }),
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === 42170) return { http: `https://nova.arbitrum.io/rpc` };
        if (chain.id === 421613)
          return {
            http: `https://still-orbital-slug.arbitrum-goerli.quiknode.pro/34b170f5e28481fbc03288e1993b5968b59f5292/`,
            webSocket:
              "wss://still-orbital-slug.arbitrum-goerli.quiknode.pro/34b170f5e28481fbc03288e1993b5968b59f5292/",
          };

        return {
          http: `https://${infuraName(chain.id)}.infura.io/v3/${
            import.meta.env.VITE_INFURA_KEY
          }`,
        };
      },
    }),
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_KEY }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Zora Crosschain Minting",
  projectId: "41d7b077b5c30858e2c0a119727daa8b",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <>
    <WagmiConfig config={wagmiConfig}>
      <EssentialProvider
        config={{
          burnerApiKey: import.meta.env.VITE_BURNER_API_KEY,
          relayerUri:
            "https://api.defender.openzeppelin.com/autotasks/b50e2557-a4c9-4836-9b97-d05d25b32f0f/runs/webhook/8c55425f-87ed-485b-998c-162c3cf2b412/8WNNSvhPzYxU8JNnW3iT2o",
          readProvider: ({ chainId }) =>
            new providers.JsonRpcProvider(
              `https://${infuraName(chainId)}.infura.io/v3/${
                import.meta.env.VITE_INFURA_KEY
              }`,
              chainId
            ),
        }}
      >
        <RainbowKitProvider
          chains={chains}
          theme={midnightTheme({
            accentColor: "#eeee9b",
            accentColorForeground: "#276B3A",
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
              <Route path="/" element={<DevLayout />}>
                <Route path="/" index element={<Game />} />
                <Route path="/nursery" element={<Nursery />} />
                <Route path="/botany" element={<Botany />} />
              </Route>
            </Routes>
          </Router>
        </RainbowKitProvider>
      </EssentialProvider>
    </WagmiConfig>
  </>
);

function DevLayout() {
  useEffect(() => {
    mountDevTools();
  }, []);

  const burner = useBurnerWallet();
  const signer = useEthersSigner();

  // if (burner.loading || signer.isLoading || signer.isRefetching) {
  //   return null;
  // }

  if (!burner.wallet && !signer) {
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
  const signer = useEthersSigner();

  // if (burner.loading || signer.isLoading || signer.isRefetching) {
  //   return null;
  // }

  if (!burner.wallet && !signer) {
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
