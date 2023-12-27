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
            <Box key={header+" "+(++j).toString()+" box"} style={controller.styles.panel}>
                <Text key={header+" "+(++j).toString()+" header"} {...controller.styles.headerText} >{header}</Text>
                <hr key={header+" "+(++j).toString()+" separator"} style={controller.styles.seperator} />
                {info && info.length > 0 && (
                    <>
                    {info.map((i) => (
                        <>
                            {i.value && (
                            <Text key={header+" "+(++j).toString()+" "+i.label} {...controller.styles.text}>{i.label}: {i.value} </Text>
                            )}
                            {!i.value && (
                            <Text key={header+" "+(++j).toString()+" "+i.label} {...controller.styles.text}>{i.label}</Text>
                            )}
                        </>
                    ))}
                    </>
                )}
                <Box {...controller.styles.itemList}>
                {buttons.map((b) => {
                    j += 1;
                    if ('popup' in b){
                        return (<Box key={header+" "+(++j).toString()}  {...controller.styles.item}><PopupInput key={header+" b "+j.toString()}  controller={controller} {...b.popup}/></Box>)
                    }else if ('button' in b){
                        return (<Box key={header+" "+(++j).toString()} {...controller.styles.item}><Button key={header+" b "+j.toString()} {...Object.assign({}, b.button, controller.styles.button)}>{b.text}</Button></Box>)
                    }
                })}
                </Box>
            </Box>
    );
}

export default Panel;