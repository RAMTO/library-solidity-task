const { ethers, logger } = require("ethers")

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

const run = async function (libraryContract, wallet) {
    // const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
    // const wallet = new ethers.Wallet("0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8", provider)
    // const libraryContract = new ethers.Contract(contractAddress, contractAbi, wallet)

    // Creat a book
    const addBookTransaction = await libraryContract.addBook("Test Book 1", 1)
    const addBookTransactionReceipt = await addBookTransaction.wait()

    if (addBookTransactionReceipt.status != 1) {
        console.err("Transaction was not successfull")
        return
    } else {
        console.log('--- Books added by admin ---');
    }

    // await libraryContract.addBook("Test Book 2", 2)
    // await libraryContract.addBook("Test Book 3", 3)

    // Get all available books
    const availableBooks = await getAvailableBooks(libraryContract)
    console.log('Available books:', availableBooks)
    const lastBookId = availableBooks[availableBooks.length - 1].id

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
    console.log('Available books:', await getAvailableBooks(libraryContract))

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
    console.log("Is book rented by user:", await isBookRentedByUser(libraryContract, wallet, lastBookId))

    // Is book available
    console.log('Is book available:', await isBookAvailable(libraryContract, lastBookId))
}

module.exports = {
    run
};
