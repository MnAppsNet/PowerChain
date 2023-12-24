import React, { useState, useEffect } from "react"
import {
    Flex,
    Box,
    Text,
    Button
} from '@chakra-ui/react'
import PanelList from "../PanelList.js";

const Energy = (props) => {
    const controller = props.controller

    const panels = [
        //ENT Tokens Panel >>>>>
        {
            header: controller.strings.totalEnergyHeader,
            info: [{
                label: controller.strings.available,
                value: (controller.totalEnergy + " kWh")
            }],
            buttons: [
                {
                    button: {
                        onClick: (...args) => controller.updateTotalEnergy(...args)
                    },
                    text: controller.strings.refresh
                }
            ]
        }
    ]

    return (
        <PanelList panels={panels} controller={controller}/>
    )
}

export default Energy