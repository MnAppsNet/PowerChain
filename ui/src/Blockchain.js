export class Contracts {
    static PowerChain = "PowerChain";
    constructor() {
        const contractContext = require.context('./contracts', false, /\.json$/);
        const fileNames = contractContext.keys();
        (fileNames.map(contractContext)).forEach(contract => {
            this[contract["name"]] = {};
            this[contract["name"]]["abi"] = contract["abi"];
            this[contract["name"]]["address"] = contract["address"];
        });
    }
}

export class Blockchain {
    static TOKENS = {
        ENT: "ENT",
        EUR: "EUR",
    }
    static METHODS = {
        GET_TOTAL_KWH: "getTotalEnergy",
        GET_ENERGY_RATES: "getEnergyRates",
        BALANCE_EUR: "balanceeEuro",
        BALANCE_ENT: "balanceENT",
        GET_TOTAL_ENT: "getTotalENT",
        GET_TOTAL_EEURO: "getTotalEeuro",
        GET_BANKER_ADDRESS: "getBankerAddress",
        GET_NETWORK_PARAMETERS: "getParameters",
        TRANSFER_ENT: "transferENT",
        TRANSFER_EUR: "transfereEuro",
        IS_VOTER: "isVoter",
        ADD_VOTER: "addVoter",
        GET_VOTES: "getVotes",
        REMOVE_VOTER: "removeVoter",
        ADD_STORAGE_UNIT: "registerStorageUnit",
        REMOVE_STORAGE_UNIT: "removeStorageUnit",
        START_CONSUMPTION_SESSION: "startConsumptionSession",
        GET_CONSUMPTION_SESSIONS: "getUserConsumptionSessions",
        GET_STORAGE_UNIT_INFO: "getStorageUnitsInfo",
        SET_BANKER_ADDRESS: "changeBanker",
    }
    constructor(controller) {
        this.contracts = new Contracts();
        this.controller = controller;
    }
    initialize() {
        //Connect web3 to blockchain and instantiate PowerChain contract
        if (this.controller.web3 == null) return;
        try {
            this.web3 = this.controller.web3;
            this.contract = new this.web3.eth.Contract(this.contracts[Contracts.PowerChain]["abi"], this.contracts[Contracts.PowerChain]["address"]);
            this.contract.handleRevert = true;
        } catch (e) {
            console.log(e);
            this.controller.showMessage(this.controller.strings.failedToInitializeContract);
            this.controller.disconect();
        }
    }
    executeViewMethod(callback, method, ...args) {
        if (this.contract == null) return;
        this.contract.methods[method](...args).call({ from: this.controller.address })
            .then((results) => {
                try {
                    if ('events' in results) {
                        if ('Error' in results.events) {
                            this.controller.showMessage(results.events.Error.returnValues[0]);
                            return;
                        }
                        if ('Info' in results.events) {
                            this.controller.showMessage(results.events.Info.returnValues[0], false);
                        }
                    }
                } catch { }
                callback(results);
            })
            .catch((e) => {
                console.log(e);
                this.controller.showMessage("Failed to execute method '" + method + "'");
            });
    }
    executeModifyStateMethod(callback, method, ...args) {
        this.contract.methods[method](...args).send({ from: this.controller.address, gasPrice: 0, type: '0x1' }, (error, _) => {
            console.log(error);
        }).then((results) => {
            try {
                if ('events' in results) {
                    if ('Error' in results.events) {
                        this.controller.showMessage(results.events.Error.returnValues[0]);
                        return;
                    }
                    if ('Info' in results.events) {
                        this.controller.showMessage(results.events.Info.returnValues[0], false);
                    }
                }
            } catch { }
            callback(results)
        })
            .catch((e) => { console.log(e); this.controller.showMessage("Failed to execute method '" + method + "'") });
    }
}

export default Blockchain