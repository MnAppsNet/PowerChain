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
    get votes() { return this.view.state.votes; }
    get sessions() { return this.view.state.sessions; }
    get storageUnitInfo() { return this.view.state.storageUnitInfo; }
    get totalENT() { return this.view.state.totalENT; }
    get totalEeuro() { return this.view.state.totalEeuro; }
    get mintRate() { return this.view.state.mintRate; }
    get burnRate() { return this.view.state.burnRate; }
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
    set sessions(v) { this.view.setState({ sessions: v }); }
    set storageUnitInfo(v) { this.view.setState({ storageUnitInfo: v }); }
    set totalENT(v) { this.view.setState({ totalENT: v }); }
    set mintRate(v) { this.view.setState({ mintRate: v}); }
    set burnRate(v) { this.view.setState({ burnRate: v}); }
    set popup(v) { this.view.setState({ popup: v}); }

    //Voters >>>>>
    async isVoter() {
        this.model.executeViewMethod(
            (result) => {
                this.voter = result;
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
                this.mintRate = this.fromBigNumber(results["mint"]);
                this.burnRate = this.fromBigNumber(results["burn"]);
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
        if (!this.isAddress(account)) {
            this.showMessage(this.strings.invalidAddress);
            return;
        }
        this.model.executeModifyStateMethod((_) => {
            this.getBalance();
        }, transferMethod, account, this.toBiglNumber(amount))
    }

    //Banker >>>>>
    async getTotalEeuro() {
        this.model.executeViewMethod((results) => {
            this.totalEeuro = this.fromBigNumber(results);
        }, Blockchain.METHODS.GET_TOTAL_EEURO);
    }
    async getBankerAddress() {
        this.model.executeViewMethod((results) => {
            this.bankerAddress = results;
        }, Blockchain.METHODS.GET_BANKER_ADDRESS);
    }
    async changeBanker() {
        // !!!!!!!
        this.model.executeModifyStateMethod((_) => {
            this.getBalance();
        }, Blockchain.METHODS.SET_BANKER_ADDRESS)
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