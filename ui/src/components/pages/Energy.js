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
        //Total Energy Panel >>>>>
        {
            header: controller.strings.totalEnergyHeader,
            info: [{
                label: controller.strings.available,
                value: (controller.totalEnergy + " kWh")
            }],
            buttons: [
                {
                    button: {
                        onClick: (...args) => controller.getTotalEnergy(...args)
                    },
                    text: controller.strings.refresh
                }
            ]
        },
        //User Consumption Sessions Panel >>>>>
        {
            header: controller.strings.consumptionSessions,
            info: controller.sessions,
            buttons: [
                {
                    button: {
                        onClick: (...args) => controller.getConsumptionSessions(...args)
                    },
                    text: controller.strings.refresh
                }
            ]
        },
        //Storage Units >>>>>
        {
            header: controller.strings.storageUnits,
            info: controller.storageUnitInfo,
            buttons: [
                {
                    button: {
                        onClick: (...args) => controller.getStorageUnitsInfo(...args)
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