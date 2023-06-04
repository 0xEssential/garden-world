import { ConnectButton } from "@rainbow-me/rainbowkit";
import { EssentialWalletContext } from "@xessential/react";
import React, { useContext, useState } from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { useBurnerWallet } from "../hooks/useBurnerWallet";

type Props = {
  children?: React.ReactNode;
};

export const BurnerForm = ({ children }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [creating, setCreating] = useState(true);
  //   const [error, setError] = useState<any>();

  const { address } = useAccount();
  const { wallet, createAccount, login, error, loading } = useBurnerWallet();

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        // e.stopPropagation();
      }}
    >
      {error ? (
        <p className="text-center font-ArialNarrowerStd text-xl text-red">
          {error.message}
        </p>
      ) : (
        <p className="font-ArialNarrowerStd text-white"></p>
      )}
      {loading ? (
        <p>Loading</p>
      ) : (
        <>
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
              required
              className="w-full p-1"
              type="password"
              placeholder="confirm password"
              onChange={({ target: { value } }) => setConfirmPassword(value)}
            ></input>
          ) : null}
          <button
            type="submit"
            className="button"
            onClick={async (e) => {
              console.log("clicked");
              e.preventDefault();
              e.stopPropagation();
              creating
                ? createAccount({
                    username,
                    password,
                    passwordConfirmation: confirmPassword,
                  })
                : login({
                    username,
                    password,
                  });
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
        </>
      )}
    </Form>
  );
};

const Form = styled.div`
  width: 300px;
  margin: 16px auto;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  button {
    border: 2px solid var(--deep-green);
  }
  small {
    margin: 4px auto;
  }
  a {
    cursor: pointer;
  }
`;
