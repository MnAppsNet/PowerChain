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
    useDisclosure,
    Button,
    Box
  } from '@chakra-ui/react'
import { SlCheck,SlClose } from "react-icons/sl";

const PopupInput = (props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [state,setState] = useState({})
    const controller = props.controller;
    const inputItems = props.inputItems;

    const label = props.label;
    const title = props.title;
    const onClick = props.onClick;
  
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
    
    const okButton = () => {
        if (Object.keys(state).length === 0){
            let st = {}
            for (const [_, value] of Object.entries(inputItems)) {
                st[value.id] = value.default;
            }
            onClick(...Object.values(st));
            setState(st);
        }else{
            onClick(...Object.values(state));
        }
        onClose();
    }
    return (
        <ChakraProvider resetCSS>
            <Button onClick={onOpen}  {...controller.styles.button}>{label}</Button>
            <Modal
            initialFocusRef={initialRef}
            finalFocusRef={finalRef}
            isOpen={isOpen}
            onClose={onClose}
            >
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
                                value={(link.id in state)?state[link.id]:link.default}
                                onChange={e => {if (link.id in state){ setState(Object.assign({}, state, { [link.id]: e.target.value }))} else {setState(Object.assign({}, state,{ [link.id]: link.default}))} }}
                                type={link.type} 
                                ref={initialRef} />
                        </Box>
                    ))}
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                <Button onClick={okButton} colorScheme='blue' mr={3}><SlCheck/></Button>
                <Button onClick={onClose}><SlClose/></Button>
                </ModalFooter>
            </ModalContent>
            </Modal>
        </ChakraProvider>
    )
  }

  export default PopupInput