import {
  // Provider as AbstractProvider,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { Deferrable, defineReadOnly } from "@ethersproject/properties";
import {
  BigNumber,
  BigNumberish,
  Bytes,
  Contract,
  getDefaultProvider,
  logger,
  providers,
  Signer,
  Wallet,
} from "ethers";
import { utils } from "ethers";

const { Logger } = utils;

import { abi, EssentialForwarderDeployments } from "../deployments/index.js";
import { forwarderAbi } from "../index.js";
import { EssentialForwarder, IForwardRequest } from "../typechain/contracts/fwd/EssentialForwarder.js";
import { getNonce, prepareRequest } from "./messageBuilder.js";
import { EIP712Domain, EIP712StructField, ForwardRequestInput, signMetaTxRequest } from "./messageSigner.js";
import { handleOffchainLookup } from "./offchainLookup.js";

export interface EssentialOverrides {
  authorizer: string;
  nftContract?: string;
  nftChainId?: BigNumberish;
  nftTokenId?: BigNumberish;
  proof?: string;
}

export interface EssentialSignerConfig {
  relayerUri?: string;
  chainId?: number;
  domainName?: string;
  rpcUrl?: string;
  forwarderAddress?: string;
  onSubmit?: () => void;
}

export class EssentialSigner extends Signer implements ExternallyOwnedAccount {
  readonly address: string;
  readonly chainId: number;
  readonly connectedSigner: Signer;
  readonly domainName: string;
  readonly forwarder: EssentialForwarder;
  readonly privateKey: string;
  readonly relayerUri: string;
  readonly rpcUrl?: string;

  onSubmit: () => void;

  constructor(address: string, signerOrProvider: Signer | Wallet, config?: EssentialSignerConfig) {
    logger.checkNew(new.target, EssentialSigner);
    super();

    const { chainId, domainName, forwarderAddress, relayerUri, rpcUrl, onSubmit } = {
      ...{
        domainName: "Essential Forwarder",
        relayerUri: process.env.NFIGHT_RELAYER_URI,
        chainId: process.env.NFIGHT_CHAIN_ID ? parseInt(process.env.NFIGHT_CHAIN_ID, 10) : 137,
      },
      ...config,
    };

    if (!relayerUri)
      logger.throwError("Relayer URI not set", Logger.errors.INVALID_ARGUMENT, {
        argument: "relayerUri",
        value: null,
      });

    if (!signerOrProvider)
      logger.throwError("Missing Provider or Wallet", Logger.errors.INVALID_ARGUMENT, {
        argument: "signerOrProvider",
        value: null,
      });

    defineReadOnly(this, "address", address);
    defineReadOnly(this, "chainId", chainId);
    defineReadOnly(this, "domainName", domainName);
    defineReadOnly(this, "rpcUrl", rpcUrl);

    const _forwarder = this._buildNetworkForwarder(forwarderAddress);

    defineReadOnly(this, "forwarder", _forwarder);
    defineReadOnly(this, "relayerUri", relayerUri);

    if (signerOrProvider instanceof Wallet) {
      defineReadOnly(this, "privateKey", signerOrProvider.privateKey);
    } else {
      defineReadOnly(this, "provider", (signerOrProvider as Signer).provider);
      defineReadOnly(this, "connectedSigner", signerOrProvider as Signer);
    }

    if (onSubmit) this.onSubmit = onSubmit;
  }

  getAddress(): Promise<string> {
    return Promise.resolve(this.address);
  }

  async fetchNonce(): Promise<BigNumber> {
    const nonce = await getNonce(this.forwarder, this.address);
    return nonce;
  }

  async preflightNative(req: IForwardRequest.ERC721ForwardRequestStruct): Promise<string | void | Error> {
    return await this.forwarder.preflightNative(req).catch(
      async (
        e: Error & {
          errorName?: string;
          errorArgs?: Record<string, unknown>;
        }
      ) => {
        if (e.errorName === "OffchainLookup" && e.errorArgs) {
          return handleOffchainLookup(e.errorArgs as any, this.forwarder);
        } else {
          return new Error(`Unexpected Revert: ${e}`);
        }
      }
    );
  }

  async prepareTransaction(transaction: Deferrable<TransactionRequest & { customData: EssentialOverrides }>) {
    const input = {
      to: transaction.to,
      from: transaction.from,
      authorizer: transaction.from,
      ...transaction.customData,
      targetChainId: this.chainId,
      data: transaction.data,
    } as ForwardRequestInput;

    const { request } = await prepareRequest(input, this.forwarder);

    return request;
  }

  async _fail(message: string, operation: string): Promise<never> {
    await Promise.resolve();
    logger.throwError(message, Logger.errors.UNSUPPORTED_OPERATION, {
      operation: operation,
    });
  }

  // Populates all fields in a transaction, signs it and sends it to the network
  async sendTransaction(transaction: TransactionRequest & EssentialOverrides): Promise<TransactionResponse | any> {
    const _signer = this.privateKey || this.provider;

    if (!_signer) return;
    if (transaction?.proof) {
      return this.connectedSigner.sendTransaction({
        to: this.forwarder.address,
        data: transaction.proof,
      });
    }

    const result = await signMetaTxRequest(
      _signer,
      transaction as ForwardRequestInput,
      this.forwarder,
      this.domainName
    );

    this.onSubmit && this.onSubmit();

    const txResult = await fetch(this.relayerUri, {
      method: "POST",
      body: JSON.stringify({
        ...result,
        forwarder: {
          address: this.forwarder.address,
          abi,
        },
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then(({ result, status }) => {
        if (status === "success") {
          return JSON.parse(result);
        }
      });

    return {
      hash: txResult?.txHash,
      confirmations: 0,
      from: transaction.from,
      wait: async (_confirmations?: number) => Promise.reject("EssentialSigner does not support wait()"),
    };
  }

  // We throw errors on direct signing requests to ensure developers
  // correctly use EssentialSigner with their contract calls

  signMessage(_message: Bytes | string): Promise<string> {
    return this._fail("EssentialSigner cannot sign messages", "signMessage");
  }

  signTransaction(_transaction: Deferrable<TransactionRequest>): Promise<string> {
    return this._fail(
      "EssentialSigner cannot sign transactions directly - use contract calls instead",
      "signTransaction"
    );
  }

  _signTypedData(
    _domain: EIP712Domain,
    _types: Record<string, Array<EIP712StructField>>,
    _value: Record<string, any>
  ): Promise<string> {
    return this._fail("EssentialSigner cannot sign typed data", "signTypedData");
  }

  _buildNetworkForwarder(address?: string) {
    return new Contract(
      address || EssentialForwarderDeployments[this.chainId].address,
      forwarderAbi,
      this.rpcUrl ? new providers.JsonRpcProvider(this.rpcUrl, this.chainId) : getDefaultProvider(this.chainId)
    ) as EssentialForwarder;
  }

  connect(provider: providers.Provider): EssentialSigner {
    defineReadOnly(this, "provider", provider);

    return this;
  }
}
