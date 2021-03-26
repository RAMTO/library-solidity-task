const { ethers, logger } = require("ethers")
const libraryAbi = require("./build/Library.json");
const LIBWrapperAbi = require("./build/LIBWrapper.json");
const LIBAbi = require("./build/LIB.json");

const run = async function () {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
    const wallet = new ethers.Wallet("0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8", provider)

    // Addresses
    const deployerAddress = "0xd9995bae12fee327256ffec1e3184d492bd94c31"
    const libraryContractAddress = "0x2fa72DaDB0De5De164E316E074B7A7bb2EEbd354"
    const wrapperContractAddress = "0x03337900382f325C1bB907d56b3230bCD9d606A2"

    // Get contracts
    const libraryContract = new ethers.Contract(libraryContractAddress, libraryAbi.abi, wallet)
    const wrapperContract = new ethers.Contract(wrapperContractAddress, LIBWrapperAbi.abi, wallet)

    const tokenAddress = await wrapperContract.LIBToken()
    const tokenContract = new ethers.Contract(tokenAddress, LIBAbi.abi, wallet)

    // Tokens
    const currencySymbol = await tokenContract.symbol();
    let currentBalance;
    let currentBalanceETH;
    let currentLibraryBalance;
    let currentLibraryBalanceETH;
    let currentWrapperBalanceETH;

    // Get current deployer balances
    currentBalance = await tokenContract.balanceOf(deployerAddress);
    currentBalanceETH = await provider.getBalance(deployerAddress);
    console.log('-----------------------');
    console.log("Deployer balance: ", ethers.utils.formatEther(currentBalance), currencySymbol);
    console.log("Deployer balance: ", ethers.utils.formatEther(currentBalanceETH), "ETH");
    console.log('-----------------------');

    // Get current library balances
    currentLibraryBalance = await tokenContract.balanceOf(libraryContractAddress);
    currentLibraryBalanceETH = await provider.getBalance(libraryContractAddress);
    console.log('-----------------------');
    console.log("Library balance: ", ethers.utils.formatEther(currentLibraryBalance), currencySymbol);
    console.log("Library balance: ", ethers.utils.formatEther(currentLibraryBalanceETH), "ETH");
    console.log('-----------------------');

    // Mint some LIB tokens
    const wrapValue = ethers.utils.parseEther("20");

    //Wrap some ETH
    const wrapTx = await wallet.sendTransaction({ to: wrapperContractAddress, value: wrapValue })
    await wrapTx.wait();

    console.log('-----------------------');
    console.log(`${ethers.utils.formatEther(wrapValue)} ${currencySymbol} minted`);
    console.log('-----------------------');

    currentWrapperBalanceETH = await provider.getBalance(wrapperContractAddress);
    console.log('-----------------------');
    console.log("Wrapper balance: ", ethers.utils.formatEther(currentWrapperBalanceETH), "ETH");
    console.log('-----------------------');

    // Send some amount to library contract
    const amount = ethers.utils.parseEther("10");
    const sendTx = await tokenContract.transfer(libraryContractAddress, amount)
    await sendTx.wait();

    console.log('-----------------------');
    console.log(`${ethers.utils.formatEther(amount)} ${currencySymbol} sent to Library`);
    console.log('-----------------------');

    // Get current deployer balances
    currentBalance = await tokenContract.balanceOf(deployerAddress);
    currentBalanceETH = await provider.getBalance(deployerAddress);
    console.log('-----------------------');
    console.log("Deployer balance: ", ethers.utils.formatEther(currentBalance), currencySymbol);
    console.log("Deployer balance: ", ethers.utils.formatEther(currentBalanceETH), "ETH");
    console.log('-----------------------');

    // Get current library balances
    currentLibraryBalance = await tokenContract.balanceOf(libraryContractAddress);
    currentLibraryBalanceETH = await provider.getBalance(libraryContractAddress);
    console.log('-----------------------');
    console.log("Library balance: ", ethers.utils.formatEther(currentLibraryBalance), currencySymbol);
    console.log("Library balance: ", ethers.utils.formatEther(currentLibraryBalanceETH), "ETH");
    console.log('-----------------------');

    // Show allowence
    // const spenderAmount = await tokenContract.allowance(deployerAddress, libraryContractAddress);
    // const spenderAmountLibtoWrapper = await tokenContract.allowance(libraryContractAddress, wrapperContractAddress);
    // console.log('-----------------------');
    // console.log(`Approved amount from User to Library: ${ethers.utils.formatEther(spenderAmount)} ${currencySymbol}`);
    // console.log('-----------------------');
    // console.log('-----------------------');
    // console.log(`Approved amount from Library to Wrapper: ${ethers.utils.formatEther(spenderAmountLibtoWrapper)} ${currencySymbol}`);
    // console.log('-----------------------');

    // Unwrap amount
    const unwrapAmount = ethers.utils.parseEther("5");
    const unwrapTx = await libraryContract.withdraw(unwrapAmount);
    await unwrapTx.wait();

    console.log('-----------------------');
    console.log(`${ethers.utils.formatEther(unwrapAmount)} ${currencySymbol} unwrapped and sent to Deployer`);
    console.log('-----------------------');

    // Get current deployer balances
    currentBalance = await tokenContract.balanceOf(deployerAddress);
    currentBalanceETH = await provider.getBalance(deployerAddress);
    console.log('-----------------------');
    console.log("Deployer balance: ", ethers.utils.formatEther(currentBalance), currencySymbol);
    console.log("Deployer balance: ", ethers.utils.formatEther(currentBalanceETH), "ETH");
    console.log('-----------------------');

    // Get current library balances
    currentLibraryBalance = await tokenContract.balanceOf(libraryContractAddress);
    currentLibraryBalanceETH = await provider.getBalance(libraryContractAddress);
    console.log('-----------------------');
    console.log("Library balance: ", ethers.utils.formatEther(currentLibraryBalance), currencySymbol);
    console.log("Library balance: ", ethers.utils.formatEther(currentLibraryBalanceETH), "ETH");
    console.log('-----------------------');
}

run()
