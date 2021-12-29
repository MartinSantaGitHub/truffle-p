// SPDX-License-Identifier: MIT
pragma solidity >= 0.4.4 < 0.7.0;

import "./ERC20.sol";

contract Main {
    
    ERC20Basic _token;
    address _ownerAddress;
    address _contractAddress;
    address _tokenAddress;

    constructor () public {
        _token = new ERC20Basic(1000000);
        _ownerAddress = msg.sender;
        _contractAddress = address(this);
        _tokenAddress = address(_token);
    }

    modifier onlyByOwner() {
        require(msg.sender == _ownerAddress, "Permissions Denied");
        _;
    }

    function getTokenPrice(uint numTokens) public pure returns(uint) {
        return numTokens * 0.01 ether;
    }

    function getOwner() public view returns(address) {
        return _ownerAddress;
    }

    function getContract() public view returns(address) {
        return _contractAddress;
    }

    function getTokenAddress() public view returns(address) {
        return _tokenAddress;
    }

    function sendTokens(address to, uint numTokens) public payable {
        require(numTokens <= 1000, "Too many tokens to buy!!!");
        uint totalBalance = balanceAll();
        require(numTokens <= totalBalance, "Insufficient tokens to sell");
        uint cost = getTokenPrice(numTokens);
        require(msg.value >= cost, "Insufficient funds");
        uint returnValue = msg.value - cost;
        msg.sender.transfer(returnValue);
        payable(_ownerAddress).transfer(cost);
        _token.transfer(to, numTokens);
    } 

    function balanceOf(address _address) public view returns(uint){
        return _token.balanceOf(_address);
    }

    function balanceAll() public view returns(uint){
        return _token.balanceOf(_contractAddress);
    }

    function generateTokens(uint numTokens) public onlyByOwner() {
        require(numTokens >= 0, "Enter a positive value");
        _token.increaseTotalSupply(numTokens);
    }
}