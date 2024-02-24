import React from "react"
import {
    Flex,
    Box,
    Text,
    Button
} from '@chakra-ui/react'
import PanelList from "../PanelList.js";

const Voting = (props) => {
    const controller = props.controller;
    const panels = [
        {
            //My Votes >>>>>
            header: controller.strings.myVotes,
            info: controller.votes,
            buttons: null
        }, {
            //Cast Votes >>>>>
            header: controller.strings.castVote,
            info: null,
            buttons: [
                {
                    //Add Voter
                    popup: {
                        type: "text",
                        title: controller.strings.addVoter,
                        label: controller.strings.addVoter,
                        inputItems: [{
                            id: "address",
                            text: controller.strings.address,
                            type: "text",
                            default: "0x..."
                        }],
                        onClick: (...args) => controller.addVoter(...args)
                    }
                },
                {
                    //Remove Voter
                    popup: {
                        type: "text",
                        title: controller.strings.removeVoter,
                        label: controller.strings.removeVoter,
                        inputItems: [{
                            id: "address",
                            text: controller.strings.address,
                            type: "text",
                            default: "0x..."
                        }],
                        onClick: (...args) => controller.removeVoter(...args)
                    }
                },
                {
                    //Add Storage Unit
                    popup: {
                        type: "text",
                        title: controller.strings.addStorageUnit,
                        label: controller.strings.addStorageUnit,
                        inputItems: [{
                            id: "address",
                            text: controller.strings.storageUnitAddress,
                            type: "text",
                            default: "0x..."
                        }, {
                            id: "owner",
                            text: controller.strings.storageUnitOwner,
                            type: "text",
                            default: "0x..."
                        }],
                        onClick: (...args) => controller.addStorageUnit(...args)
                    }
                },
                {
                    //Remove Storage Unit
                    popup: {
                        type: "text",
                        title: controller.strings.removeStorageUnit,
                        label: controller.strings.removeStorageUnit,
                        inputItems: [{
                            id: "address",
                            text: controller.strings.address,
                            type: "text",
                            default: "0x..."
                        }],
                        onClick: (...args) => controller.removeStorageUnit(...args)
                    }
                },
                {
                    //Change Banker Address
                    popup: {
                        type: "text",
                        title: controller.strings.changeBanker,
                        label: controller.strings.changeBanker,
                        inputItems: [{
                            id: "address",
                            text: controller.strings.address,
                            type: "text",
                            default: "0x..."
                        }],
                        onClick: (...args) => controller.changeBanker(...args)
                    }
                }
            ]
        }
    ]

    return (
        <PanelList panels={panels} controller={controller} />
    )
}

export default Voting;