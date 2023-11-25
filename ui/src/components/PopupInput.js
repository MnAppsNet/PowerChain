import React from 'react'
import {
    ChakraProvider,
    Modal,
    Button,
  } from '@chakra-ui/react'
import styles from "./../styles.css";

const PopupInput = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
  
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
  
    return (
        <ChakraProvider resetCSS>
            <Button onClick={onOpen}>Open Modal</Button>
            <Button ml={4} ref={finalRef}>
            I'll receive focus on close
            </Button>
    
            <Modal
            initialFocusRef={initialRef}
            finalFocusRef={finalRef}
            isOpen={isOpen}
            onClose={onClose}
            >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create your account</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                <FormControl>
                    <FormLabel>First name</FormLabel>
                    <Input ref={initialRef} placeholder='First name' />
                </FormControl>
    
                <FormControl mt={4}>
                    <FormLabel>Last name</FormLabel>
                    <Input placeholder='Last name' />
                </FormControl>
                </ModalBody>
    
                <ModalFooter>
                <Button colorScheme='blue' mr={3}>
                    Save
                </Button>
                <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
            </Modal>
        </ChakraProvider>
    )
  }

  export default PopupInput