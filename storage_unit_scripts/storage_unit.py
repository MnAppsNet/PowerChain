#!/usr/bin/python3
import argparse, os, json, time
from solcx import compile_source, install_solc
from web3 import Web3
from web3.middleware import geth_poa_middleware
from energy import Energy

SOLC_VERSION="0.8.20"

try:
    parser = argparse.ArgumentParser(description='Deploy Smart Contract')
    parser.add_argument('rpc', type=str, default="http://localhost:32301",
                        help='Blockchain network RPC')
    parser.add_argument('pwc', type=str,
                        help='PowerChain Contract JSON File')
    try:
        args = parser.parse_args()
    except:
        parser.print_help()
        exit(0)
    
    w3 = Web3(Web3.HTTPProvider(args.rpc))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    if (not os.path.exists(args.pwc)):
        exit("PowerChain Contract JSON file not valid")

    key = ""
    if (os.path.exists(os.path.dirname(__file__)+"/account.key")):
        with open(os.path.dirname(__file__)+"/account.key", "r") as file:
            key = file.read()
    if (key != ""):
        account = w3.eth.account.from_key(key)
    else:
        account = w3.eth.account.create()
        #w3.eth.default_account
        with open(os.path.dirname(__file__)+"/account.key", "w") as file:
            file.write(account.key.hex())  

    print("Storage Unit Address: "+account.address)

    install_solc(SOLC_VERSION)

    with open(args.pwc) as file:
        contractJson = json.load(file)
    
    contract = w3.eth.contract(abi=contractJson['abi'], address=contractJson['address'])
    
    energy = Energy()
    check = True
    while check:
        consumptions, check = energy.check()
        if (len(consumptions) == 0): continue
        for consumption in consumptions:
            if (consumption['wh'] > 0):
                tr = contract.functions.energyProduced(
                    Web3.to_checksum_address(consumption['address']),
                    consumption['wh']).build_transaction(
                        {"from": account.address,
                        "gasPrice":0,
                        "nonce":w3.eth.get_transaction_count(account.address)
                        })
                signed_tr = account.sign_transaction(tr)
                tx_hash = w3.eth.send_raw_transaction(signed_tr.rawTransaction)
                tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash,timeout=120)
                try:
                    print(tx_receipt.logs[0].data.decode().replace("\x00",""))
                except:
                    print(f"{consumption['wh']} wh produced")
            elif (consumption['wh'] < 0):
                tr = contract.functions.energyConsumed(
                    Web3.to_checksum_address(consumption['address']),
                    -1*consumption['wh']).build_transaction(
                        {"from": account.address,
                        "gasPrice":0,
                        "nonce":w3.eth.get_transaction_count(account.address)
                        })
                signed_tr = account.sign_transaction(tr)
                tx_hash = w3.eth.send_raw_transaction(signed_tr.rawTransaction)
                tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash,timeout=120)
                try:
                    print(tx_receipt.logs[0].data.decode().replace("\x00",""))
                except:
                    print(f"{consumption['wh']} wh consumed")
                pass
        time.sleep(1)

except Exception as e:
    raise e