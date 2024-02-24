import React, { useState, useEffect } from "react"
import Blockchain from "./Blockchain";
import Web3, { validator } from "web3";
import Tokens from "./components/pages/Tokens";

class Controller {

    constructor(view) {
        this.model = new Blockchain(this);
        this.view = view;
    }

    //Getters >>>>>
    get styles() { return this.view.state.styles; }
    get colors() { return this.view.state.colors; }
    get strings() { return this.view.state.strings; }

    get messageText() { return this.view.state.messageText; }
    get messageStatus() { return this.view.state.messageStatus; }

    get balanceENT() { return this.view.state.balance.ENT.toString(); }
    get balanceEUR() { return this.view.state.balance.EUR.toString(); }
    get balance() { return this.view.state.balance; }
    get lockedBalanceENT() { return this.view.state.lockedBalance.ENT.toString(); }
    get lockedBalanceEUR() { return this.view.state.lockedBalance.EUR.toString(); }
    get lockedBalance() { return this.view.state.lockedBalance; }
    get totalEnergy() { return this.view.state.totalEnergy; }
    get address() { return this.view.state.address; }
    get web3() { return this.view.state.web3; }
    get connected() { return this.view.state.connected; }
    get voter() { return this.view.state.voter; }
    get banker() { return (this.bankerAddress.toLowerCase() === this.address.toLowerCase()); }
    get votes() { return this.view.state.votes; }
    get orders() { return this.view.state.orders; }
    get sessions() { return this.view.state.sessions; }
    get storageUnitInfo() { return this.view.state.storageUnitInfo; }
    get totalENT() { return this.view.state.totalENT; }
    get totalEeuro() { return this.view.state.totalEeuro; }
    get mintCost() { return this.view.state.mintCost; }
    get burnCost() { return this.view.state.burnCost; }
    get popup() { return this.view.state.popup; }
    get bankerAddress() { return this.view.state.bankerAddress }
    get networkParameters() { return this.view.state.networkParameters }

    //Setters >>>>>
    set styles(v) { this.view.setState({ styles: v }); }
    set colors(v) { this.view.setState({ colors: v }); }
    set strings(v) { this.view.setState({ strings: v }); }
    set connected(v) { this.view.setState({ connected: v }); }
    set messageText(v) { this.view.setState({ messageText: v }); }
    set messageStatus(v) { this.view.setState({ messageStatus: v }); }
    set address(v) { this.view.setState({ address: v }); }
    set balance(v) { this.view.setState({ balance: v }); }
    set lockedBalance(v) { this.view.setState({ lockedBalance: v }); }
    set totalEnergy(v) { this.view.setState({ totalEnergy: v }); }
    set totalEeuro(v) { this.view.setState({totalEeuro: v}); }
    set bankerAddress(v) { 
        this.view.setState({bankerAddress: (this.fromBigNumber(v) === 0)?this.strings.noBanker:v});
    }
    set networkParameters(v) { this.view.setState({networkParameters: v}); }
    set web3(v) {
        if (v != null) v.config.handleRevert = true;
        this.view.setState({ web3: v });
    }
    set voter(v) { this.view.setState({ voter: v }); }
    set votes(v) { this.view.setState({ votes: v }); }
    set orders(v) { this.view.setState({ orders: v }); }
    set sessions(v) { this.view.setState({ sessions: v }); }
    set storageUnitInfo(v) { this.view.setState({ storageUnitInfo: v }); }
    set totalENT(v) { this.view.setState({ totalENT: v }); }
    set mintCost(v) { this.view.setState({ mintCost: v}); }
    set burnCost(v) { this.view.setState({ burnCost: v}); }
    set popup(v) { this.view.setState({ popup: v}); }

