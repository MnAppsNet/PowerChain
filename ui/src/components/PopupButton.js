import React from "react"
import {
    ChakraProvider,
    Button
} from '@chakra-ui/react'
import { Parser } from 'expr-eval';

const PopupButton = (props) => {
    const label = props.label;
    const title = props.title;
    const controller = props.controller;
    const inputItems = props.inputItems;
    const onClick = props.onClick;
    const info = props.info;

    const openButton = (e) => {
        const state = {}
        for (const [_, value] of Object.entries(inputItems)) {
            state[value.id] = value.default;
        }
        controller.showPopup(state, title, onClick, inputItems,(info)?(info):([]));
    }

    return (
        <ChakraProvider resetCSS>
            <Button onClick={openButton}  {...controller.styles.button}>{label}</Button>
        </ChakraProvider>
    )
}

export default PopupButton