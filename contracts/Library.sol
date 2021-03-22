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

    uint256[] public booksId;
    mapping(uint256 => Book) public booksInLibrary;
    mapping(address => mapping(uint256 => bool)) public booksByUser;

    event BookAdded(uint256 bookId);
    event BookBorrowed(uint256 bookId);
    event BookReturned(uint256 bookId);

    modifier bookAvailableCopies(uint256 _bookId) {
        require(booksInLibrary[_bookId].copies > 0, "Not enought book copies");
        _;
    }

    modifier uniqueBooks(uint256 _bookId) {
        require(booksInLibrary[_bookId].copies == 0, "Book already in library");
        _;
    }

    modifier userBorrowedBook(uint256 _bookId) {
        require(
            !booksByUser[msg.sender][_bookId],
            "User already borrowed this book"
        );
        _;
    }

    modifier userHasBook(uint256 _bookId) {
        require(
            booksByUser[msg.sender][_bookId],
            "User does not have this book"
        );
        _;
    }

    function addBook(string memory _bookName, uint32 _bookCopies)
        public
        onlyOwner
        uniqueBooks(uint256(keccak256(abi.encodePacked(_bookName))))
    {
        uint256 bookId = uint256(keccak256(abi.encodePacked(_bookName)));
        address[] memory defaultAddresses;
        booksInLibrary[bookId] = Book(_bookName, _bookCopies, defaultAddresses);
        booksId.push(bookId);

        emit BookAdded(bookId);
    }

    function borrowBook(uint256 _bookId)
        public
        bookAvailableCopies(_bookId)
        userBorrowedBook(_bookId)
    {
        booksByUser[msg.sender][_bookId] = true;
        booksInLibrary[_bookId].copies--;
        booksInLibrary[_bookId].userAddresses.push(msg.sender);

        emit BookBorrowed(_bookId);
    }

    function returnBook(uint256 _bookId) public userHasBook(_bookId) {
        booksByUser[msg.sender][_bookId] = false;
        booksInLibrary[_bookId].copies++;

        emit BookReturned(_bookId);
    }

    function getBooksLength() public view returns (uint256) {
        return booksId.length;
    }

    function getAddressesByBook(uint256 _bookId)
        public
        view
        returns (address[] memory)
    {
        return booksInLibrary[_bookId].userAddresses;
    }
}