    //Voters >>>>>
    async isVoter() {
        this.model.executeViewMethod(
            (result) => {
                this.voter = result;
                if (this.voter) this.controller.getVotes();
            }, Blockchain.METHODS.IS_VOTER);
    }
    async addVoter(address) {
        if (!this.web3.utils.isAddress(address)) {
            this.showMessage(this.strings.invalidAddress + " (" + address + ")");
            return;
        }
        this.model.executeModifyStateMethod(
            (results) => {
                console.log(results);
                this.getVotes(this.address);
            }, Blockchain.METHODS.ADD_VOTER, address)
    }
    async removeVoter(address) {
        if (!this.web3.utils.isAddress(address)) {
            this.showMessage(this.strings.invalidAddress + " (" + address + ")");
            return;
        }
        this.model.executeModifyStateMethod(
            (results) => {
                console.log(results);
                this.isVoter();
                this.getVotes(this.address);
            }, Blockchain.METHODS.REMOVE_VOTER, address)
    }
    async addStorageUnit(address, owner) {
        if (!this.web3.utils.isAddress(address)) {
            this.showMessage(this.strings.invalidAddress + " (" + address + ")");
            return;
        }
        if (!this.web3.utils.isAddress(owner)) {
            this.showMessage(this.strings.invalidAddress + " (" + address + ")");
            return;
        }
        this.model.executeModifyStateMethod(
            (results) => {
                console.log(results);
                this.getVotes(this.address);
            }, Blockchain.METHODS.ADD_STORAGE_UNIT, address, owner)
    }
    async removeStorageUnit(address) {
        if (!this.web3.utils.isAddress(address)) {
            this.showMessage(this.strings.invalidAddress + " (" + address + ")");
            return;
        }
        this.model.executeModifyStateMethod(
            (results) => {
                console.log(results);
                this.getVotes(this.address);
            }, Blockchain.METHODS.REMOVE_STORAGE_UNIT, address)
    }
    async getVotes(address) {
        this.model.executeViewMethod(
            (results) => {
                const votes = []
                results.forEach((item) => {
                    const vote = item["vote"];
                    const userVote = item["userVote"];
                    const passed = item["passed"];
                    votes.push({
                        label: vote + " " + ((userVote) ? this.strings.inFavor : this.strings.notInFavor),
                        value: ((passed) ? this.strings.passed : this.strings.notPassed),

                    })
                });
                if (votes.length === 0) {
                    votes.push({
                        label: this.strings.noData
                    })
                }
                this.votes = votes;
            }, Blockchain.METHODS.GET_VOTES, address)
    }

    //Energy >>>>>
    async getTotalEnergy() {
        this.model.executeViewMethod(
            (results) => {
                this.totalEnergy = Number(results) / 1000;
            }, Blockchain.METHODS.GET_TOTAL_KWH
        );
    }
    async getEnergyRates() {
        this.model.executeViewMethod(
            (results) => {
                this.mintCost = this.fromBigNumber(results["mint"]);
                this.burnCost = this.fromBigNumber(results["burn"]);
            }, Blockchain.METHODS.GET_ENERGY_RATES
        );
    }
    async getConsumptionSessions() {
        this.model.executeViewMethod(
            (results) => {
                const sessions = []
                results.forEach((item) => {
                    const session = item["sessionId"];
                    const kwh = Number(item["wh"]) / 1000;
                    const timestamp = (new Date(Number(item["timestamp"]) * 1000)).toLocaleString();
                    const unit = item["unit"];
                    if (session !== "") {
                        sessions.push({
                            label: timestamp + " >> " + this.strings.storageUnit + ": " + unit,
                            value: kwh + " kWh",
                        })
                    }
                });
                if (sessions.length === 0) {
                    sessions.push({
                        label: this.strings.noData
                    })
                }
                this.sessions = sessions;
            }, Blockchain.METHODS.GET_CONSUMPTION_SESSIONS)
    }
    async getStorageUnitsInfo() {
        this.model.executeViewMethod(
            (results) => {
                const unitInfo = []
                results.forEach((item) => {
                    const state = item["state"];
                    if (state) {
                        const unitAddress = item["owner"];
                        const kwh = Number(item["wh"]) / 1000;
                        unitInfo.push({
                            label: unitAddress,
                            value: kwh + " kWh",
                        })
                    }
                });
                if (unitInfo.length === 0) {
                    unitInfo.push({
                        label: this.strings.noData
                    })
                }
                this.storageUnitInfo = unitInfo;
            }, Blockchain.METHODS.GET_STORAGE_UNIT_INFO)
    }
    async startConsumptionSession(storageUnit, entAmount) {
        if (!this.web3.utils.isAddress(storageUnit)) {
            this.showMessage(this.strings.invalidAddress + " (" + storageUnit + ")");
            return;
        }
        if (entAmount <= 0) {
            this.showMessage(this.strings.invalidEntAmount);
            return;
        }
        if (Number(this.balance[Blockchain.TOKENS.ENT]) < Number(entAmount)) {
            this.showMessage(this.strings.unavailableBalance);
            return;
        }
        this.model.executeModifyStateMethod(
            (results) => {
                console.log(results);
            },  Blockchain.METHODS.START_CONSUMPTION_SESSION, storageUnit, this.toBiglNumber(entAmount)
        );
    }

