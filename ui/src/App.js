import React, { useState, useEffect } from "react"
import Login from "./components/Login";
import Message from "./components/Message";
import Dashboard from "./components/Dashboard"
import Languages from "./strings.json"
import Contracts from "./contracts";
import getRevertReason from "eth-revert-reason";
import {
  ChakraProvider,
  Flex,
  Box,
  Text
} from '@chakra-ui/react'
import styles from './styles.js'
import Web3 from "web3";

function App() {
  const [address, setAddress] = useState("")
  const [web3, setWeb3] = useState(null);
  const [Language, setLanguage] = useState("EN");
  const [MessageText, setMessageText] = useState("");
  const [MessageStatus, setMessageStatus] = useState("");
  const [balance, setBalance] = useState({ENT:0,EUR:0});
  const [lockedBalance, setLockedBalance] = useState({ENT:0,EUR:0});
  const [totalEnergy, setTotalEnergy] = useState(0);
  const style = styles;
  const [contract, setContract] = useState(null);

  class Tools {
    static strings = Languages.EN;
    static events;
    static totalEnergy = () => totalEnergy;
    static balanceENT = () => balance.ENT.toString();
    static balanceEUR = () => balance.EUR.toString();
    static lockedBalanceENT = () => lockedBalance.ENT.toString();
    static lockedBalanceEUR = () => lockedBalance.EUR.toString();
    static address = () => address;
    static web3 = () => web3;
    static contract = () => contract;
    static showMessage = (text, error = true) => {
      setMessageStatus((error) ? "error" : "info")
      setMessageText(text)
      setTimeout(() => { Tools.clearMessage() }, 10000); //Hide message after 10 seconds
    }
    static setAddress = (a) => {
      setAddress(a)
    }
    static clearMessage = () => {
      setMessageText("")
    }
    static setweb3 = (w) => {
      w.eth.handleRevert = true;
      const powerchainContract = new w.eth.Contract(Contracts.PowerChain["abi"], Contracts.PowerChain["address"]);
      powerchainContract.handleRevert = true;
      setContract(powerchainContract)
      setWeb3(w);
    }
    static disconect = () => {
      setWeb3(null)
    }
    static updateTotalEnergy = () => {
      if (contract == null) return;
      Tools.executeViewMethod(
        (results) => {
          setTotalEnergy(web3.utils.fromWei(results, "ether"));
        }, "getTotalKwh"
      );
    }
    static updateBalance = () => {
      if (contract == null) return;
      let avail = {ENT:0,EUR:0};
      let locked = {ENT:0,EUR:0};
      Tools.executeViewMethod((results) => {
        avail.ENT = Number(web3.utils.fromWei(results.available, "ether")); //Not really ether but ENT uses also 10^18 multiplier for decimals
        locked.ENT = Number(web3.utils.fromWei(results.locked, "ether"));
      },"balanceENT",address)
      Tools.executeViewMethod((results) => {
        avail.EUR = Number(web3.utils.fromWei(results.available, "ether"));
        locked.EUR = Number(web3.utils.fromWei(results.locked, "ether"));
        setBalance(avail); 
        setLockedBalance(locked);
      },"balanceeEuro",address)
    }
    static transferENT = (account,amount) => {
      Tools.transferToken("ENT","",account,amount)
    }
    static transferEUR = (account,amount) => {
      Tools.transferToken("EUR","transfereEuro",account,amount)
    }
    static transferToken(token,transferMethod,account,amount){
      if (Number(balance[token]) < Number(amount)) {
        Tools.showMessage(Tools.strings.unavailableBalance);
        return;
      }
      if (!web3.utils.isAddress(account)){
        Tools.showMessage(Tools.strings.invalidAddress);
        return;
      }
      Tools.executeModifyStateMethod((results) => {
        Tools.updateBalance();
      }, transferMethod, account, amount)
    }
    static addVoter(address) {
      Tools.executeModifyStateMethod(
        (results) => {
          console.log(results);
        }, "addVoter", address)
    }

    static executeViewMethod(callback, method, ...args) {
      contract.methods[method](...args).call()
        .then((results) => {
          try {
            if ('events' in results)
              if ('Error' in results.events) {
                Tools.showMessage(results.events.Error.returnValues[0]);
                return;
              }
          }catch{}
          callback(results);
        })
        .catch((e) => {
          console.log(e);
          Tools.showMessage("Failed to execute method '"+method+"'");
        });
    }
    static executeModifyStateMethod(callback, method, ...args) {
      contract.methods[method](...args).send({ from: address, gasPrice: 0, type: '0x1' }, (error, txh) => {
        console.log(error);
        }).then((results) => {
          if ('Error' in results.events) {
            Tools.showMessage(results.events.Error.returnValues[0]);
            return;
          }
          callback(results)
        })
        .catch((e) => {console.log(e);Tools.showMessage("Failed to execute method '" + method + "'")});
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
      <div style={styles.main}>
        {MessageText != "" ? (<Message Tools={Tools} text={MessageText} status={MessageStatus}></Message>) : ("")}
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