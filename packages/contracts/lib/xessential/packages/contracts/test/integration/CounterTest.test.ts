/* eslint-disable @typescript-eslint/no-var-requires */
import {expect} from 'chai';
import {constants, Contract} from 'ethers';
import {ethers} from 'hardhat';
import {setupUsers} from './utils/index';
import {signMetaTxRequest} from '@xessential/signer';
import {handleOffchainLookup} from './utils/offchainLookupMock';
import {DelegationRegistry, EssentialForwarder} from '~typechain';
import {IForwardRequest} from '~typechain/contracts/fwd/EssentialForwarder';

const NAME = 'Test Forwarder';

const submitMetaTx = async (
  forwarder: Contract,
  request: IForwardRequest.ERC721ForwardRequestStruct,
  signature: string
) => {
  return forwarder
    .preflight(request, signature)
    .catch(
      async (
        e: Error & {errorName?: string; errorArgs?: Record<string, unknown>}
      ) => {
        if (e.errorName === 'OffchainLookup' && e.errorArgs) {
          await handleOffchainLookup(e.errorArgs, forwarder.signer, forwarder);
        }
      }
    );
};

const deployContracts = async (delegationSource: string) => {
  const Forwarder = await ethers.getContractFactory('EssentialForwarder');
  const forwarder = await Forwarder.deploy();
  await forwarder.deployed();

  const Registry = await ethers.getContractFactory(delegationSource);
  let registry;
  if (delegationSource === 'DelegationRegistry') {
    registry = await Registry.deploy();
  } else {
    registry = await Registry.deploy(forwarder.address);
  }

  await registry.deployed();

  const Counter = await ethers.getContractFactory('Counter');
  const counter = await Counter.deploy(forwarder.address);
  await counter.deployed();

  const signers = await ethers.getSigners();

  const users = (await setupUsers(
    signers.map((signer) => signer.address),
    {
      counter,
      forwarder,
      registry,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  )) as any[];

  await users[0].forwarder.setDelegationRegistry(registry.address);

  return {
    counter,
    forwarder,
    users,
  };
};

for (const delegationSource of [
  'EssentialPlaySession',
  'DelegationRegistry',
  'DelegationRegistry2771',
]) {
  describe(`Counter with ${delegationSource}`, function () {
    let fixtures: {
      counter: Contract;
      forwarder: Contract;
      users: ({
        address: string;
      } & {
        counter: Contract;
        forwarder: EssentialForwarder;
        registry: DelegationRegistry;
      })[];
    };

    describe('Increment with Owner', async () => {
      before(async () => {
        fixtures = await deployContracts(delegationSource);
      });

      it('Starts at 0', async function () {
        const {
          counter,
          users: [_relayer, account],
        } = fixtures;

        expect(await counter.count(account.address)).to.equal(0);
      });

      it('reverts if called outside of forwarder', async function () {
        const {
          users: [_relayer, account],
        } = fixtures;

        await expect(account.counter.increment()).to.be.revertedWith('429');
      });

      it('Increments via Forwarder#executeWithProof', async function () {
        const {
          counter,
          users: [relayer, account, nftContract],
        } = fixtures;

        const data = account.counter.interface.encodeFunctionData('increment');

        const {signature, request} = await signMetaTxRequest(
          account.counter.provider,
          {
            to: account.counter.address,
            from: account.address,
            authorizer: account.address,
            nftContract: nftContract.address,
            nftChainId: '1',
            nftTokenId: '1',
            targetChainId: '31337',
            data,
          },
          relayer.forwarder,
          NAME
        );

        await submitMetaTx(relayer.forwarder, request, signature);
        const count = await counter.count(account.address);
        expect(count).to.equal(1);
      });

      it('Increments via Forwarder#executeWithProofNative', async function () {
        const {
          counter,
          users: [relayer, account, nftContract],
        } = fixtures;

        const nonce = await account.forwarder.getNonce(account.address);
        const req = {
          to: account.counter.address,
          from: account.address,
          authorizer: account.address,
          nftContract: nftContract.address,
          nftChainId: '1',
          nftTokenId: '2',
          targetChainId: '31337',
          data: account.counter.interface.encodeFunctionData('increment'),
          value: 0,
          gas: 1e6,
          nonce,
        };

        await account.forwarder.preflightNative(req).catch(
          async (
            e: Error & {
              errorName?: string;
              errorArgs?: Record<string, unknown>;
            }
          ) => {
            if (e.errorName === 'OffchainLookup' && e.errorArgs) {
              return await handleOffchainLookup(
                e.errorArgs,
                relayer.forwarder.signer,
                account.forwarder
              );
            }
          }
        );

        const count = await counter.count(account.address);
        expect(count).to.equal(2);
      });
    });

    describe('Increment with Burner', async () => {
      before(async () => {
        fixtures = await deployContracts(delegationSource);
      });

      it('Starts at 0', async function () {
        const {
          counter,
          users: [_relayer, account],
        } = fixtures;

        expect(await counter.count(account.address)).to.equal(0);
      });
      it('Reverts if called outside of forwarder', async function () {
        const {
          users: [_relayer, account],
        } = fixtures;

        await expect(account.counter.increment()).to.be.revertedWith('429');
      });

      it('Reverts when owner has no PlaySession', async function () {
        const {
          counter,
          users: [relayer, account, nftContract, burner],
        } = fixtures;

        const data = account.counter.interface.encodeFunctionData('increment');

        const {signature, request} = await signMetaTxRequest(
          account.counter.provider,
          {
            to: account.counter.address,
            from: burner.address,
            authorizer: account.address,
            nftContract: nftContract.address,
            nftChainId: '1',
            nftTokenId: '1',
            targetChainId: '31337',
            data,
          },
          relayer.forwarder,
          NAME
        );

        await expect(
          submitMetaTx(relayer.forwarder, request, signature)
        ).to.be.revertedWith('Unauthorized()');

        const count = await counter.count(account.address);

        expect(count).to.equal(0);
      });

      it('Reverts when burner not current session beneficiary', async function () {
        const {
          counter,
          users: [relayer, account, nftContract, burner, activeBurner],
        } = fixtures;

        const createSession = await account.forwarder.createSession(
          activeBurner.address
        );

        await createSession.wait();

        const data = account.counter.interface.encodeFunctionData('increment');

        const {signature, request} = await signMetaTxRequest(
          account.counter.provider,
          {
            to: account.counter.address,
            from: burner.address,
            authorizer: account.address,
            nftContract: nftContract.address,
            nftChainId: '1',
            nftTokenId: '1',
            targetChainId: '31337',
            data,
          },
          account.forwarder,
          NAME
        );

        await expect(
          submitMetaTx(relayer.forwarder, request, signature)
        ).to.be.revertedWith('Unauthorized()');

        const count = await counter.count(account.address);

        expect(count).to.equal(0);
      });

      it('Increments via Forwarder#executeWithProof when burner is authorized', async function () {
        const {
          counter,
          users: [relayer, account, nftContract, burner],
        } = fixtures;

        const createSession = await account.registry.delegateForAll(
          burner.address,
          true
        );
        await createSession.wait();

        const data = burner.counter.interface.encodeFunctionData('increment');

        const {signature, request} = await signMetaTxRequest(
          burner.counter.provider,
          {
            to: burner.counter.address,
            from: burner.address,
            authorizer: account.address,
            nftContract: nftContract.address,
            nftChainId: '1',
            nftTokenId: '1',
            targetChainId: '31337',
            data,
          },
          account.forwarder,
          NAME
        );

        await submitMetaTx(relayer.forwarder, request, signature);
        const count = await counter.count(account.address);
        expect(count).to.equal(1);
      });

      it('Increments via Forwarder#executeWithProofNative when burner is authorized', async function () {
        const {
          counter,
          users: [relayer, account, nftContract, burner],
        } = fixtures;

        const nonce = await burner.forwarder.getNonce(burner.address);
        const req = {
          to: account.counter.address,
          from: burner.address,
          authorizer: account.address,
          nftContract: nftContract.address,
          nftChainId: '1',
          nftTokenId: '2',
          targetChainId: '31337',
          data: burner.counter.interface.encodeFunctionData('increment'),
          value: 0,
          gas: 1e6,
          nonce,
        };

        await burner.forwarder.preflightNative(req).catch(
          async (
            e: Error & {
              errorName?: string;
              errorArgs?: Record<string, unknown>;
            }
          ) => {
            if (e.errorName === 'OffchainLookup' && e.errorArgs) {
              return await handleOffchainLookup(
                e.errorArgs,
                relayer.forwarder.signer,
                burner.forwarder
              );
            }
          }
        );

        const count = await counter.count(account.address);
        expect(count).to.equal(2);
      });
    });

    describe('MinimalForwarder requests', async () => {
      before(async () => {
        fixtures = await deployContracts(delegationSource);
      });

      it('Sets last caller from Primary', async function () {
        const {
          counter,
          users: [relayer, account],
        } = fixtures;

        const data =
          account.counter.interface.encodeFunctionData('minimalRequest');

        const {signature, request} = await signMetaTxRequest(
          account.counter.provider,
          {
            to: account.counter.address,
            from: account.address,
            authorizer: account.address,
            nftContract: constants.AddressZero,
            nftChainId: '0',
            nftTokenId: '0',
            targetChainId: '31337',
            data,
          },
          relayer.forwarder,
          NAME
        );

        await relayer.forwarder.execute(request, signature);
        const caller = await counter.lastCaller();

        expect(caller).to.equal(account.address);
      });

      it('Reverts if Burner not authorized', async function () {
        const {
          users: [relayer, account, burner],
        } = fixtures;

        const data =
          burner.counter.interface.encodeFunctionData('minimalRequest');

        const {signature, request} = await signMetaTxRequest(
          burner.counter.provider,
          {
            to: burner.counter.address,
            from: burner.address,
            authorizer: account.address,
            nftContract: constants.AddressZero,
            nftChainId: '0',
            nftTokenId: '0',
            targetChainId: '31337',
            data,
          },
          account.forwarder,
          NAME
        );

        await expect(
          relayer.forwarder.execute(request, signature)
        ).to.be.revertedWith('Unauthorized()');
      });

      it('Sets last caller from Burner', async function () {
        const {
          counter,
          users: [relayer, account, burner],
        } = fixtures;

        const createSession = await account.registry.delegateForAll(
          burner.address,
          true
        );
        await createSession.wait();

        const data =
          burner.counter.interface.encodeFunctionData('minimalRequest');

        const {signature, request} = await signMetaTxRequest(
          burner.counter.provider,
          {
            to: account.counter.address,
            from: burner.address,
            authorizer: account.address,
            nftContract: constants.AddressZero,
            nftChainId: '0',
            nftTokenId: '0',
            targetChainId: '31337',
            data,
          },
          account.forwarder,
          NAME
        );
        await relayer.forwarder.execute(request, signature);
        const caller = await counter.lastCaller();

        expect(caller).to.equal(account.address);
      });
    });
  });
}
