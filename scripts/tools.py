import json
from solcx import compile_source, install_solc
from pprint import pprint
from web3 import Web3
from web3.middleware import geth_poa_middleware

SOLC_VERSION="0.8.20"
EVM_VERSION="paris"

def deployContract(icp,path):

    install_solc(SOLC_VERSION)

    w3 = Web3(Web3.IPCProvider(icp,timeout=15))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    #Compile contract
    if ( not os.path.exists(path) ):
        print(f"File '{path}' not found...")
        exit(0)
    with open(path, "r") as file:
        source = file.read()
    compiled_sol = compile_source(source,output_values=['abi', 'bin'],evm_version=EVM_VERSION,solc_version=SOLC_VERSION)
    _, contract_interface = compiled_sol.popitem()
    abi = contract_interface['abi']
    bytecode = contract_interface['bin']

    #Deploy Contract
    w3.eth.default_account = w3.eth.accounts[0]
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    tx_hash = contract.constructor().transact()
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash,timeout=120)
    contract = {
        "name":os.path.basename(path),
        "address":tx_receipt.contractAddress,
        "abi":abi
    }
    print("Smart Contract Deployed!")
    print(f"Contract Address: {tx_receipt.contractAddress}")
    pprint(abi)
    contract_file = args.path + ".json"
    with open(contract_file, "w") as outfile:
        json.dump(contract, outfile)
