import React from 'react'
import {
  ChakraProvider,
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  Image,
} from '@chakra-ui/react'
import {
  FiMenu
} from 'react-icons/fi'

let LinkItems = []
let controller = null;

const Sidebar = (props) => {
  controller = props.controller;
  LinkItems = props.items;
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <ChakraProvider resetCSS>
      <Box minH="100vh" bg={controller.colors.background}>
        <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }}/>
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="full">
          <DrawerContent>
            <SidebarContent onClose={onClose} />
          </DrawerContent>
        </Drawer>
        {/* mobilenav */}
        <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
        <Box ml={{ base: 0, md: 60 }} p="4" overflowY="auto">
          { props.children }
        </Box>
      </Box>
    </ChakraProvider>
  )
}

const SidebarContent = ({ onClose, ...rest }) => {
  return (
    <Box
      bg={controller.colors.white}
      borderRight="1px"
      borderRightColor={controller.colors.lines}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Image height="50px" width="50px" src="logo192.png" />
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          PowerChain
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} onClick={()=>{link.action();onClose();}}>
          {link.name}
        </NavItem>
      ))}
      <a href='https://www.auth.gr/' target='_blank' rel="noreferrer"><Image position="fixed" bottom="10px" left="0.5em" width="12em" src="logo_auth.png" /></a>
    </Box>
  )
}

const NavItem = ({ icon, children, ...rest }) => {
  return (
    <Box
      as="a"
      href="#"
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: controller.colors.enabled,
          color: controller.colors.text,
        }}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: controller.colors.text,
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  )
}

const MobileNav = ({ onOpen, ...rest }) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={controller.colors.white}
      borderBottomWidth="1px"
      borderBottomColor={controller.colors.lines}
      justifyContent="flex-start"
      {...rest}>
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />
      <Image height="2em" ml="8" width="2em" src="logo192.png" />
      <Text fontSize="2xl" ml="1" fontFamily="monospace" fontWeight="bold">
        PowerChain
      </Text>
    </Flex>
  )
}

export default Sidebar