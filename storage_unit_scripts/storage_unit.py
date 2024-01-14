#!/usr/bin/python3
import argparse, os, json, time
from solcx import compile_source, install_solc
from web3 import Web3
from web3.middleware import geth_poa_middleware

SOLC_VERSION="0.8.20"

parser = argparse.ArgumentParser(description='Deploy Smart Contract')
parser.add_argument('rpc', type=str, default="http://localhost:32301",
                    help='Blockchain network RPC')
parser.add_argument('pwc', type=str,
                    help='PowerChain Contract JSON File')
parser.add_argument('addr', type=str, default="",
                    help='Consumer/Producer address')
parser.add_argument('whs', type=str, default=0,
                    help='Energy produces or consumed in watt hours (wh)')
parser.add_argument('consume', type=bool, default=False,
                    help='Energy consumed')
parser.add_argument('produce', type=bool, default=False,
                    help='Energy produced')
parser.add_argument('sessionEnergy', type=bool, default=False,
                    help='Get consumption session energy')
try:
    args = parser.parse_args()
except:
    parser.print_help()
    exit(0)
w3 = Web3(Web3.HTTPProvider(args.rpc))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

if (not w3.is_address(args.addr)): exit("Provided address is not valid")

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

chainFunction = ""
if (args.consume): chainFunction = "energyProduced"
elif (args.produce): chainFunction = "energyProduced"
elif (args.sessionEnergy): chainFunction = "sessionEnergy"
else: exit("Please use --consume or --produce to define which action you need to perform")

if (args.sessionEnergy):
    tr = contract.functions[chainFunction](
        Web3.to_checksum_address(args.addr)).build_transaction(
            {"from": account.address,
            "gasPrice":0,
            "nonce":w3.eth.get_transaction_count(account.address)
        })
else:
    if (args.whs <= 0): exit("Please provide the amount of wh to be produced or consumed")
    tr = contract.functions[chainFunction](
        Web3.to_checksum_address(args.addr),
        args.whs).build_transaction(
            {"from": account.address,
            "gasPrice":0,
            "nonce":w3.eth.get_transaction_count(account.address)
        })
signed_tr = account.sign_transaction(tr)
tx_hash = w3.eth.send_raw_transaction(signed_tr.rawTransaction)
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash,timeout=120)
try:
    reason = tx_receipt.logs[0].data.decode().replace("\x00","")
    exit(reason)
except:
    text = ""
    if (args.produced): text = "produced"
    elif (args.consumed): text = "consumed"
    print(f"{args.whs} wh {text}")