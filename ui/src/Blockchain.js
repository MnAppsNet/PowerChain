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
        GET_TOTAL_KWH: "getTotalKwh",
        BALANCE_EUR: "balanceeEuro",
        BALANCE_ENT: "balanceENT",
        TRANSFER_ENT: "transferENT",
        TRANSFER_EUR: "transfereEuro",
        ADD_VOTER: "addVoter"
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
        this.contract.methods[method](...args).call()
            .then((results) => {
                try {
                    if ('events' in results)
                        if ('Error' in results.events) {
                            this.controller.showMessage(results.events.Error.returnValues[0]);
                            return;
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
        this.contract.methods[method](...args).send({ from: this.address, gasPrice: 0, type: '0x1' }, (error, _) => {
            console.log(error);
        }).then((results) => {
            if ('Error' in results.events) {
                this.controller.showMessage(results.events.Error.returnValues[0]);
                return;
            }
            callback(results)
        })
            .catch((e) => { console.log(e); this.controller.showMessage("Failed to execute method '" + method + "'") });
    }
    updateTotalEnergy() {
        if (this.contract == null) return;
        this.executeViewMethod(
            (results) => {
                this.controller.totalEnergy = this.web3.utils.fromWei(results, "ether");
            }, Blockchain.METHODS.GET_TOTAL_KWH
        );
    }
    updateBalance() {
        if (this.contract == null) return;
        let avail = { ENT: 0, EUR: 0 };
        let locked = { ENT: 0, EUR: 0 };
        this.executeViewMethod((results) => {
            avail.ENT = Number(this.web3.utils.fromWei(results.available, "ether")); //Not really ether but ENT uses also 10^18 multiplier for decimals
            locked.ENT = Number(this.web3.utils.fromWei(results.locked, "ether"));
            this.executeViewMethod((results) => {
                avail.EUR = Number(this.web3.utils.fromWei(results.available, "ether"));
                locked.EUR = Number(this.web3.utils.fromWei(results.locked, "ether"));
                this.controller.balance = avail;
                this.controller.lockedBalance = locked;
            }, Blockchain.METHODS.BALANCE_EUR, this.controller.address)
        }, Blockchain.METHODS.BALANCE_ENT, this.controller.address)
    }
    transferToken(token, account, amount) {
        let transferMethod = "";
        switch (token) {
            case Blockchain.TOKENS.ENT:
                transferMethod = Blockchain.METHODS.TRANSFER_ENT;
                break;
            case Blockchain.TOKENS.EUR:
                transferMethod = Blockchain.METHODS.TRANSFER_EUR;
                break;
            default:
                return;
        }
        if (Number(this.controller.balance[token]) < Number(amount)) {
            this.controller.showMessage(this.controller.strings.unavailableBalance);
            return;
        }
        if (!this.web3.utils.isAddress(account)) {
            this.controller.showMessage(this.controller.strings.invalidAddress);
            return;
        }
        this.executeModifyStateMethod((_) => {
            this.controller.updateBalance();
        }, transferMethod, account, amount)
    }
    addVoter(address) {
        this.executeModifyStateMethod(
            (results) => {
                console.log(results);
            }, Blockchain.METHODS.ADD_VOTER, address)
    }
}

export default Blockchain