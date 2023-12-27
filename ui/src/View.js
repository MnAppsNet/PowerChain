import Login from "./components/Login.js";
import Message from "./components/Message.js";
import Dashboard from "./components/Dashboard.js"
import getRevertReason from "eth-revert-reason";
import {
  ChakraProvider,
  Flex,
  Box,
  Text
} from '@chakra-ui/react'
import { Styles, Colors } from './Styles.js'
import Web3 from "web3";
import Controller from "./Controller.js";
import Languages from "./strings.json"
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
      lockedBalance: { ENT: 0, EUR: 0 },
      totalEnergy: 0,
      voter: false,
      votes: [],
      sessions: [],
      storageUnitInfo: [],
    };
    this.state.strings = Languages["EN"];
    this.controller = new Controller(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.web3 !== this.state.web3) {
      if (this.state.web3 != null) {
        // Request account access if needed
        const controller = this.controller;
        window.ethereum.enable().then(function (accounts) {
          console.log('Connected to MetaMask');
          console.log('Account:', accounts[0]);
          controller.connect(accounts[0]);
        }).catch(function (error) {
          console.error('Error connecting to MetaMask:', error);
        });
      }
    }
    if (prevState.address !== this.state.address) {
      if (this.state.address != "") {
        this.controller.isVoter();
        this.controller.getBalance();
      }
    }
  }

  render() {
    return (
      <ChakraProvider resetCSS>
        <div style={this.state.styles.main}>
          {this.state.messageText != "" ? (<Message controller={this.controller} text={this.state.messageText} status={this.state.messageStatus}></Message>) : ("")}
          {this.state.web3 == null ? (
            <Login controller={this.controller}></Login>
          ) : (
            <Dashboard controller={this.controller}></Dashboard>
          )}
        </div>
      </ChakraProvider>
    );

  }
}

export default View;