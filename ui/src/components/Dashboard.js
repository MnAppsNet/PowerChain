import React, { useState, useEffect } from "react"
import {
  ChakraProvider
} from '@chakra-ui/react'
import styles from "./../styles.css";
import Web3 from "web3"

const Dashboard = (props) => {

    const [connected, setConnected] = useState(false);

    const Tools = props.Tools
    const web3 = new Web3(Tools.RpcUrl);
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
            { connected ? (<h1>Work In Progress...</h1>)
            : (<h1>{Tools.strings.connecting}</h1>) }
        </ChakraProvider>
    )
}

export default Dashboard