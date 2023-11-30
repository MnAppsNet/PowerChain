import React, { useState, useEffect } from "react"
import Sidebar from "./Sidebar";
import Home from "./Home";
import styles from './../styles.css';
import {
  Flex,
  Box,
  Text
} from '@chakra-ui/react'
import contracts from "../contracts";

const Dashboard = (props) => {
    const [connected, setConnected] = useState(false);
    const Tools = props.Tools
    const web3 = Tools.web3()
    
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
                <Sidebar>
                    <Home Tools={Tools}></Home>
                </Sidebar>
            )
            : (<h1>{Tools.strings.connecting}</h1>) }
        </div>
    )
}

export default Dashboard