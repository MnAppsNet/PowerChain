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
  const [balance,setBalance] = useState(false);

  class Tools {
    static strings = Languages.EN
    static balance = () => balance
    static address = () => address
    static web3 = () => web3
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
      setWeb3(w);
    }
    static disconect = () => {
      setWeb3(null)
    }
    static updateBalance = () => {
      web3.eth.getBalance(Tools.address()).then((balance) => {
        console.log(balance)
        setBalance(web3.utils.toWei(balance,"wei") + " wei")
    })
    }
    static getGass = () => {
      const contract = new web3.eth.Contract(Contracts.faucet["abi"], Contracts.faucet["address"]);
      contract.methods.withdraw().send({from: address, type:"0x0", gasPrice:"0"})
      .then((events) => {
        Tools.updateBalance()
      })
      .catch(function(error) {
        try{
          Tools.showMessage(error.receipt.events.Withdrawal.returnValues[0])
        }
        catch{}
      });
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