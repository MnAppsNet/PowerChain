import React, { useState, useEffect } from "react"
import {
    Flex,
    Box,
    Text,
    Button
  } from '@chakra-ui/react'

const Home = (props) => {
    const Tools = props.Tools
    const web3 = Tools.web3()

    return (
        <Flex alignItems="flex-start"
              justifyContent="flex-start"
              flexDirection="column"
              gap="0.5em">
            <Box borderWidth="0.2em" width="100%" padding="1em">
                <Text fontSize="xl">Balance: {Tools.balance()}</Text>
                <Button onClick={Tools.getGass}>Get Gas</Button>
            </Box>
            <Box borderWidth="0.2em" width="100%" padding="1em">
                <Text fontSize="xl">WIP</Text>
            </Box>
        </Flex>
    )
}

export default Home