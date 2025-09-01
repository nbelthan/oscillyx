require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Important for complex contracts with string manipulation
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 10143,
      gasPrice: "auto",
      timeout: 120000,
      verify: {
        etherscan: {
          apiUrl: "https://testnet.monadexplorer.com/api",
        }
      }
    },
    monadMainnet: {
      url: "https://rpc.monad.xyz", 
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1, // Will be updated when Monad mainnet launches
      gasPrice: "auto",
      timeout: 120000,
      verify: {
        etherscan: {
          apiUrl: "https://monadexplorer.com/api",
        }
      }
    },
  },
  etherscan: {
    apiKey: {
      monadTestnet: process.env.MONAD_API_KEY || "placeholder",
      monadMainnet: process.env.MONAD_API_KEY || "placeholder",
    },
    customChains: [
      {
        network: "monadTestnet",
        chainId: 10143,
        urls: {
          apiURL: "https://testnet.monadexplorer.com/api",
          browserURL: "https://testnet.monadexplorer.com"
        }
      },
      {
        network: "monadMainnet",
        chainId: 1,
        urls: {
          apiURL: "https://monadexplorer.com/api", 
          browserURL: "https://monadexplorer.com"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 1, // Monad gas price placeholder
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 60000
  }
};