import React, { useState, useEffect } from "react"
import {
    Flex,
    Box,
    Text,
    Button
} from '@chakra-ui/react'
import { SlRefresh } from "react-icons/sl";
import PopupInput from "../PopupInput.js"
import styles from "../../styles.js";
import PanelList from "../PanelList.js";

const Tokens = (props) => {
    const Tools = props.Tools
    const web3 = Tools.web3()

    const panels = [
        //ENT Tokens Panel >>>>>
        {
            header: Tools.strings.ENTHeader,
            info: [{
                label: Tools.strings.available,
                value: (Tools.balanceENT() + " ENT")
            }, {
                label: Tools.strings.locked,
                value: (Tools.lockedBalanceENT() + " ENT")
            }],
            buttons: [
                {
                    popup: {
                        type: "number",
                        title: Tools.strings.transfer,
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
                        onClick: Tools.transferENT
                    }
                }, {
                    button: {
                        onClick: Tools.updateBalance
                    },
                    text: Tools.strings.refresh
                }
            ]
        },
        //EUR Tokens Panel >>>>>
        {
            header: Tools.strings.eEURHeader,
            info: [{
                label: Tools.strings.available,
                value: (Tools.balanceEUR() + " EUR")
            }, {
                label: Tools.strings.locked,
                value: (Tools.lockedBalanceEUR() + " EUR")
            }],
            buttons: [
                {
                    popup: {
                        type: "number",
                        title: Tools.strings.transfer,
                        label: "Transfer",
                        inputItems: [{
                            id: "account",
                            text: Tools.strings.accountAddress,
                            type: "text",
                            default: ""
                        }, {
                            id: "amount",
                            text: Tools.strings.amount,
                            type: "number",
                            default: 0
                        }],
                        onClick: Tools.transferEUR
                    }
                }, {
                    button: {
                        onClick: Tools.updateBalance
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

export default Tokens