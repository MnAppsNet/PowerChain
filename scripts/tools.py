import json, os
from solcx import compile_source, install_solc
from pprint import pprint
from web3 import Web3
from web3.middleware import geth_poa_middleware
from web3 import Account

SOLC_VERSION="0.8.20"
EVM_VERSION="paris"

def sendEth(icp,account,amount):
    w3 = Web3(Web3.IPCProvider(icp,timeout=15))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    tx_hash = w3.eth.send_transaction({
        "from": w3.eth.accounts[0],
        "to": account,
        "value": amount
    })
    tx =  w3.eth.get_transaction(tx_hash)
    pprint(tx)

def deployContract(rpc,path,account:Account=None):

    install_solc(SOLC_VERSION)

    w3 = Web3(Web3.HTTPProvider(rpc))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    #Compile contract
    if ( not os.path.exists(path) ):
        print(f"File '{path}' not found...")
        exit(0)
    with open(path, "r") as file:
        source = file.read()
    compiled_sol = compile_source(source,output_values=['abi', 'bin'],
                                  evm_version=EVM_VERSION,
                                  solc_version=SOLC_VERSION,
                                  base_path=os.path.dirname(path))
    main_contract = os.path.splitext(os.path.basename(path))[0]
    abi = None
    bytecode = None
    for c in compiled_sol:
        if main_contract in c:
            abi = compiled_sol[c]['abi']
            bytecode = compiled_sol[c]['bin']
            break
    if abi == None or bytecode == None:
        raise Exception("No contract found")

    #Deploy Contract
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    if account == None:
        w3.eth.default_account = w3.eth.accounts[0]
        tx_hash = contract.constructor().transact({"gasPrice":0})
    else:
        signed_tx = account.sign_transaction(
            (contract.constructor().build_transaction({
                "from": account.address,
                "gasPrice":0,
                "nonce":w3.eth.get_transaction_count(account.address)})))
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash,timeout=120)
    contract = {
        "name":main_contract,
        "address":tx_receipt.contractAddress,
        "abi":abi }
    print("Smart Contract Deployed!")
    print(f"Contract Address: {tx_receipt.contractAddress}")
    pprint(abi)
    contract_file = path + ".json"
    with open(contract_file, "w") as outfile:
        json.dump(contract, outfile)

    return tx_receipt.contractAddress
