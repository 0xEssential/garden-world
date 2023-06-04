import * as dotenv from 'dotenv';

import {HardhatUserConfig} from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'solidity-docgen';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  paths: {
    sources: 'contracts',
  },
  docgen: {
    pages: 'files',
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
};

export default config;
