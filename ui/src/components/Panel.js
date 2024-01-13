import {
    Flex,
    Box,
    Text,
    Button,
    Divider,
    UnorderedList,
    ListItem
} from '@chakra-ui/react'
import PopupButton from "./PopupButton.js";

const Panel = (props) => {
    const key = (Math.random() + 1).toString(36).substring(7);
    const controller = props.controller;
    const header = props.header;
    const info = props.info;
    const buttons = props.buttons;
    let j = 0;
    return (
            <Box key={key+(++j)+"box"} style={controller.styles.panel}>
                <Text key={key+(++j)+"header"} {...controller.styles.headerText} >{header}</Text>
                <Divider key={key+(++j)+"divider"} style={controller.styles.seperator}></Divider>
                {info && info.length > 0 && (
                    <UnorderedList>
                    {info.map((i) => (
                       <>
                            {i.label && (
                                <ListItem>
                                    <Text key={key+(++j).toString()+i.label} {...controller.styles.text}>{i.label}{("value" in i)?": "+i.value:""} </Text>
                                    {i.button && (
                                        <ActionButton key={key+(++j).toString()} controller={controller} properties={i.button}  />
                                    )}
                                </ListItem>
                            )}
                        </>
                    ))}
                    </UnorderedList>
                )}
                {buttons && (
                    <Box {...controller.styles.itemList}>
                        <Divider key={key+(++j)+"divider"} style={controller.styles.seperator}></Divider>
                        {buttons.map((b) => {
                            return(<ActionButton key={key+(++j).toString()} controller={controller} properties={b} />)
                        })}
                    </Box>
                )}
            </Box>
    );
}

const ActionButton = (props) => {
    const controller = props.controller;
    const properties = props.properties;
    const itemStyle = controller.styles.item;
    if ('popup' in properties){
        return (<Box {...itemStyle}><PopupButton  controller={controller} {...properties.popup}/></Box>)
    }else if ('button' in properties){
        return (<Box {...itemStyle}><Button {...Object.assign({}, properties.button, controller.styles.button)}>{properties.text}</Button></Box>)
    }
}

export default Panel;