SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
GENESIS_FILE="genesis.json"
CHAIN_ID=4200
PORT_PLACEHOLDER="<PREDEFINED_PORT>"
ADDRESS_PLACEHOLDER="<ADDRESS>"
HOST_PLACEHOLDER="<HOST>"
CHAIN_PLACEHOLDER="<CHAIN_ID>"

createBootNode(){
    local path=$1
    local host=$2
    local port=$3
    if [ -z "$port" ]; then
        port=30300
    fi
    bootnode -genkey $path/boot.key
    address=$(bootnode -nodekey $path/boot.key -writeaddress)
    echo "enode://$address@$host:30300" >> $path/../bootnodes.txt
    startScript="$path/start.sh"
    cat <<EOL > "$startScript"
        #!/bin/bash
        bootnode -nodekey boot.key -addr $host:$port -verbosity 3
EOL
    chmod +x $startScript
}

createStartScript() {
    local path=$1
    local address=$2
    local host=$3
    local miner=$4
    local port=$5
    if [ -z "$path" ]; then
        exit 1
    fi
    if [ ! -d $path ]; then
        mkdir $path
    fi
    #Copy genesis block:
    genesisFile=$path/../$GENESIS_FILE
    if [ ! -e "$genesisFile" ]; then
        genesisFile=$path/../../$GENESIS_FILE
    fi
    if [ -e "$genesisFile" ]; then
        cp $genesisFile $path
        echo "Coping starting script..."
    fi
    startScriptFile=$path/start.sh
    cp $SCRIPTPATH/config/start_script_template $startScriptFile
    sed -i "s/$ADDRESS_PLACEHOLDER/$address/g" "$startScriptFile"
    if [ ! -z "$host" ]; then
        sed -i "s/$HOST_PLACEHOLDER/$host/g" "$startScriptFile"
    fi
    if [ ! -z "$port" ]; then
        sed -i "s/$PORT_PLACEHOLDER/$port/g" "$startScriptFile"
    fi
    if [ -z "$miner" ]; then
        miner=" "
    fi
    PORT_MINER="<MINER>"
    sed -i "s/$PORT_MINER/$miner/g" "$startScriptFile"
    sed -i "s/$CHAIN_PLACEHOLDER/$CHAIN_ID/g" "$startScriptFile"
    chmod +x $startScriptFile

    if [ "$miner" == "X" ]; then
        createSigner $path
        setSignerPassword $path $address
    fi
}

setSignerPassword(){
    local path=$1
    local address=$2
    echo "Associate address password with signer"
    sleep 1
    clef --keystore $path/keystore --configdir $path/clef --chainid $CHAIN_ID --suppress-bootwarn setpw 0x$address
    echo "**************************************"
}

createSigner(){
    local path=$1
    echo "Set the signer master password"
    sleep 1
    clef --keystore $path/keystore --configdir $path/clef --chainid $CHAIN_ID --suppress-bootwarn init
    cp $SCRIPTPATH/config/AuthRules.js $path/rules.js
    rules='''`sha256sum $SCRIPTPATH/rules.js | cut -f1`'''
    cat << END > $path/startSigner.sh
#!/bin/bash
SCRIPTPATH="\$( cd -- \"\$(dirname \"\$0\")\" >/dev/null 2>\&1 ; pwd -P )"
if find "\$SCRIPTPATH/clef" -type f -name "config.json" | grep -q "config.json"; then
    echo "Rules already attested"
else
    clef --keystore \$SCRIPTPATH/keystore --configdir \$SCRIPTPATH/clef --chainid $CHAIN_ID --suppress-bootwarn attest $rules
fi
clef --keystore \$SCRIPTPATH/keystore --configdir \$SCRIPTPATH/clef --chainid $CHAIN_ID --suppress-bootwarn --rules \$SCRIPTPATH/rules.js
END
    chmod +x "$path/startSigner.sh"
    echo "**************************************"
}

readHost(){
    echo -n "Host (default localhost): "
    read host
    if [ -z "$host" ]; then
        host="localhost"
    fi
    return $host
}