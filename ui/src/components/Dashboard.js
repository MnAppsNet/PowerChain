import React, { useState, useEffect } from "react"
import Sidebar from "./Sidebar";
import Tokens from "./Tokens";
import styles from './../styles.css';
import {
  Flex,
  Box,
  Text,
  Alert
} from '@chakra-ui/react'
import {
    FiHome,
    FiWind
  } from 'react-icons/fi'
import contracts from "../contracts";

const Dashboard = (props) => {
    const [connected, setConnected] = useState(false);
    const Tools = props.Tools
    const web3 = Tools.web3()
    const menuItems = [
        { name: Tools.strings.tokens, icon: FiHome, action:()=>{alert("Tokens")} },
        { name: Tools.strings.energy, icon: FiWind, action:()=>{alert("Energy")} }
    ]
    web3.eth.net.isListening()
    .then(() => {
        setConnected(true)
        
    })
    .catch(_ => {
        Tools.showMessage(Tools.strings.failedToConnect)
        Tools.disconect()
    });
    return (
        <div>
            { connected ? (
                <Sidebar items={menuItems}>
                    <Tokens Tools={Tools}></Tokens>
                </Sidebar>
            )
            : (<h1>{Tools.strings.connecting}</h1>) }
        </div>
    )
}

export default Dashboard