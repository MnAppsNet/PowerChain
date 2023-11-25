import React, { useState } from 'react'
import {
  ChakraProvider,
  Input,
  Flex,
  Text,
  Image,
  Button
} from '@chakra-ui/react'
import Web3 from 'web3';
import styles from "./../styles.css";

const Login = (props) => 
{
  const Tools = props.Tools
  const strings = Tools.strings

  //const [RPCUrl, setRPCUrl] = useState('');
  //const handleInputRPCUrl = (event) => {
  //  setRPCUrl(event.target.value);
  //}
  const handleConnectButtonClick = () => {
    //Connect with HTTP RPC Url:
    //if (RPCUrl.startsWith("http://") || RPCUrl.startsWith("https://")){
    //  Tools.setRpcUrl(RPCUrl)
    //}
    //else{
    //  Tools.showMessage(strings.invalidUrl)
    //}

    //Connect with MetaMask:
      if (window.ethereum) {
        Tools.setWeb3(new Web3(window.ethereum));
        // Request account access if needed
        window.ethereum.enable().then(function(accounts) {
            console.log('Connected to MetaMask');
            console.log('Account:', accounts[0]);
        }).catch(function(error) {
            console.error('Error connecting to MetaMask:', error);
        });
    } else {
        console.error('MetaMask not detected! Please install MetaMask.');
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
        {/* Ask for HTTP RPC URL
        <Input
          className={styles.input}
          textAlign="center"
          fontSize="md"
          width="70%"
          borderWidth="medium"
          placeholder={strings.providerUrl}
          value={RPCUrl}
          onChange={handleInputRPCUrl}
        /> */}
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