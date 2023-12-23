import React, { useState, useEffect } from "react"
import {
    Flex,
    Box,
    Text,
    Button
} from '@chakra-ui/react'
import styles from "../../styles.js";
import PanelList from "../PanelList.js";

const Energy = (props) => {
    const Tools = props.Tools
    const web3 = Tools.web3()

    const panels = [
        //ENT Tokens Panel >>>>>
        {
            header: Tools.strings.totalEnergyHeader,
            info: [{
                label: Tools.strings.available,
                value: (Tools.totalEnergy() + " kWh")
            }],
            buttons: [
                {
                    button: {
                        onClick: Tools.updateTotalEnergy
                    },
                    text: Tools.strings.refresh
                }
            ]
        }
    ]

    return (
        <PanelList panels={panels}/>
    )
}

export default Energy