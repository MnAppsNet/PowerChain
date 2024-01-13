import React from "react"
import PanelList from "../PanelList.js";

const Tokens = (props) => {
    const controller = props.controller;

    const panels = [
        //Total ENT in Circulation Panel >>>>>
        {
            header: controller.strings.totalENT,
            info: [{
                label: controller.strings.total,
                value: controller.totalENT + " ENT"
            }],
            buttons: null
        },
        //ENT Tokens Panel >>>>>
        {
            header: controller.strings.ENTHeader,
            info: [
            {
                label: controller.strings.address,
                value: controller.address
            },
            {
                label: controller.strings.available,
                value: (controller.balanceENT + " ENT")
            }, {
                label: controller.strings.locked,
                value: (controller.lockedBalanceENT + " ENT")
            }],
            buttons: [
                {
                    popup: {
                        type: "number",
                        title: controller.strings.transfer,
                        label: controller.strings.transfer,
                        inputItems: [{
                            id: "account",
                            text: controller.strings.accountAddress,
                            type: "text",
                            default: ""
                        }, {
                            id: "amount",
                            text: controller.strings.amount,
                            type: "number",
                            default: 0
                        }],
                        onClick: (...args) => controller.transferENT(...args)
                    }
                }
            ]
        },
        //EUR Tokens Panel >>>>>
        {
            header: controller.strings.eEURHeader,
            info: [{
                label: controller.strings.available,
                value: (controller.balanceEUR + " EUR")
            }, {
                label: controller.strings.locked,
                value: (controller.lockedBalanceEUR + " EUR")
            }],
            buttons: [
                {
                    popup: {
                        type: "number",
                        title: controller.strings.transfer,
                        label: "Transfer",
                        inputItems: [{
                            id: "account",
                            text: controller.strings.accountAddress,
                            type: "text",
                            default: ""
                        }, {
                            id: "amount",
                            text: controller.strings.amount,
                            type: "number",
                            default: 0
                        }],
                        onClick: (...args) => controller.transferEUR(...args)
                    }
                }
            ]
        }
    ]

    return (
        <PanelList panels={panels} controller={controller} />
    )
}

export default Tokens