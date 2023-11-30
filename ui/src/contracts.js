const Contracts = {
    faucet: {}
}
const contractContext = require.context('./contracts', false, /\.json$/);
const fileNames = contractContext.keys();
(fileNames.map(contractContext)).forEach(contract => {
    if (contract["name"] == "faucet.sol"){
        Contracts.faucet["abi"] = contract["abi"]
        Contracts.faucet["address"] = contract["address"]
    }
});

export default Contracts