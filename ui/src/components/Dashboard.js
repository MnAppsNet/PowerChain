import React, { useState, useEffect } from "react"
import styled, { keyframes, css } from "styled-components";
import Sidebar from "./Sidebar";
import Tokens from "./pages/Tokens.js";
import Energy from "./pages/Energy.js";
import Voting from "./pages/Voting.js";
import Banker from "./pages/Banker.js";
import Market from "./pages/Market.js";
import {
    FiHome,
    FiWind,
    FiUsers,
    FiRefreshCw,
    FiInfo,
} from 'react-icons/fi'
import {
    FaMoneyCheck,
    FaStore
} from 'react-icons/fa'
import {
    Box,
    Button
} from '@chakra-ui/react'
import Network from "./pages/Network.js";

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
        static Network = 3;
        static Market = 4;
        static Voting = 5;
        static Banker = 6;
    }
    const controller = props.controller;

    const [section, setSection] = useState(Sections.Tokens);
    const [refreshAnimation, setRefreshAnimation] = useState(0);

    const menuItems = [
        {
            name: controller.strings.tokens, icon: FiHome, action: () => {
                setSection(Sections.Tokens);
            }
        }, {
            name: controller.strings.energy, icon: FiWind, action: () => {
                setSection(Sections.Energy);
            }
        }, {
            name: controller.strings.networkInfo, icon: FiInfo, action: () => {
                setSection(Sections.Network);
            }
        }, {
            name: controller.strings.market, icon: FaStore, action: () => {
                setSection(Sections.Market);
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
    if (controller.banker) {
        menuItems.push({
            name: controller.strings.banker, icon: FaMoneyCheck, action: () => {
                setSection(Sections.Banker);
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
            case Sections.Network:
                controller.getTotalEuro();
                controller.getBankerAddress();
                controller.getNetworkParameters();
                break;
            case Sections.Banker:
                controller.getTotalEuro();
                break;
            case Sections.Market:
                controller.getOrders();
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
                case Sections.Network:
                    return (<Network controller={controller} />);
                case Sections.Banker:
                    return (<Banker controller={controller} />);
                case Sections.Market:
                    return (<Market controller={controller} />);
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