import React, { useEffect } from 'react'
import {
  ChakraProvider,
  Flex,
  Text,
  Image,
  Button
} from '@chakra-ui/react'
import Web3 from 'web3';

const Login = (props) => {
  const controller = props.controller;

  useEffect(() => {
    try {
      const connected = sessionStorage.getItem("connected", "");
      console.log(connected);
      if (connected !== "" && connected !== null) {
        controller.web3 = new Web3(window.ethereum);
      }
      window.ethereum.on("accountsChanged", (e) => {
        sessionStorage.setItem("connected", "");
        controller.web3 = null;
        controller.connected = false;
      });
    } catch { }
  }, [])

  //const [RPCUrl, setRPCUrl] = useState('');
  //const handleInputRPCUrl = (event) => {
  //  setRPCUrl(event.target.value);
  //}
  const handleConnectButtonClick = () => {
    //Connect with HTTP RPC Url:
    //if (RPCUrl.startsWith("http://") || RPCUrl.startsWith("https://")){
    //  controller.setRpcUrl(RPCUrl)
    //}
    //else{
    //  controller.showMessage(strings.invalidUrl)
    //}

    //Connect with MetaMask:
    if (window.ethereum) {
      controller.web3 = new Web3(window.ethereum);
      sessionStorage.setItem("connected", "x");
    } else {
      console.error(controller.strings.metamaskNotFound);
      controller.showMessage(controller.strings.metamaskNotFound);
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
        mt={4} >
        <Image height="100px" width="100px" src="logo192.png" />
        <Text
          style={controller.styles.logoText}>PowerChain</Text>
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
          onClick={handleConnectButtonClick} {...controller.styles.buttonLogin}>
          {controller.strings.connect}
        </Button>
      </Flex>
    </ChakraProvider>
  )
}

export default Login