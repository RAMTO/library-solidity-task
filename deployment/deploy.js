const etherlime = require('etherlime-lib');
const Library = require('../build/Library.json');


const deploy = async (network, secret, etherscanApiKey) => {

    const deployer = new etherlime.EtherlimeGanacheDeployer();
    const result = await deployer.deploy(Library);

};

module.exports = {
    deploy
};
