import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState } from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { useBurnerWallet } from "../hooks/useBurnerWallet";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [creating, setCreating] = useState(true);

  const { address } = useAccount();
  const { wallet, createAccount, login, error, loading } = useBurnerWallet();

  return (
    <Container>
      <h1>Gardano</h1>
      <p>Create a free account, or connect your web3 wallet to start sowing</p>
      <div>
        <>
          <form
            className="flex w-full flex-col items-center justify-between space-y-2 text-black"
            onSubmit={(e) => e.preventDefault()}
          >
            {error ? (
              <p className="text-center font-ArialNarrowerStd text-xl text-red">
                {error.message}
              </p>
            ) : (
              <p className="font-ArialNarrowerStd text-white"></p>
            )}

            <input
              required
              type="text"
              className="w-full p-1"
              placeholder="username or email"
              value={username}
              onChange={({ target: { value } }) => setUsername(value)}
            ></input>
            <input
              required
              className="w-full p-1"
              type="password"
              placeholder="password"
              onChange={({ target: { value } }) => setPassword(value)}
            ></input>
            {creating ? (
              <input
                required={creating}
                className="w-full p-1"
                type="password"
                placeholder="confirm password"
                onChange={({ target: { value } }) => setConfirmPassword(value)}
              ></input>
            ) : null}
            <button
              className="button"
              onClick={async () => {
                if (creating) {
                  createAccount({
                    username,
                    password,
                    passwordConfirmation: confirmPassword,
                  });
                }
                login({ username, password });
              }}
            >
              {creating ? "Create Account" : "Login"}
            </button>
            <small>
              {creating ? "Have" : "Need"} an account?{" "}
              <a onClick={() => setCreating((c) => !c)}>
                {creating ? "Sign in" : "Register"}
              </a>
            </small>
          </form>
        </>
        <>
          <form className="connect">
            {!address ? (
              <ConnectButton
                showBalance={false}
                accountStatus="avatar"
                chainStatus="none"
              />
            ) : (
              <p>Connecting...</p>
            )}
          </form>
        </>
      </div>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 80%;
  position: absolute;
  background-color: var(--deep-green);
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;
  transition: all 2s ease;
  grid-gap: 50px;
  z-index: 100;

  p {
    color: var(--off-white);
  }
  div {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
  }

  form {
    border: 1px solid var(--off-white);
    padding: 16px 18px;
    border-radius: 8px;
    width: 300px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  input {
    border-bottom: 2px solid var(--off-white);

    color: var(--off-white);
  }

  input::placeholder {
    color: var(--light-green);
    font-style: italic;
  }

  .connect {
    justify-content: center;
    align-items: center;
  }
  small {
    margin: 4px auto;
  }
  a {
    cursor: pointer;
  }
`;
