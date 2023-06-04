import {Contract} from 'ethers';
import {ethers} from 'hardhat';

export const keyhash =
  '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4';

export async function setupUsers<T extends {[contractName: string]: Contract}>(
  addresses: string[],
  contracts: T
): Promise<({address: string} & T)[]> {
  const users: ({address: string} & T)[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users;
}

export async function setupUser<T extends {[contractName: string]: Contract}>(
  address: string,
  contracts: T
): Promise<{address: string} & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = {address};
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address));
  }
  return user as {address: string} & T;
}

// follow https://github.com/nomiclabs/hardhat/issues/1112
// re: adding more performant way to mock block number
export const timeTravel = async (seconds: number): Promise<void> => {
  const time = Date.now() / 1000 + seconds;
  await ethers.provider.send('evm_setNextBlockTimestamp', [time]);
  await ethers.provider.send('evm_mine', []);
};
