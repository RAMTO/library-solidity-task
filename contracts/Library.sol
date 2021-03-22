// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Library is Ownable {
    struct Book {
        string name;
        uint32 copies;
        address[] userAddresses;
    }

    bytes32[] public booksId;
    mapping(bytes32 => Book) public booksInLibrary;
    mapping(address => mapping(bytes32 => bool)) public borrowedBooksByUser;

    event BookAdded(bytes32 bookId);
    event BookBorrowed(bytes32 bookId);
    event BookReturned(bytes32 bookId);

    modifier bookAvailableCopies(bytes32 _bookId) {
        require(booksInLibrary[_bookId].copies > 0, "Not enought book copies");
        _;
    }

    modifier uniqueBooks(bytes32 _bookId) {
        require(booksInLibrary[_bookId].copies == 0, "Book already in library");
        _;
    }

    modifier userBorrowedBook(bytes32 _bookId) {
        require(
            !borrowedBooksByUser[msg.sender][_bookId],
            "User already borrowed this book"
        );
        _;
    }

    modifier userHasBook(bytes32 _bookId) {
        require(
            borrowedBooksByUser[msg.sender][_bookId],
            "User does not have this book"
        );
        _;
    }

    function addBook(string memory _bookName, uint32 _bookCopies)
        public
        onlyOwner
        uniqueBooks(keccak256(abi.encodePacked(_bookName)))
    {
        bytes32 bookId = keccak256(abi.encodePacked(_bookName));
        address[] memory defaultAddresses;
        booksInLibrary[bookId] = Book(_bookName, _bookCopies, defaultAddresses);
        booksId.push(bookId);

        emit BookAdded(bookId);
    }

    function borrowBook(bytes32 _bookId)
        public
        bookAvailableCopies(_bookId)
        userBorrowedBook(_bookId)
    {
        borrowedBooksByUser[msg.sender][_bookId] = true;
        booksInLibrary[_bookId].copies--;
        booksInLibrary[_bookId].userAddresses.push(msg.sender);

        emit BookBorrowed(_bookId);
    }

    function returnBook(bytes32 _bookId) public userHasBook(_bookId) {
        borrowedBooksByUser[msg.sender][_bookId] = false;
        booksInLibrary[_bookId].copies++;

        emit BookReturned(_bookId);
    }

    function getBooksLength() public view returns (uint256) {
        return booksId.length;
    }

    function getAddressesByBook(bytes32 _bookId)
        public
        view
        returns (address[] memory)
    {
        return booksInLibrary[_bookId].userAddresses;
    }
}
