import React, { useState, useEffect } from "react"
import {
    Flex,
    Box,
    Text,
    Button
} from '@chakra-ui/react'
import { SlRefresh } from "react-icons/sl";
import PopupInput from "../PopupInput.js"
import PanelList from "../PanelList.js";

const Tokens = (props) => {
    const controller = props.controller;

    const panels = [
        //ENT Tokens Panel >>>>>
        {
            header: controller.strings.ENTHeader,
            info: [{
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
                        label: "Transfer",
                        inputItems: [{
                            id: "account",
                            text: "Account Address",
                            type: "text",
                            default: ""
                        }, {
                            id: "amount",
                            text: "Amount",
                            type: "number",
                            default: 0
                        }],
                        onClick: (...args) => controller.transferENT(...args)
                    }
                }, {
                    button: {
                        onClick: (...args) => controller.updateBalance(...args)
                    },
                    text: controller.strings.refresh
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
                }, {
                    button: {
                        onClick: (...args) => controller.updateBalance(...args)
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

export default Tokens