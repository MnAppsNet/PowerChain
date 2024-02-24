import React from "react"
import PanelList from "../PanelList.js";

const Banker = (props) => {
    const controller = props.controller;
    const panels = [
        {
            //Total eEuro >>>>>
            header: controller.strings.totalEeuro,
            info: [{
                label: controller.strings.total,
                value: (controller.totalEeuro + " eEuro")
            }],
            buttons: null
        },
        {
            //Banker Actions >>>>>
            header: controller.strings.castVote,
            info: null,
            buttons: [
                {
                    //Mint eEuro
                    popup: {
                        type: "text",
                        title: controller.strings.mintEuro,
                        label: controller.strings.mintEuro,
                        inputItems: [{
                            id: "address",
                            text: controller.strings.address,
                            type: "text",
                            default: "0x..."
                        },{
                            id: "amount",
                            text: controller.strings.amount,
                            type: "number",
                            default: "0"
                        }],
                        onClick: (...args) => controller.mintEuro(...args)
                    }
                },
                {
                    //Burn eEuro
                    popup: {
                        type: "text",
                        title: controller.strings.burnEuro,
                        label: controller.strings.burnEuro,
                        inputItems: [{
                            id: "address",
                            text: controller.strings.address,
                            type: "text",
                            default: "0x..."
                        },{
                            id: "amount",
                            text: controller.strings.amount,
                            type: "number",
                            default: "0"
                        }],
                        onClick: (...args) => controller.burnEuro(...args)
                    }
                },
                {
                    //Unlock eEuro
                    popup: {
                        type: "text",
                        title: controller.strings.unlockEuro,
                        label: controller.strings.unlockEuro,
                        inputItems: [{
                            id: "address",
                            text: controller.strings.address,
                            type: "text",
                            default: "0x..."
                        },{
                            id: "amount",
                            text: controller.strings.amount,
                            type: "number",
                            default: "0"
                        }],
                        onClick: (...args) => controller.unlockEuro(...args)
                    }
                }
            ]
        }
    ]

    return (
        <PanelList panels={panels} controller={controller} />
    )
}

export default Banker;