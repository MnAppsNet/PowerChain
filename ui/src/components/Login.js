import React, { useState } from 'react'
import {
  ChakraProvider,
  Input,
  Flex,
  Text,
  Image,
  Button
} from '@chakra-ui/react'
import styles from "./../styles.css";

const Login = (props) => 
{
  const Tools = props.Tools
  const strings = Tools.strings

  const [RPCUrl, setRPCUrl] = useState('');
  const handleInputRPCUrl = (event) => {
    setRPCUrl(event.target.value);
  }
  const handleConnectButtonClick = () => {
    if (RPCUrl.startsWith("http://") || RPCUrl.startsWith("https://")){
      Tools.setRpcUrl(RPCUrl)
    }
    else{
      Tools.showMessage(strings.invalidUrl)
    }
  }
  return (
    <ChakraProvider resetCSS>
      <Flex
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        paddingTop="20vh"
        gap="0.2em"
        mt={4}
      >
        <Image height="100px" width="100px" src="logo192.png" />
        <Text 
          color="gray.500"
          fontSize="3xl"
          fontWeight="bold">PowerChain</Text>
        <Input
          className={styles.input}
          textAlign="center"
          fontSize="md"
          width="70%"
          borderWidth="medium"
          placeholder={strings.providerUrl}
          value={RPCUrl}
          onChange={handleInputRPCUrl}
        />
        <Button
          className={styles.button}
          variant="solid" 
          size="md" 
          colorScheme="telegram"
          onClick={handleConnectButtonClick}>
          {strings.connect}
        </Button>
      </Flex>
    </ChakraProvider>
  )
}

export default Login