import React, { useState } from "react"
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

import styles from "./../styles.css";

const PopupInput = (props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const states = {};
    const inputItems = props.inputItems;
    inputItems.map((link) => {
        states[link.id] = link.default;
    });
    const [input,setInput] = useState(states)
    const label = props.label;
    const title = props.title;
    const onClick = props.onClick;
  
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
    
    const okButton = () => {
        if (input != null){
            onClick(input);
        }
        onClose();
    }
    const getInputValue = (id) => {
        return input[id];
    }
    const setInputValue = (id,value) => {
        const inpt = input;
        inpt[id]=value;
        setInput(inpt);
    }
    return (
        <ChakraProvider resetCSS>
            <Button onClick={onOpen} borderWidth="0.1em" borderColor="black">{label}</Button>
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
                        <Box>
                            <FormLabel>{link.text}</FormLabel>
                            <Input value={getInputValue(link.id)} onChange={(e)=>setInputValue(link.id,e.target.value)} type={link.type} ref={initialRef} />
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