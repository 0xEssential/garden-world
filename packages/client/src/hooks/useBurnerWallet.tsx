import { EssentialContext, EssentialWalletContext } from "@xessential/react";
import { useContext } from "react";

export function useBurnerWallet() {
  const value = useContext(EssentialWalletContext);
  return value;
}

export function useConfig() {
  const value = useContext(EssentialContext);
  return value;
}
