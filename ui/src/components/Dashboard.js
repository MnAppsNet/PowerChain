import React, { useState, useEffect } from "react"
import styled, { keyframes, css } from "styled-components";
import Sidebar from "./Sidebar";
import Tokens from "./pages/Tokens.js";
import Energy from "./pages/Energy.js";
import Voting from "./pages/Voting.js";
import {
    FiHome,
    FiWind,
    FiUsers,
    FiRefreshCw
} from 'react-icons/fi'
import {
    Box,
    Button
} from '@chakra-ui/react'

const SpinAnimation = (props) =>{
    const animationTime = props.time;
    const spinAnimationFrames = keyframes`
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }`;
    const spinAnimationCss = css`
        ${spinAnimationFrames} ${animationTime}s normal;`;
    const SpinAnimationDiv = styled.div`
        animation: ${spinAnimationCss};
        width: fit-content;
        hight: fit-content;
        block-size: fit-content;`;
    return(<SpinAnimationDiv>{props.children}</SpinAnimationDiv>)
}

const Dashboard = (props) => {
    class Sections {
        static Tokens = 1;
        static Energy = 2;
        static Voting = 3;
    }
    const controller = props.controller;

    const [section, setSection] = useState(Sections.Tokens);
    const [refreshAnimation, setRefreshAnimation] = useState(0);

    const menuItems = [
        {
            name: controller.strings.tokens, icon: FiHome, action: () => {
                setSection(Sections.Tokens);
            }
        },
        {
            name: controller.strings.energy, icon: FiWind, action: () => {
                setSection(Sections.Energy);
            }
        },
    ]
    if (controller.voter) {
        menuItems.push({
            name: controller.strings.voting, icon: FiUsers, action: () => {
                setSection(Sections.Voting);
            }
        });
    }

    const refresh = () => {
        switch (section) {
            case Sections.Tokens:
                controller.getTotalENT();
                controller.getBalance();
                break;
            case Sections.Energy:
                controller.getTotalEnergy();
                controller.getEnergyRates();
                controller.getConsumptionSessions();
                controller.getStorageUnitsInfo();
                break;
            case Sections.Voting:
                controller.getVotes(controller.address);
                break;
            default:
                break;
        }
        setRefreshAnimation(3);
    }

    useEffect(() => {
        const interval = setInterval(() => refresh(),10000);
        return () => {
          clearInterval(interval);
        };
      }, []);

    useEffect(() => {
        try {
            refresh();
        } catch { return; }
    }, [section]);

    const renderSection = () =>{
            switch(section) {
              case Sections.Tokens:
                return (<Tokens controller={controller} />);
            case Sections.Energy:
                return (<Energy controller={controller} />);
            case Sections.Voting:
                return (<Voting controller={controller} />);
              default:
                return ("");
            }
    }

    return (
        <Box>
            {controller.connected ? (
                <Sidebar items={menuItems} controller={controller}>
                    {renderSection()}
                    <Button
                        onClick={() => refresh()} {...controller.styles.buttonRefresh}>
                        <SpinAnimation time={refreshAnimation}>
                            <FiRefreshCw />
                        </SpinAnimation>
                    </Button>
                </Sidebar>
            )
                : (<h1>{controller.strings.connecting}</h1>)}
        </Box>
    )
}

export default Dashboard;