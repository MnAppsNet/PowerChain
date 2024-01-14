import React from "react"
import PanelList from "../PanelList.js";
import Blockchain from "../../Blockchain.js";

const Network = (props) => {
    const controller = props.controller;

    //Add "Consume" button on each storage unit label
    const storageUnitInfo = controller.storageUnitInfo;
    for (let i = 0; i < storageUnitInfo.length; i++) {
        storageUnitInfo[i].button = {
            popup: {
                title: controller.strings.startSession,
                label: controller.strings.consumeEnergy,
                info: [
                    controller.strings.available + ": "+controller.balance[Blockchain.TOKENS.ENT]+" "+Blockchain.TOKENS.ENT,
                    controller.strings.energy+ ": {amount * burnRate} kwh"
                ],
                inputItems: [{
                    id: "account",
                    text: controller.strings.storageUnitAddress,
                    type: "text",
                    default: storageUnitInfo[i].label
                }, {
                    id: "amount",
                    text: controller.strings.burnAmount,
                    type: "number",
                    default: 0
                }],
                onClick: (...args) => controller.startConsumptionSession(...args)
            }
        };
    }
    const panels = [
        //Banker Panel >>>>>
        {
            header: controller.strings.banker,
            info: [{
                label: controller.strings.address,
                value: (controller.bankerAddress)
            }, {
                label: controller.strings.totalEeuro,
                value: (controller.totalEeuro + " eEuro")
            }],
            buttons: null
        },
    ]
    //Network Parameters Panel >>>>>
    const networkParams = {
        header: controller.strings.parameters,
        info: [],
        buttons: null
    }
    for (let param of Object.keys(controller.networkParameters)) {
        if (param.startsWith("__")) continue;
        let description = "";
        if (controller.strings[`parameter${param}Description`] !== undefined){
            description = controller.strings[`parameter${param}Description`];
        }
        
        networkParams.info.push({
            label: param,
            value: `${controller.networkParameters[param]} ${description}`
        });
    }
    panels.push(networkParams);

    return (
        <PanelList panels={panels} controller={controller} />
    )
}

export default Network