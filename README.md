<img src="./ui/public/logo192_white.png" alt="PowerChain" align="right">

# PowerChain &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/MnAppsNet/PowerChain/blob/master/LICENSE)
This project introduces a decentralized energy trading model implemented on a private blockchain network. It leverages blockchain technology in order
to decentralize energy transactions and allow a local network to create its own energy market, controlled by the network participants. It gives the freedom
to energy producers and consumers to make their own energy trading deals and define an energy price that is most convenient to both parties without any intermediates.
These goals are achieved using a local Ethereum blockchain network, a smart contract build on top of it and a web based user interface where users can interact
with the smart contract and perform energy transactions.

## Install Script
The install_prerequisites.sh script installs all the prerequisites for PowerChain. It also adds the PowerChain scripts to PATH.

## PowerChain Scripts
### pc_CreateNetwork
This script is used to generate the validator nodes for a private proof of authority Ethereum network and a bootnode. 
It will create a "network" folder which will contain a bootnode folder and one folder for each
validator. In each folder there is a "start.sh" script which starts the node. The validator folder will also
include a "startSigner.sh" script which starts an external signer (Clef). An external signer is used to avoid
having to unlock the validator nodes and have then exposed to unwanted JSON-RPC API calls.

### pc_CreateAccount
This script create a normal network node. No external signer is needed.

### pc_CreateBootNode
This script creates a BootNode. In order for a node to use the newly created bootnode you need to add its address in the relevant bootnodes.txt file.s

### pc_DeployContract
This script is used to deploy a smart contract into the chain.
Below are the script arguments:

    positional arguments:
    path        Path to smart contract
    icp         Path to ICP file of a running network peer
    optional arguments:
    -h, --help  show this help message and exit

### pc_Network
Starts an interactive JavaScript enviroment. It connects to the node using the get.ipc file. You should run the script in a folder with a get.ipc file.

### pc_CallPowerChaibMethod
This script can be used to call a method from the PowerChain smart contract. Below are the script arguments:
positional arguments:
  rpc                Blockchain network RPC
  pwc                PowerChain Contract JSON File
  method             PowerChain contract method
  arguments          Arguments of PowerChain method

## Userful Documentation
Web3.py: https://web3py.readthedocs.io/ \
Web3.js: https://web3js.readthedocs.io/ \
py-solc-x: https://solcx.readthedocs.io/en/latest/ \
go-ethereum: https://geth.ethereum.org/docs \

## Licensing
* [MIT](https://github.com/MnAppsNet/PowerChain/blob/master/LICENSE)
* Copyright 2024