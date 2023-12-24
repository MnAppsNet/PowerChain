import React from "react"
import {
    Flex,
} from '@chakra-ui/react'
import Panel from "./Panel.js";

const PanelList = (props) => {
    const panels = props.panels;
    const controller = props.controller;

    return (
        <Flex alignItems="flex-start"
            justifyContent="flex-start"
            flexDirection="column"
            gap="0.5em">
            {panels.map((p) => (
                <Panel controller={controller} key={p.header} header={p.header} info={p.info} buttons={p.buttons} />
            )
            )}
        </Flex>
    )
}

export default PanelList;