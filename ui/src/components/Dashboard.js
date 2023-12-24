import React, { useState, useEffect } from "react"
import Sidebar from "./Sidebar";
import Tokens from "./pages/Tokens.js";
import Energy from "./pages/Energy.js";
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
    const controller = props.controller
    const web3 = controller.web3
    const menuItems = [
        { name: controller.strings.tokens, icon: FiHome, action:()=>{ controller.updateBalance(); setSection(Sections.Tokens)} },
        { name: controller.strings.energy, icon: FiWind, action:()=>{ controller.updateTotalEnergy(); setSection(Sections.Energy)} }
    ]
    return (
        <div>
            { controller.connected ? (
                <Sidebar items={menuItems} controller={controller}>
                    {section === Sections.Tokens && (
                        <Tokens controller={controller}/>
                    )}
                    {section === Sections.Energy && (
                        <Energy controller={controller}/>
                    )}
                </Sidebar>
            )
            : (<h1>{controller.strings.connecting}</h1>) }
        </div>
    )
}

export default Dashboard;