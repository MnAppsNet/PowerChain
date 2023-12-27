import React, { useState, useEffect } from "react"
import Sidebar from "./Sidebar";
import Tokens from "./pages/Tokens.js";
import Energy from "./pages/Energy.js";
import Voting from "./pages/Voting.js";
import {
    FiHome,
    FiWind,
    FiUsers,
    
  } from 'react-icons/fi'

const Dashboard = (props) => {

    class Sections{
        static Tokens = 1;
        static Energy = 2;
        static Voting = 3;
    }
    const [section,setSection] = useState(Sections.Tokens)

    const controller = props.controller;
    const menuItems = [
        { name: controller.strings.tokens, icon: FiHome, action:()=>{ controller.getBalance(); setSection(Sections.Tokens)} },
        { name: controller.strings.energy, icon: FiWind, action:()=>{ 
            controller.getTotalEnergy(); 
            controller.getConsumptionSessions();
            controller.getStorageUnitsInfo();
            setSection(Sections.Energy)} }
    ]
    if (controller.voter){
        menuItems.push({name:controller.strings.voting ,icon: FiUsers, action:()=>{ controller.getVotes(controller.address); setSection(Sections.Voting)}});
    }
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
                    {section === Sections.Voting && (
                        <Voting controller={controller}/>
                    )}
                </Sidebar>
            )
            : (<h1>{controller.strings.connecting}</h1>) }
        </div>
    )
}

export default Dashboard;