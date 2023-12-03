const path = require('path');
const Contracts = {}
const contractContext = require.context('./contracts', false, /\.json$/);
const fileNames = contractContext.keys();
(fileNames.map(contractContext)).forEach(contract => {
    Contracts[contract["name"]] = {};
    Contracts[contract["name"]]["abi"] = contract["abi"];
    Contracts[contract["name"]]["address"] = contract["address"];
});

export default Contracts