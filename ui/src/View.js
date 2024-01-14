import Login from "./components/Login.js";
import Message from "./components/Message.js";
import Dashboard from "./components/Dashboard.js"
import {
  ChakraProvider,
} from '@chakra-ui/react'
import { Styles, Colors } from './Styles.js'
import Controller from "./Controller.js";
import Languages from "./strings.json"
import Popup from "./components/Popup.js"
import React from "react";

class View extends React.Component {

  constructor() {
    super();
    this.state = {
      styles: Styles,
      colors: Colors,
      strings: null,
      Language: "EN",
      address: "",
      web3: null,
      connected: false,
      messageText: "",
      messageStatus: "",
      balance: { ENT: 0, EUR: 0 },
      totalENT: 0,
      totalEeuro: 0,
      lockedBalance: { ENT: 0, EUR: 0 },
      totalEnergy: 0,
      mintRate: 0,
      burnRate: 0,
      voter: false,
      votes: [],
      sessions: [],
      storageUnitInfo: [],
      bankerAddress: "",
      networkParameters: {},
      popup:{
        open:false,
        state:{},
        title:"",
        onClick:()=>{},
        inputItems:[],
        info:[]
      },
    };
    this.state.strings = Languages["EN"];
    this.controller = new Controller(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.web3 !== this.state.web3) {
      if (this.state.web3 != null) {
        // Request account access if needed
        try{
        const controller = this.controller;
        window.ethereum.enable().then(function (accounts) {
          console.log('Connected to MetaMask');
          console.log('Account:', accounts[0]);
          controller.connect(accounts[0]);
        }).catch(function (error) {
          console.error(controller.strings.metamaskError, error);
          controller.showMessage(controller.strings.metamaskError);
        });
      }catch{
        this.setState({web3 : null});
        console.error(this.controller.strings.metamaskNotFound);
        this.controller.showMessage(this.controller.strings.metamaskNotFound);
      }
      }
    }
    if (prevState.address !== this.state.address) {
      if (this.state.address !== "") {
        this.controller.isVoter();
        this.controller.getBalance();
      }
    }
  }

  render() {
    return (
      <ChakraProvider resetCSS>
        <div style={this.state.styles.main}>
          {this.state.messageText !== "" ? (<Message controller={this.controller} text={this.state.messageText} status={this.state.messageStatus}></Message>) : ("")}
          {this.state.web3 == null ? (
            <Login controller={this.controller}></Login>
          ) : (
            <>
              <Popup properties={this.state.popup}></Popup>
              <Dashboard controller={this.controller}></Dashboard>
            </>
          )}
        </div>
      </ChakraProvider>
    );
  }
}

export default View;