    //Tokens >>>>>
    async getTotalENT(){
        this.model.executeViewMethod((results) => {
            this.totalENT = this.fromBigNumber(results);
        }, Blockchain.METHODS.GET_TOTAL_ENT);
    }
    async getBalance() {
        let avail = { ENT: 0, EUR: 0 };
        let locked = { ENT: 0, EUR: 0 };
        this.model.executeViewMethod((results) => {
            avail.ENT = this.fromBigNumber(results.available);
            locked.ENT = this.fromBigNumber(results.locked);
            this.model.executeViewMethod((results) => {
                avail.EUR = this.fromBigNumber(results.available);
                locked.EUR = this.fromBigNumber(results.locked);
                this.balance = avail;
                this.lockedBalance = locked;
                this.getTotalENT();
            }, Blockchain.METHODS.BALANCE_EUR)
        }, Blockchain.METHODS.BALANCE_ENT)
    }
    async transferENT(account, amount) {
        this.transferToken(Blockchain.TOKENS.ENT, account, amount)
    }
    async transferEUR(account, amount) {
        this.transferToken(Blockchain.TOKENS.EUR, account, amount)
    }
    async transferToken(token, account, amount) {
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
        if (Number(this.balance[token]) < Number(amount)) {
            this.showMessage(this.strings.unavailableBalance);
            return;
        }
        if (amount <= 0) {
            this.showMessage(this.strings.invalidAmount);
            return;
        }
        if (!this.isAddress(account)) {
            this.showMessage(this.strings.invalidAddress);
            return;
        }
        this.model.executeModifyStateMethod((_) => {
            this.getBalance();
        }, transferMethod, account, this.toBiglNumber(amount))
    }

    //Banker >>>>>
    async getTotalEuro() {
        this.model.executeViewMethod((results) => {
            this.totalEeuro = this.fromBigNumber(results);
        }, Blockchain.METHODS.GET_TOTAL_EURO);
    }
    async getBankerAddress() {
        this.model.executeViewMethod((results) => {
            this.bankerAddress = results;
        }, Blockchain.METHODS.GET_BANKER_ADDRESS);
    }
    async changeBanker(addr) {
        if (!this.isAddress(addr)) {
            this.showMessage(this.strings.invalidAddress);
            return;
        }
        this.model.executeModifyStateMethod((_) => {
            this.getBankerAddress();
        }, Blockchain.METHODS.SET_BANKER_ADDRESS,addr)
    }
    async mintEuro(addr,amount){
        if (!this.isAddress(addr)) {
            this.showMessage(this.strings.invalidAddress);
            return;
        }
        if (amount <= 0){
            this.showMessage(this.strings.invalidAmount);
            return;
        }
        this.model.executeModifyStateMethod((_) => {
            this.getTotalEuro();
        }, Blockchain.METHODS.MINT_EURO,addr,this.toBiglNumber(amount))
    }
    async burnEuro(addr,amount){
        if (!this.isAddress(addr)) {
            this.showMessage(this.strings.invalidAddress);
            return;
        }
        if (amount <= 0){
            this.showMessage(this.strings.invalidAmount);
            return;
        }
        this.model.executeModifyStateMethod((_) => {
            this.getTotalEuro();
        }, Blockchain.METHODS.BURN_EURO,addr,this.toBiglNumber(amount))
    }
    async unlockEuro(addr,amount){
        if (!this.isAddress(addr)) {
            this.showMessage(this.strings.invalidAddress);
            return;
        }
        if (amount <= 0){
            this.showMessage(this.strings.invalidAmount);
            return;
        }
        this.model.executeModifyStateMethod((_) => {
            this.getTotalEuro();
        }, Blockchain.METHODS.UNLOCK_EURO,addr,this.toBiglNumber(amount))
    }
    async lockEuro(amount){
        if (amount <= 0){
            this.showMessage(this.strings.invalidAmount);
            return;
        }
        if (Number(this.balance[Blockchain.TOKENS.EUR]) < Number(amount)) {
            this.showMessage(this.strings.unavailableBalance);
            return;
        }
        this.model.executeModifyStateMethod((_) => {
            this.getBalance();
        }, Blockchain.METHODS.LOCK_EURO,this.toBiglNumber(amount))
    }

