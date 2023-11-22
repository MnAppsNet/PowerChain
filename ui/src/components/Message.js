
import React from 'react'
import {
    ChakraProvider,
    Alert,
    AlertIcon,
  } from '@chakra-ui/react'
import styles from "./../styles.css";

const Message = (props) =>
{
    const Tools = props.Tools
    const text = props.text
    const status = props.status
    return (
        <ChakraProvider resetCSS>
            <Alert className={styles.alert} status={status} onClick={Tools.clearMessage}>
                <AlertIcon />{text}
            </Alert>
        </ChakraProvider>
    )
}

export default Message;