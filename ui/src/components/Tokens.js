import React, { useState, useEffect } from "react"
import {
    Flex,
    Box,
    Text,
    Button
  } from '@chakra-ui/react'
import { SlRefresh } from "react-icons/sl";
import PopupInput from "./PopupInput"

const Tokens = (props) => {
    const Tools = props.Tools
    const web3 = Tools.web3()

    return (
        <Flex alignItems="flex-start"
              justifyContent="flex-start"
              flexDirection="column"
              gap="0.5em">
            <Box borderWidth="0.2em" width="100%" padding="1em">
                <Text fontSize="xl">Balance: {Tools.balance()} ENT </Text>
                <Box display="flex" alignItems="center" gap="0.3em"><Text fontSize="xl">Locked: {Tools.lockedBalance()} ENT </Text><SlRefresh onClick={Tools.updateBalance} cursor="pointer" /></Box>
                <PopupInput 
                    type="number" 
                    title={Tools.strings.transfer}
                    label="Transfer"
                    inputItems = {[{
                     id: "account",
                     text: "Account Address",
                     type: "text",
                     default: ""
                    },{
                     id: "amount",
                     text: "Amount",
                     type: "number",
                     default: 0
                    }]}
                    onClick={Tools.transfer} />
            </Box>
            <Box borderWidth="0.2em" width="100%" padding="1em">
                <Text fontSize="xl">WIP</Text>
            </Box>
        </Flex>
    )
}

export default Tokens