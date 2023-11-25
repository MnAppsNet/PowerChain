import React, { useState, useEffect } from "react"
import Sidebar from "./Sidebar";
import {
  ChakraProvider
} from '@chakra-ui/react'
import styles from "./../styles.css";
import Web3 from "web3"

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
        <ChakraProvider resetCSS>
            { connected ? (
                <Sidebar></Sidebar>
            )
            : (<h1>{Tools.strings.connecting}</h1>) }
        </ChakraProvider>
    )
}

export default Dashboard