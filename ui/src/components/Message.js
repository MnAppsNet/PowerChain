
import React from 'react'
import {
    ChakraProvider,
    Alert,
    AlertIcon,
  } from '@chakra-ui/react'

const Message = (props) =>
{
    const controller = props.controller
    const text = props.text
    const status = props.status
    return (
        <ChakraProvider resetCSS>
            <Alert styles={controller.styles.alert} status={status} onClick={()=>controller.clearMessage()}>
                <AlertIcon />{text}
            </Alert>
        </ChakraProvider>
    )
}

export default Message;