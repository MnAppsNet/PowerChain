#!/bin/bash
SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
GENESIS_FILE="$SCRIPTPATH/genesis.json"
BOOTNODES_FILE="$SCRIPTPATH/bootnodes.txt"
BOOTNODES_FILE_ALT="$SCRIPTPATH/../bootnodes.txt"
DATA_FOLDER="$SCRIPTPATH/data"
NETWOK_ID=4200
PREDEFINED_PORT="<PREDEFINED_PORT>"
ADDRESS="95517d1d31751d5b55296d6f24487e66e6c86803"
HOST="localhost"
MINET=" "

#Check if genesis file exists
if [ ! -e $GENESIS_FILE ]; then
    echo "No genesis file found, please put the genesis.json file in the same folder as the start script..."
    exit 1
fi

#Get port
if [ "$PREDEFINED_PORT" == "<PREDEFINED_PORT>" ]; then
    echo "Give a port to use (default = 30305):"
    read port
    if [ -z "$port" ]; then
        P2P_PORT=30305
    else
        P2P_PORT="$port"
    fi
    RPC_PORT=$(($P2P_PORT + 1000))
else
    P2P_PORT=$PREDEFINED_PORT
    RPC_PORT=$(($P2P_PORT + 1000))
fi
echo "Port set to $P2P_PORT and RPC port set to $RPC_PORT"

#Gather bootnodes and join network
bootNodesFile=$BOOTNODES_FILE
if [ ! -e "$bootNodesFile" ]; then
    bootNodesFile=$BOOTNODES_FILE_ALT
fi
if [ -e "$bootNodesFile" ]; then
    echo "Gatherig bootnodes..."
    while IFS= read -r line; do
        echo $line
        if [ -z "$bootNodes" ]; then
             bootNodes=$line
        else
            bootNodes="${bootNodes},$line"
        fi
    done < "$bootNodesFile"
    if [ ! -d "geth"]; then
        geth init --datadir $SCRIPTPATH $GENESIS_FILE
    fi
    if [ $MINER == "X" ]; then
        geth --datadir $SCRIPTPATH --port $P2P_PORT --host $HOST --bootnodes $bootNodes  --networkid $NETWOK_ID --unlock "0x$ADDRESS" --authrpc.addr $HOST --authrpc.port $RPC_PORT --authrpc.vhosts "*" --mine --miner.etherbase "0x$ADDRESS"
    else
        geth --datadir $SCRIPTPATH --port $P2P_PORT --host $HOST --bootnodes $bootNodes  --networkid $NETWOK_ID --unlock "0x$ADDRESS" --authrpc.addr $HOST --authrpc.port $RPC_PORT --authrpc.vhosts "*"
    fi
else
    echo "/!\\ Please put at least one boot node in a file '$BOOTNODES_FILE' to be able to discover network peers /!\\"
fi