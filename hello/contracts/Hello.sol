// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Hello {
    string public message = "Hi World!";

    function GetMessage() public view returns(string memory) {
        return message;
    }

    function SetMessage(string memory _message) public {
        message = _message;
    }
}