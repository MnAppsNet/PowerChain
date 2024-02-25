import React, { useState, useEffect } from "react"
import {
    ChakraProvider,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Input,
    FormControl,
    FormLabel,
    ModalFooter,
    Button,
    Box,
    Text
} from '@chakra-ui/react'
import { SlCheck, SlClose } from "react-icons/sl";
import { Parser } from 'expr-eval';

const Popup = (props) => {
    const properties = (props.properties) ? (props.properties) : ({});
    const [state, setState] = useState({});
    const [info,setInfo] = useState([]);
    const title = (properties.title) ? (properties.title) : ("");
    const onClick = (properties.onClick) ? (properties.onClick) : (() => { });
    const okButton = (e) => {
        onClick(...Object.values(state));
        closeButton();
    }
    const closeButton = (e) => {
        controller.closePopup();
    }
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
    const inputItems = (properties.inputItems) ? (properties.inputItems) : ([]);
    const controller = (properties.controller) ? (properties.controller) : (null);

    useEffect(()=>{
        setState(properties.state);
    },[properties.state])

    useEffect(()=>{
        const tempInfo = [...properties.info];
        for (let i = 0; i < tempInfo.length; i++){
            tempInfo[i] = tempInfo[i].replace(/\{([^{}]+)\}/g,(match) => {
                for (const [key, value] of Object.entries(state))
                    if (match.includes(key))
                        match = match.replace(key,value);
                    try{
                        return (Parser.evaluate( match.replace("{","").replace("}",""),controller)).toFixed(3)
                    }catch{ return ""; }
            })
        }
        setInfo(tempInfo);
    },[properties.info,state])

    return (
        <ChakraProvider resetCSS>
            <Modal
                initialFocusRef={initialRef}
                finalFocusRef={finalRef}
                isOpen={properties.open}
                onClose={closeButton}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            {inputItems.map((link) => (
                                <Box key={link.id}>
                                    <FormLabel>{link.text}</FormLabel>
                                    <Input
                                        id={link.id}
                                        value={(link.id in state) ? state[link.id] : link.default}
                                        onChange={e => { if (link.id in state) { setState(Object.assign({}, state, { [link.id]: e.target.value })) } else { setState(Object.assign({}, state, { [link.id]: link.default })) } }}
                                        type={link.type}
                                        ref={initialRef} />
                                </Box>
                            ))}
                        </FormControl>
                        {info.map((link) => (
                            <Text key={link}>{link}</Text>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={okButton} colorScheme='blue' mr={3}><SlCheck /></Button>
                        <Button onClick={closeButton}><SlClose /></Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </ChakraProvider>
    )

}

export default Popup;