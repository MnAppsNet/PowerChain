import React, { useState, useEffect } from "react"
import Login from "./components/Login";
import Message from "./components/Message";
import Dashboard from "./components/Dashboard"
import styles from "./styles.css";
import Languages from "./strings.json"
import Contracts from "./contracts";
import getRevertReason from "eth-revert-reason";
import {
  ChakraProvider,
  Flex,
  Box,
  Text
} from '@chakra-ui/react'
import Web3 from "web3";

function App() {
  const [address,setAddress] = useState("")
  const [web3, setWeb3] = useState(null);
  const [Language, setLanguage] = useState("EN");
  const [MessageText, setMessageText] = useState("");
  const [MessageStatus, setMessageStatus] = useState("");
  const [balance,setBalance] = useState(0);
  const [lockedBalance,setLockedBalance] = useState(0);

  class Tools {
    static strings = Languages.EN
    static balance = () => balance
    static lockedBalance = () => lockedBalance
    static address = () => address
    static web3 = () => web3
    static PowerChain = null;
    static showMessage = (text,error=true) => {
      setMessageStatus((error)?"error":"info")
      setMessageText(text)
      setTimeout(() => {Tools.clearMessage()}, 10000); //Hide message after 10 seconds
    }
    static setAddress = (a) => {
      setAddress(a)
    }
    static clearMessage = () => {
      setMessageText("")
    }
    static setWeb3 = (w) => {
      w.eth.handleRevert = true;
      Tools.PowerChain = new w.eth.Contract(Contracts.PowerChain["abi"], Contracts.PowerChain["address"])
      setWeb3(w);
    }
    static disconect = () => {
      setWeb3(null)
    }
    static updateBalance = () => {
      if (Tools.PowerChain == null) Tools.PowerChain = new web3.eth.Contract(Contracts.PowerChain["abi"], Contracts.PowerChain["address"]);
      Tools.PowerChain.methods.balance(address).call() //send({from: address, type:"0x0", gasPrice:"0"})
      .then((results) => {
        setBalance(web3.utils.fromWei(results.available,"ether")); //Not really ether but ENT uses also 10^18 multiplier for decimals
        setLockedBalance(web3.utils.fromWei(results.locked,"ether"));
      })
      .catch(function(error) {
        try{
          Tools.showMessage(error.receipt.events.Withdrawal.returnValues[0])
        }
        catch{}
      });
    }
    static transfer = (amnt) => {
      if (balance < amnt){
        Tools.showMessage(Tools.strings.unavailableBalance);
        return;
      }
      Tools.PowerChain.methods.transfer(address).call()
      .then((results) => {
        setBalance(web3.utils.fromWei(results.available,"ether")); //Not really ether but ENT uses also 10^18 multiplier for decimals
        setLockedBalance(web3.utils.fromWei(results.locked,"ether"));
      })
      .catch(function(error) {
        try{
          Tools.showMessage(error.receipt.events.Withdrawal.returnValues[0])
        }
        catch{}
      });
      // Transfer to be send to PowerChain contract
    }
  }

  useEffect(() => {
    Tools.strings = Languages[Language]
  }, [Language]);
  
  useEffect(() => {
    if (address == "") return
    Tools.updateBalance()
  }, [address]);

  return (
    <ChakraProvider resetCSS>
      <div className={styles.main}>
        {MessageText != "" ? (<Message Tools={Tools} text={MessageText} status={MessageStatus}></Message>):("")}
        {web3 == null ? (
          <Login Tools={Tools}></Login>
        ) : (
          <Dashboard Tools={Tools}></Dashboard>
        )}
      </div>
    </ChakraProvider>
  );
}

export default App;