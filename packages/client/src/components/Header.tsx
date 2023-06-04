import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import styled from "styled-components";
import { TbKey } from "react-icons/tb";
import { EssentialWalletContext, useDelegatedAccount } from "@xessential/react";
import { THEME } from "../game/ui/layers/phaser/constants";
import { useContext, useState } from "react";
import { Modal } from "./Modal";
import { BurnerForm } from "./BurnerForm";
import Delegate from "./Delegate";
import { useBurnerWallet } from "../hooks/useBurnerWallet";
export const Header = () => {
  const { address } = useDelegatedAccount();
  const { wallet } = useBurnerWallet();
  const [keysModalOpen, setKeysModalOpen] = useState(false);
  return (
    <div>
      <Container>
        <h1>
          <Link to="/">🪻Garden</Link>
        </h1>
        <div>
          {address ? (
            <div className="keysButton" onClick={() => setKeysModalOpen(true)}>
              <TbKey color={wallet ? THEME.lightGreen : THEME.accentOrange} />
            </div>
          ) : null}
          <ConnectButton
            showBalance={false}
            chainStatus={{ smallScreen: "none", largeScreen: "icon" }}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </Container>
      <Modal isOpen={keysModalOpen} onClose={() => setKeysModalOpen(false)}>
        <ModalBody>
          <h3>Signing keys</h3>
          <p>Create an account to garden without wallet popups</p>
          {wallet ? <Delegate /> : <BurnerForm />}
        </ModalBody>
      </Modal>
    </div>
  );
};

const Container = styled.nav`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.6em 1em;
  position: fixed;
  width: 100%;
  top: 0;

  h1 {
    font-size: 1.8em;
  }

  div {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .keysButton {
    background-color: var(--rk-colors-connectButtonBackground);
    color: var(--rk-colors-connectButtonText);
    box-shadow: var(--rk-shadows-connectButton);
    transition: 0.125s ease;
    padding: 10px 12px;
    border-radius: var(--rk-radii-connectButton);
    font-family: var(--rk-fonts-body);
    cursor: pointer;
    gap: 6px;
    display: flex;
    font-weight: 700;
    border-width: 2px;
    border-style: solid;
    border: 0;
    height: 40px;
  }
  .keysButton:hover {
    scale: 1.025;
  }
`;

const ModalBody = styled.div`
  color: var(--deep-green);

  h3,
  p {
    color: var(--deep-green);
  }
`;
