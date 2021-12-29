// SPDX-License-Identifier: MIT
pragma solidity >= 0.4.4 < 0.7.0;
pragma experimental ABIEncoderV2;

import "./SafeMath.sol";

// Martín Santamaría --> 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
// Juan Gabriel --> 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
// María Santos --> 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c
// Smart Contract Address --> 0x614FC02c75Ead24bbFff278c06ed620cCeA70e62

// Rinkeby
// Santa-ERC-20 --> 0xE55bD700939297A62433d6051208af482B38446a
// Santa-2 --> 0x7c9B744Ede37F3A24d51499430f6100D6e6074ac
// Smart Contract Address --> 0x32b91C5A219dA9ecfe92594AbAAaBee703a550fA

// ERC20's Interface
interface IERC20{
    // Returns the quantity of the existing tokens
    function totalSupply() external view returns (uint256);
    
    // Returns the tokens' quantity for an address specified by param
    function balanceOf(address account) external view returns (uint256);
    
    // Return the tokens' number that the spender could spend in name of the owner
    function allowance(address owner, address spender) external view returns (uint256);
    
    // Returns a boolean value that is the result of the specified operation
    function transfer(address recipient, uint256 amount) external returns (bool);
    
    function transfer(address _client, address receiver, uint256 numTokens) external returns (bool);
        
    // Returns a boolean value with the spend operation's result 
    function approve(address spender, uint256 amount) external returns (bool);
    
    // Returns a boolean value with the operation's result of a tokens' quantity transfer using the allowance method
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    // An event that must be raised when a certain quantity of tokens be transfered from a source to a destiny
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    // An event that must be raised when an assignment be established with the allowance method
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// Implementation of the ERC20's functions 
contract ERC20Basic is IERC20{
    
    using SafeMath for uint256;
    
    string public constant name = "ERC20BlockchainAZ";
    string public constant symbol = "ERC";
    uint8 public constant decimals = 2;
    
    //event Transfer(address indexed from, address indexed to, uint256 tokens);
    //event Approval(address indexed owner, address indexed spender, uint256 tokens);
    
    mapping (address => uint) balances; 
    mapping (address => mapping (address => uint)) allowed;
    uint256 totalSupply_;
    
    constructor (uint256 initialSupply) public{
        totalSupply_ = initialSupply;
        balances[msg.sender] = totalSupply_;
    }
    
    function totalSupply() public override view returns (uint256){
        return totalSupply_;
    }
    
    function increaseTotalSupply(uint newTokensAmount) public {
        totalSupply_ += newTokensAmount;
        balances[msg.sender] += newTokensAmount;
    }
    
    function balanceOf(address tokenOwner) public override view returns (uint256){
        return balances[tokenOwner];
    }
    
    function allowance(address owner, address delegate) public override view returns (uint256){
        return allowed[owner][delegate];
    }
    
    function transfer(address recipient, uint256 numTokens) public override returns (bool){
        require(numTokens <= balances[msg.sender]);
        
        balances[msg.sender] = balances[msg.sender].sub(numTokens); 
        balances[recipient] = balances[recipient].add(numTokens);
        
        emit Transfer(msg.sender, recipient, numTokens);
        
        return true;
    }
    
    function transfer(address _client, address receiver, uint256 numTokens) public override returns (bool){
        require(numTokens <= balances[_client]);
        balances[_client] = balances[_client].sub(numTokens); 
        balances[receiver] = balances[receiver].add(numTokens);
        
        emit Transfer(_client, receiver, numTokens);
        
        return true;
    }
    
    function approve(address delegate, uint256 numTokens) public override returns (bool){
        allowed[msg.sender][delegate] = numTokens;
        
        emit Approval(msg.sender, delegate, numTokens);
        
        return true;
    }
    
    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool){
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);
        
        balances[owner] = balances[owner].sub(numTokens);
        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(numTokens);
        balances[buyer] = balances[buyer].add(numTokens);
        
        emit Transfer(owner, buyer, numTokens);
        
        return true;
    }
}
