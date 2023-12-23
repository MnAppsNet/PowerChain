import React from "react"
import {
    Flex,
} from '@chakra-ui/react'
import styles from "../styles.js";
import Panel from "./Panel.js";

const PanelList = (props) => {
    const panels = props.panels;    

    return (
        <Flex alignItems="flex-start"
            justifyContent="flex-start"
            flexDirection="column"
            gap="0.5em">
            {panels.map((p) => (
                <Panel key={p.header} header={p.header} info={p.info} buttons={p.buttons} />
            )
            )}
        </Flex>
    )
}

export default PanelList;