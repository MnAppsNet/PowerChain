import React from "react"
import PanelList from "../PanelList.js";

const Market = (props) => {
    const controller = props.controller;
    const panels = [
        {
            //Buy Orders >>>>>
            header: controller.strings.orderBookBuy,
            info: controller.orders["buy"],
            buttons: null
        },{
            //Sell Orders >>>>>
            header: controller.strings.orderBookSell,
            info: controller.orders["sell"],
            buttons: null
        },{
            //Banker Actions >>>>>
            header: controller.strings.manageOrders,
            info: null,
            buttons: [
                {
                    //Add Buy Order
                    popup: {
                        type: "text",
                        title: controller.strings.addBuyOrder,
                        label: controller.strings.addBuyOrder,
                        inputItems: [{
                            id: "price",
                            text: controller.strings.price,
                            type: "number",
                            default: "0"
                        },{
                            id: "quantity",
                            text: controller.strings.quantity,
                            type: "number",
                            default: "0"
                        }],
                        onClick: (...args) => controller.addBuyOrder(...args)
                    }
                },
                {
                    //Remove Buy Order
                    popup: {
                        type: "text",
                        title: controller.strings.removeBuyOrder,
                        label: controller.strings.removeBuyOrder,
                        inputItems: [{
                            id: "id",
                            text: controller.strings.id,
                            type: "numer",
                            default: ""
                        }],
                        onClick: (...args) => controller.removeBuyOrder(...args)
                    }
                },
                {
                    //Add Sell Order
                    popup: {
                        type: "text",
                        title: controller.strings.addSellOrder,
                        label: controller.strings.addSellOrder,
                        inputItems: [{
                            id: "price",
                            text: controller.strings.price,
                            type: "number",
                            default: "0"
                        },{
                            id: "quantity",
                            text: controller.strings.quantity,
                            type: "number",
                            default: "0"
                        }],
                        onClick: (...args) => controller.addSellOrder(...args)
                    }
                },
                {
                    //Remove Sell Order
                    popup: {
                        type: "text",
                        title: controller.strings.removeSellOrder,
                        label: controller.strings.removeSellOrder,
                        inputItems: [{
                            id: "id",
                            text: controller.strings.id,
                            type: "number",
                            default: ""
                        }],
                        onClick: (...args) => controller.removeSellOrder(...args)
                    }
                }
            ]
        }
    ]

    return (
        <PanelList panels={panels} controller={controller} />
    )
}

export default Market;