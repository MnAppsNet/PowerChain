import React from "react"
import PanelList from "../PanelList.js";
import Blockchain from "../../Blockchain.js";

const Energy = (props) => {
    const controller = props.controller;

    //Add "Consume" button on each storage unit label
    const storageUnitInfo = controller.storageUnitInfo;
    for (let i = 0; i < storageUnitInfo.length; i++) {
        storageUnitInfo[i].button = {
            popup: {
                title: controller.strings.startSession,
                label: controller.strings.consumeEnergy,
                info: [
                    controller.strings.available + ": "+controller.balance[Blockchain.TOKENS.ENT]+" "+Blockchain.TOKENS.ENT,
                    controller.strings.energy+ ": {amount - amount * burnCost} kwh"
                ],
                inputItems: [{
                    id: "account",
                    text: controller.strings.storageUnitAddress,
                    type: "text",
                    default: storageUnitInfo[i].label
                }, {
                    id: "amount",
                    text: controller.strings.burnAmount,
                    type: "number",
                    default: 0
                }],
                onClick: (...args) => controller.startConsumptionSession(...args)
            }
        };
    }
    const panels = [
        //Total Energy Panel >>>>>
        {
            header: controller.strings.totalEnergyHeader,
            info: [{
                label: controller.strings.available,
                value: (controller.totalEnergy + " kWh")
            }, {
                label: controller.strings.burnCost,
                value: (controller.burnCost + " ENT/kWh")
            }, {
                label: controller.strings.mintCost,
                value: (controller.mintCost + " ENT/kWh")
            }],
            buttons: null
        },
        //User Consumption Sessions Panel >>>>>
        {
            header: controller.strings.consumptionSessions,
            info: controller.sessions,
            buttons: [{
                popup: {
                    title: controller.strings.startSession,
                    label: controller.strings.startSession,
                    info: [
                        controller.strings.available + ": "+controller.balance[Blockchain.TOKENS.ENT]+" "+Blockchain.TOKENS.ENT,
                        controller.strings.energy+ ": {amount - amount * burnCost} kwh"
                    ],
                    inputItems: [{
                        id: "account",
                        text: controller.strings.storageUnitAddress,
                        type: "text",
                        default: ""
                    }, {
                        id: "amount",
                        text: controller.strings.burnAmount,
                        type: "number",
                        default: 0
                    }],
                    onClick: (...args) => controller.startConsumptionSession(...args)
                }
            }]
        },
        //Storage Units >>>>>
        {
            header: controller.strings.storageUnits,
            info: storageUnitInfo,
            buttons: null
        }
    ]

    return (
        <PanelList panels={panels} controller={controller} />
    )
}

export default Energy