    //Network >>>>>
    async getNetworkParameters() {
        this.model.executeViewMethod((results) => {
            const params = {};
            for (let param of Object.keys(results)) {
                if (isNaN(param)){
                    params[param] = this.fromBigNumber(results[param]);
                    if (params[param] < 0.00001){
                        params[param] = params[param] * 10**18;
                    }
                }
            }
            this.networkParameters = params;
        }, Blockchain.METHODS.GET_NETWORK_PARAMETERS);
    }

    //Market >>>>>
    async getOrders() {
        this.model.executeViewMethod(
            (results) => {
                const buyOrders = results[0];
                const sellOrders = results[1];
                const buy = [];
                const sell = [];
                buyOrders.forEach((item) => {
                    if(item["valid"]){
                        const id = item["id"];
                        const user = item["user"];
                        const price = this.fromBigNumber(item["price"]);
                        const quantity = this.fromBigNumber(item["quantity"]);
                        buy.push({
                            label: id + " | " + user,
                            value: quantity + " ENT | " + price + " eEuro/ENT",
                        })
                    }
                });
                sellOrders.forEach((item) => {
                    if(item["valid"]){
                        const id = item["id"];
                        const user = item["user"];
                        const price = this.fromBigNumber(item["price"]);
                        const quantity = this.fromBigNumber(item["quantity"]);
                        sell.push({
                            label: id + " | " + user,
                            value: quantity + " ENT | " + price + " eEuro/ENT",
                        })
                    }
                });
                if (buy.length === 0) {
                    buy.push({
                        label: this.strings.noData
                    })
                }
                if (sell.length === 0) {
                    sell.push({
                        label: this.strings.noData
                    })
                }
                this.orders["buy"] = buy;
                this.orders["sell"] = sell;
            }, Blockchain.METHODS.GET_ORDERS)
    }
    async addBuyOrder(price,quantity){
        this.addOrder(price,quantity,true);
    }
    async addSellOrder(price,quantity){
        this.addOrder(price,quantity,false);
    }
    async removeBuyOrder(id){
        this.removeOrder(id,true);
    }
    async removeSellOrder(id){
        this.removeOrder(id,false);
    }
    async addOrder(price,quantity,isBuy){
        this.model.executeModifyStateMethod((_) => {
            this.getOrders();
        }, Blockchain.METHODS.ADD_ORDER,this.toBiglNumber(price),this.toBiglNumber(quantity),isBuy)
    }
    async removeOrder(id,isBuy){
        this.model.executeModifyStateMethod((_) => {
            this.getOrders();
        }, Blockchain.METHODS.REMOVE_ORDER,id,isBuy)
    }


    //Other >>>>>
    toBiglNumber(number){
        return Web3.utils.toWei(number,"ether")
    }
    fromBigNumber(number){
        return Number(Web3.utils.fromWei(number,"ether"))
    }
    isAddress(address){
        return validator.isAddress(address);
    }
    connect(address) {
        if (this.web3 == null) return;
        this.web3.eth.net.isListening()
            .then(() => {
                this.model.initialize();
                this.connected = true;
                this.address = address;
            })
            .catch(e => {
                console.log(e);
                this.showMessage(this.strings.failedToConnect)
                this.disconect()
            });
    }
    clearMessage() {
        this.messageText = "";
        try {
            clearTimeout(this.messageTimeout);
        } catch { }
    }
    showMessage(text, error = true) {
        this.messageStatus = ((error) ? "error" : "info");
        this.messageText = text;
        this.messageTimeout = setTimeout(() => { this.clearMessage() }, 10000); //Hide message after 10 seconds
    }
    showPopup(state,title,onclick,inputItems,info=[]){
        this.popup = {
            open:true,
            state:state,
            title:title,
            onClick:onclick,
            inputItems:inputItems,
            controller:this,
            info:info
        }
    }
    closePopup(){
        this.popup = {
            open:false,
            state:{},
            title:"",
            onClick:()=>{},
            inputItems:[],
            info:[]
        }
    }
    disconect() {
        this.connected = false;
        this.web3 = null;
    }

}

export default Controller;