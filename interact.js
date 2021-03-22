const { ethers, logger } = require("ethers")
const Library = require("./build/Library.json")

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
    const libraryContract = new ethers.Contract("0x7d6FAe26B090953A46098d7513b559B0a339Ee4d", Library.abi, wallet)

    // Creat a book
    await libraryContract.addBook("Test Book 1", 1)
    await libraryContract.addBook("Test Book 2", 2)
    await libraryContract.addBook("Test Book 3", 3)

    // Get all available books
    const availableBooks = await getAvailableBooks(libraryContract)
    console.log('Available books:', availableBooks)
    const lastBookId = availableBooks[availableBooks.length - 1].id

    // Rent a book
    await libraryContract.borrowBook(lastBookId)

    // Check if book is rented by current user
    console.log("Is book rented by user:", await isBookRentedByUser(libraryContract, wallet, lastBookId))

    // Return a book
    await libraryContract.returnBook(lastBookId)

    // Check if book is rented by current user
    console.log("Is book rented by user:", await isBookRentedByUser(libraryContract, wallet, lastBookId))

    // Is book available
    console.log('Is book available:', await isBookAvailable(libraryContract, lastBookId))
}

run()
