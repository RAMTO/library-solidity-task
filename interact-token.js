const { ethers, logger } = require("ethers")
const libraryAbi = require("./build/Library.json");
const LIBWrapperAbi = require("./build/LIBWrapper.json");
const LIBAbi = require("./build/LIB.json");

const run = async function () {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
    const wallet = new ethers.Wallet("0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8", provider)

    // Addresses
    const deployerAddress = "0xd9995bae12fee327256ffec1e3184d492bd94c31"
    const libraryContractAddress = "0x3167fF663d21B47Bc9d6e331D96370fD921dAA4B"
    const wrapperContractAddress = "0xD936431C8D29c7e0f793fb6184aa0fcC6b8d4E03"

    // Get contracts
    const libraryContract = new ethers.Contract(libraryContractAddress, libraryAbi.abi, wallet)
    const wrapperContract = new ethers.Contract(wrapperContractAddress, LIBWrapperAbi.abi, wallet)

    const tokenAddress = await wrapperContract.LIBToken()
    const tokenContract = new ethers.Contract(tokenAddress, LIBAbi.abi, wallet)

    // Tokens
    const currencySymbol = await tokenContract.symbol();
    let currentBalance;
    let currentLibraryBalance;
    let currentBalanceETH;

    // Get current balance in LIB
    currentBalance = await tokenContract.balanceOf(deployerAddress);
    console.log('-----------------------');
    console.log("Deployer balance: ", ethers.utils.formatEther(currentBalance), currencySymbol);
    console.log('-----------------------');

    currentLibraryBalance = await tokenContract.balanceOf(libraryContractAddress);
    console.log('-----------------------');
    console.log("Library balance: ", ethers.utils.formatEther(currentLibraryBalance), currencySymbol);
    console.log('-----------------------');

    // Get current balance in ETH
    // currentBalanceETH = await provider.getBalance(deployerAddress);
    // console.log('-----------------------');
    // console.log("Deployer balance: ", ethers.utils.formatEther(currentBalanceETH), "ETH");
    // console.log('-----------------------');

    // Mint some LIB tokens
    const wrapValue = ethers.utils.parseEther("20")

    // Wrap some ETH
    const wrapTx = await wallet.sendTransaction({ to: wrapperContractAddress, value: wrapValue })
    await wrapTx.wait();

    // Approve amount
    // const approveTx = await tokenContract.approve(libraryContractAddress, wrapValue)
    // await approveTx.wait();

    // Show allowence
    const spenderAmount = await tokenContract.allowance(deployerAddress, libraryContractAddress);
    console.log('-----------------------');
    console.log(`Approved amount from User to Library: ${ethers.utils.formatEther(spenderAmount)} ${currencySymbol}`);
    console.log('-----------------------');

    // Rent a book
    // const borrowBookTransaction = await libraryContract.borrowBook("0xd5258e1860b584f58ed2fa0ee7ae00dbaf8deda2c964b71419afc08c2b42a78c")
    // const borrowBookTransactionReceipt = await borrowBookTransaction.wait()

    // if (borrowBookTransactionReceipt.status != 1) {
    //     console.err("Transaction was not successfull")
    //     return
    // } else {
    //     console.log('--- Book borrowed ---');
    // }

    // Get current balance in LIB
    currentBalance = await tokenContract.balanceOf(deployerAddress);
    console.log('-----------------------');
    console.log("Deployer balance: ", ethers.utils.formatEther(currentBalance), currencySymbol);
    console.log('-----------------------');

    // Get current balance in ETH
    // currentBalanceETH = await provider.getBalance(deployerAddress);
    // console.log('-----------------------');
    // console.log("Deployer balance: ", ethers.utils.formatEther(currentBalanceETH), "ETH");
    // console.log('-----------------------');
}

run()
