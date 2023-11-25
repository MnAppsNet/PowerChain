import argparse, os, json
from web3 import Web3
from web3.middleware import geth_poa_middleware
from tools import deployContract

contracts = [
     "faucet",
]

try:
    script_path = os.path.dirname(os.path.abspath(__file__))

    parser = argparse.ArgumentParser(description='Deploy Smart Contract')
    parser.add_argument('path', type=str, default="{script_path}/../contracts",
                        help='Path to folder with all the contracts')
    parser.add_argument('icp', type=str, default=f"./geth.icp",
                        help='Path to ICP file of a running network peer')
    try:
        args = parser.parse_args()
    except:
        parser.print_help()
        exit(0)

    if ( not os.path.exists(args.icp) ):
            print("Please provide a valid geth.icp file or run the script in a folder with a geth.icp file")
            print("Make sure the account you are connecting to has some gas")
            exit(0)
    if ( not os.path.exists(args.path)):
         pass
    w3 = Web3(Web3.IPCProvider(args.icp,timeout=15))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    w3.eth.default_account = w3.eth.accounts[0]
    wei = w3.eth.get_balance(w3.eth.accounts[0])
    pass


except Exception as e:
    raise e