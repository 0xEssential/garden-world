import {Contract, ethers, Signer} from 'ethers';

export const handleOffchainLookup = async (
  args: Record<string, any>,
  signer: Signer,
  forwarder: Contract
): Promise<ethers.providers.TransactionReceipt> => {
  const {callData, callbackFunction, extraData} = args;

  const abi = new ethers.utils.AbiCoder();
  const [
    from,
    authorizer,
    nonce,
    nftChainId,
    nftContract,
    tokenId,
    _targetChainId,
    timestamp,
  ] = abi.decode(
    [
      'address',
      'address',
      'uint256',
      'uint256',
      'address',
      'uint256',
      'uint256',
      'uint256',
    ],
    callData
  );

  const message = await forwarder.createMessage(
    from,
    authorizer,
    nonce,
    nftChainId,
    nftContract,
    tokenId,
    timestamp
  );

  const proof = await signer.signMessage(
    ethers.utils.arrayify(message, {allowMissingPrefix: true})
  );
  const tx = await forwarder.signer.sendTransaction({
    to: forwarder.address,
    data: ethers.utils.hexConcat([
      callbackFunction,
      abi.encode(['bytes', 'bytes'], [proof, extraData]),
    ]),
  });

  return await tx.wait();
};
