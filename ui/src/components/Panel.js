import {
    Flex,
    Box,
    Text,
    Button
} from '@chakra-ui/react'
import { SlRefresh } from "react-icons/sl";
import PopupInput from "./PopupInput.js"

const Panel = (props) => {
    const controller = props.controller;
    const header = props.header;
    const info = props.info;
    const buttons = props.buttons;
    let j = 0;
    return (
            <Box style={controller.styles.panel}>
                <Text {...controller.styles.headerText} >{header}</Text>
                <hr style={controller.styles.seperator} />
                {info.map((i) => (
                    <Text key={header+" "+i.label} {...controller.styles.text}>{i.label}: {i.value} </Text>
                ))}
                <Box display="flex" alignItems="center" gap="0.3em">
                {buttons.map((b) => {
                    j += 1;
                    if ('popup' in b){
                        return (<PopupInput controller={controller} key={header+" "+j.toString()} {...b.popup}/>)
                    }else if ('button' in b){
                        return (<Button key={header+" "+j.toString()} {...Object.assign({}, b.button, controller.styles.button)}>{b.text}</Button>)
                    }
                })}
                </Box>
            </Box>
    );
}

export default Panel;