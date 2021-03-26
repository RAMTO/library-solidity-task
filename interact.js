const { ethers, logger } = require("ethers")
const libraryAbi = require("./build/Library.json");
const LIBWrapperAbi = require("./build/LIBWrapper.json");
const LIBAbi = require("./build/LIB.json");

const getAvailableBooks = async function (contract) {
    const allBooksLength = parseInt(await contract.getBooksLength(), 10)
    let allAvailableBooks = []
    for (let i = 0; i < allBooksLength; i++) {
        let bookId = await contract.booksId(i)
        let { name, copies } = await contract.booksInLibrary(bookId)

        if (copies > 0) {
            allAvailableBooks.push({
                id: bookId.toString(),
                name,
                copies
            })
        }
    }

    return allAvailableBooks
}

const isBookRentedByUser = async function (contract, wallet, bookId) {
    return await contract.borrowedBooksByUser(wallet.address, bookId)
}

const isBookAvailable = async function (contract, bookId) {
    const { copies } = await contract.booksInLibrary(bookId)
    return copies > 0
}

const run = async function () {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
    const wallet = new ethers.Wallet("0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8", provider)

    // Addresses
    const deployerAddress = "0xd9995bae12fee327256ffec1e3184d492bd94c31"
    const libraryContractAddress = "0x38376A367fc2Ec806155dbDFf6c0A53E3a410102"
    const wrapperContractAddress = "0x963D5B228d5Fa7DE3d69F636704Cf5070d41A760"

    // Get contracts
    const libraryContract = new ethers.Contract(libraryContractAddress, libraryAbi.abi, wallet)
    const wrapperContract = new ethers.Contract(wrapperContractAddress, LIBWrapperAbi.abi, wallet)

    const tokenAddress = await wrapperContract.LIBToken()
    const tokenContract = new ethers.Contract(tokenAddress, LIBAbi.abi, wallet)

    // Creat a book
    const addBookTransaction = await libraryContract.addBook("Test Book Event test 1", 1)
    const addBookTransactionReceipt = await addBookTransaction.wait()

    if (addBookTransactionReceipt.status != 1) {
        console.err("Transaction was not successfull")
        return
    } else {
        console.log('--- Book added by admin ---');
    }

    // Mint some LIB tokens
    const wrapValue = ethers.utils.parseEther("20");

    //Wrap some ETH
    const wrapTx = await wallet.sendTransaction({ to: wrapperContractAddress, value: wrapValue })
    await wrapTx.wait();

    // await libraryContract.addBook("Test Book 2", 2)
    // await libraryContract.addBook("Test Book 3", 3)

    // Get all available books
    const availableBooks = await getAvailableBooks(libraryContract)
    // console.log('Available books:', availableBooks)
    const lastBookId = availableBooks[availableBooks.length - 1].id

    // Approve some LIB
    const approvedAmount = ethers.utils.parseEther("20");
    const approveTx = await tokenContract.approve(libraryContractAddress, approvedAmount);
    await approveTx.wait();

    // Rent a book
    const borrowBookTransaction = await libraryContract.borrowBook(lastBookId)
    const borrowBookTransactionReceipt = await borrowBookTransaction.wait()

    if (borrowBookTransactionReceipt.status != 1) {
        console.err("Transaction was not successfull")
        return
    } else {
        console.log('--- Book borrowed ---');
    }

    // Check if book is rented by current user
    console.log("Is book rented by user:", await isBookRentedByUser(libraryContract, wallet, lastBookId))

    // Show available books
    // console.log('Available books:', await getAvailableBooks(libraryContract))

    // Return a book
    const returnBookTransaction = await libraryContract.returnBook(lastBookId)
    const returnBookTransactionReceipt = await returnBookTransaction.wait();

    if (returnBookTransactionReceipt.status != 1) {
        console.err("Transaction was not successfull")
        return
    } else {
        console.log('--- Book returned ---');
    }

    // Check if book is rented by current user
    // console.log("Is book rented by user:", await isBookRentedByUser(libraryContract, wallet, lastBookId))

    // Is book available
    // console.log('Is book available:', await isBookAvailable(libraryContract, lastBookId))

    // Log events
    libraryContract.on('BookAdded', (bookId) => {
        console.log(`Event -> Book added with id: ${bookId}`);
    });

    libraryContract.on('BookBorrowed', (bookId) => {
        console.log(`Event -> Book borrowed with id: ${bookId}`);
    });

    libraryContract.on('BookReturned', (bookId) => {
        console.log(`Event -> Book returned with id: ${bookId}`);
    });

    const filterTransferEvents = tokenContract.filters.Transfer(
        null, libraryContractAddress, null
    );

    tokenContract.on(filterTransferEvents, (from, to, value) => {
        const formatedValue = ethers.utils.formatEther(value);
        console.log(`Event -> Transfered value to library ${formatedValue} LIB from ${from}`);
    });
}

run();
