const etherlime = require('etherlime-lib')
const Library = require('../build/Library.json')
const LIBWrapper = require('../build/LIBWrapper.json')

const deploy = async (network, secret, etherscanApiKey) => {

    const deployer = new etherlime.EtherlimeGanacheDeployer()

    // Deploy contract
    const contractWrapper = await deployer.deploy(LIBWrapper)

    // Get token address
    const tokenAddress = await contractWrapper.LIBToken()
    const wrapperAddress = contractWrapper.contractAddress;

    // Deploy contract with constructor params
    const contractLibrary = await deployer.deploy(Library, false, tokenAddress, wrapperAddress)
}

module.exports = {
    deploy
}
