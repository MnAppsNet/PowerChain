import React, { useState, useEffect } from "react"
import Blockchain from "./Blockchain";

class Controller {

    constructor(view){
        this.model = new Blockchain(this);
        this.view = view;
    }

    //Getters >>>>>
    get styles (){ return this.view.state.styles; }
    get colors (){ return this.view.state.colors; }
    get strings () { return this.view.state.strings; }

    get messageText (){ return this.view.state.messageText; }
    get messageStatus (){ return this.view.state.messageStatus; }

    get balanceENT(){ return this.view.state.balance.ENT.toString();}
    get balanceEUR(){ return this.view.state.balance.EUR.toString(); }
    get balance() {return this.view.state.balance;}
    get lockedBalanceENT (){ return this.view.state.lockedBalance.ENT.toString(); }
    get lockedBalanceEUR (){ return this.view.state.lockedBalance.EUR.toString(); }
    get lockedBalance (){return this.view.state.lockedBalance;}
    get totalEnergy(){ return this.view.state.totalEnergy; }
    get address (){ return this.view.state.address; }
    get web3 (){ return this.view.state.web3; }
    get connected (){ return this.view.state.connected; }

    //Setters >>>>>
    set styles (v){ this.view.setState({styles:v}); }
    set colors (v){ this.view.setState({colors:v}); }
    set strings (v){ this.view.setState({strings:v}); }

    set connected(v){ this.view.setState({connected:v}); }

    set messageText (v){ this.view.setState({messageText:v}); }
    set messageStatus (v){ this.view.setState({messageStatus:v}); }

    set address(v) {this.view.setState({address:v});}
    set balance(v) {this.view.setState({balance:v});}
    set lockedBalance(v) {this.view.setState({lockedBalance:v});}
    set totalEnergy(v) {this.view.setState({totalEnergy:v});}
    set address(v) {this.view.setState({address:v});}
    set web3 (v) {
        if (v != null) v.eth.handleRevert = true;
        this.view.setState({web3:v}); }
    
    connect() {
        if (this.web3 == null) return;
        this.web3.eth.net.isListening()
        .then(() => {
            this.model.initialize();
            this.connected = true;
            this.updateBalance();
        })
        .catch(_ => {
            this.showMessage(this.strings.failedToConnect)
            this.disconect()
        });
    }
    clearMessage() {
        this.messageText = "";
        try{
            clearTimeout(this.messageTimeout);
        }catch{}
    }
    showMessage(text, error = true){
      this.messageStatus = ((error) ? "error" : "info");
      this.messageText = text;
      this.messageTimeout = setTimeout(() => { this.clearMessage() }, 10000); //Hide message after 10 seconds
    }
    disconect(){
        this.connected = false;
        this.web3 = null;
    }
    updateTotalEnergy(){
        this.model.updateTotalEnergy();
      }
    updateBalance(){
        this.model.updateBalance();
    }
    transferENT (account,amount){
        this.model.transferToken(Blockchain.TOKENS.ENT,account,amount)
    }
    transferEUR (account,amount) {
        this.model.transferToken(Blockchain.TOKENS.EUR,account,amount)
    }
    addVoter(address) {
        this.model.addVoter(address);
      }
  }

  export default Controller;