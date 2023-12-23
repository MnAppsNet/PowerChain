import React, { useState, useEffect } from "react"
import Sidebar from "./Sidebar";
import Tokens from "./pages/Tokens.js";
import Energy from "./pages/Energy.js";
import styles from '../styles.js';
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

const Dashboard = (props) => {

    class Sections{
        static Tokens = 1;
        static Energy = 2;
    }

    const [connected, setConnected] = useState(false);
    const [section,setSection] = useState(Sections.Tokens)
    const Tools = props.Tools
    const web3 = Tools.web3()
    const menuItems = [
        { name: Tools.strings.tokens, icon: FiHome, action:()=>{ Tools.updateBalance(); setSection(Sections.Tokens)} },
        { name: Tools.strings.energy, icon: FiWind, action:()=>{ Tools.updateTotalEnergy(); setSection(Sections.Energy)} }
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
                    {section === Sections.Tokens && (
                        <Tokens Tools={Tools}/>
                    )}
                    {section === Sections.Energy && (
                        <Energy  Tools={Tools}/>
                    )}
                </Sidebar>
            )
            : (<h1>{Tools.strings.connecting}</h1>) }
        </div>
    )
}

export default Dashboard