import imp, web3
from pprint import pprint


CONTRACT_PATH = "../contracts/PowerChain.sol"
CONTRACT_JSON_PATH = "../contracts/PowerChain.sol.json"
TOOLS_PATH = "../scripts/tools.py"
METHOD_EXECUTION_SCRIPT = "../scripts/pc_CallPowerChainMethod"
RPC_URL = "http://192.168.100.203:32301"

def red(text):
    return f"\x1b[31m{text}\x1b[0m"
def green(text):
    return f"\x1b[92m{text}\x1b[0m"
def result(bool):
    return green("PASS") if bool else red("FAIL")
def toAddress(address):
    return web3.Web3.to_checksum_address(address)
def toInternalNumber(number):
    return web3.Web3.to_wei(number,"ether")
def fromInternalNumber(number):
    return web3.Web3.from_wei(number,"ether")
def printResult(text,act,exp):
    res = exp == act
    print('{0:80}:  {1}'.format(text, result(res)))
    if (not res): raise Exception(f"Expected '{exp}' and got '{act}'")

class METHODS:
    GET_TOTAL_KWH = "getTotalEnergy"
    GET_ENERGY_RATES = "getEnergyCosts"
    BALANCE_EUR = "balanceeEuro"
    BALANCE_ENT = "balanceENT"
    GET_TOTAL_ENT = "getTotalENT"
    GET_BANKER_ADDRESS = "getBankerAddress"
    GET_NETWORK_PARAMETERS = "getParameters"
    TRANSFER_ENT = "transferENT"
    TRANSFER_EUR = "transfereEuro"
    IS_VOTER = "isVoter"
    ADD_VOTER = "addVoter"
    GET_VOTES = "getVotes"
    REMOVE_VOTER = "removeVoter"
    ADD_STORAGE_UNIT = "registerStorageUnit"
    REMOVE_STORAGE_UNIT = "removeStorageUnit"
    START_CONSUMPTION_SESSION = "startConsumptionSession"
    GET_CONSUMPTION_SESSIONS = "getConsumptionSessions"
    GET_STORAGE_UNIT_INFO = "getStorageUnitsInfo"
    SET_BANKER_ADDRESS = "changeBanker"
    GET_TOTAL_EURO = "getTotalEeuro"
    MINT_EURO = "minteEuro"
    BURN_EURO = "burneEuro"
    UNLOCK_EURO = "unlockeEuro"
    LOCK_EURO = "lockeEuro"
    GET_ORDERS = "getOrders"
    ADD_ORDER = "addOrder"
    REMOVE_ORDER = "removeOrder"
    ENERGY_PRODUCED = "energyProduced"
    ENERGY_CONSUMED = "energyConsumed"
    GET_CONSUMPTION_SESSION_ENERGY = "getConsumptionSessionEnergy"
    GET_STORAGE_UNIT_ENERGY = "getStorageUnitEnergy"
    REPORT_ACTUAL_ENERGY = "reportActualEnergy"

contractAddress = None
admin = None
user1 = None
user2 = None
user3 = None
unit1 = None
unit2 = None
banker = None
PowerChain = None
    
def initialize():
    global contractAddress, admin, user1, user2, user3, unit1, unit2, banker, PowerChain
    #Create addresses to use with testing
    if admin == None: admin = web3.Account.create()
    if user1 == None: user1 = web3.Account.create()
    if user2 == None: user2 = web3.Account.create()
    if user3 == None: user3 = web3.Account.create()
    if unit1 == None: unit1 = web3.Account.create()
    if unit2 == None: unit2 = web3.Account.create()
    if banker == None: banker = web3.Account.create()
    deployContract = imp.load_source('tools', TOOLS_PATH).deployContract
    if contractAddress == None:
        try:
            contractAddress = deployContract(RPC_URL,CONTRACT_PATH,admin)
            printResult("Deploy contract successfully",web3.Web3.is_address(contractAddress),True)
        except Exception as e:
            print(e)
            printResult("Deploy contract successfully",False,True)
    if PowerChain == None:
        PowerChain = imp.load_source('PowerChain', METHOD_EXECUTION_SCRIPT).PowerChain(
        "http://192.168.100.203:32301",
        CONTRACT_JSON_PATH )