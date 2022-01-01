// SPDX-License-Identifier: MIT
pragma solidity > 0.4.4 < 0.8.0;
pragma experimental ABIEncoderV2;

import "./ERC20.sol";
import "./uint2string.sol";

contract Lotery {
    using operations for uint;

    // Contract's Token instance
    ERC20Basic private token;

    address public owner_address;
    address public contract_address;
    address public token_address;

    // Token's number to create
    uint private constant created_tokens = 1000000;

    // Token events
    event buying_tokens(uint, address);
    event returned_tokens(uint, address);

    constructor() public {
        token = new ERC20Basic(created_tokens);
        owner_address = msg.sender;
        contract_address = address(this);
        token_address = address(token);
    }

    // Modifier to make functions only accesible by the contract's owner 
    modifier OnlyBy(address _address) {
        require(_address == owner_address, "Permissions denied to execute this function");
        _;
    }

    // Modifier to make functions not accesible by the contract's owner 
    modifier NotBy(address _address) {
        require(_address != owner_address, "Permissions denied to execute this function");
        _;
    }

    // ----------------------------- TOKEN -------------------------------------------

    function TokensPrice(uint _tokens_number) public pure returns(uint) {
        return _tokens_number * (0.01 ether);
    }

    // Generate more tokens by the lotery
    function GenerateTokens(uint _tokens_number) public OnlyBy(msg.sender) {
        token.increaseTotalSupply(_tokens_number);
    }

    // Buy tokens to buy lotery's tickets
    function BuyTokens(address _to, uint _tokens_number) public payable {
        uint cost = TokensPrice(_tokens_number);
        require(msg.value >= cost, "Buy less tokens or pay with more ethers");
        uint balance = AvailableTokens();
        require(_tokens_number <= balance, "Buy less tokens");
        uint return_value = msg.value - cost;
        msg.sender.transfer(return_value);
        token.transfer(_to, _tokens_number);
        emit buying_tokens(_tokens_number, _to);
    }

    // Tokens' balance in the lotery's contract
    function AvailableTokens() public view returns(uint) {
        return token.balanceOf(contract_address);
    }

    // Get the acumulated tokens' balance in the bucket
    function TokensBucket() public view returns(uint) {
        return token.balanceOf(owner_address);
    }

    // Tokens' balance of a person
    function BalanceOf(address _address) public view returns(uint) {
        return token.balanceOf(_address);
    }
    
    // Tokens return
    function ReturnTokens(uint _tokens_number) public {
        // The number of tokens must be greater than zero 
        require(_tokens_number > 0, "You need to return a positive number of tokens");
        // The user / client has to have the desire quantity of tokens to return
        require(_tokens_number <= BalanceOf(msg.sender), "You don't have the tokens that you want to return");
        token.transfer(msg.sender, contract_address, _tokens_number);
        msg.sender.transfer(TokensPrice(_tokens_number));
        emit returned_tokens(_tokens_number, msg.sender);
    }

    // ----------------------------- LOTERY -------------------------------------------

    // Ticket's price
    uint public ticket_price = 500;

    // Total tickets
    uint total_tickets = 10;

    // Tickets digits
    uint tickets_digits = 8;

    // Percent to the winner
    uint winner_percent = 75;

    address winner_address;

    // Relation between the person who buy the tickets and the tickets' numbers
    mapping(address => uint[]) person_tickets;

    address[] persons;

    // Relation needed to identify the winner
    mapping(uint => address) ticket_person;

    // Random number
    uint rand_nonce = 0;

    // Generated tickets
    uint[] bought_tickets;

    // Events
    event bought_ticket(uint, address);
    event winner_ticket(uint election, address winner, uint tokens);

    // Function to buy lotery's tickets
    function BuyTickets(uint _tickets_number) public NotBy(msg.sender) {
        require(_tickets_number > 0, "Enter a ticket number positive value");
        require(bought_tickets.length < total_tickets, "There's no more tickets to buy");
        uint available_tickets = total_tickets - bought_tickets.length;
        require(_tickets_number <= available_tickets, string(abi.encodePacked("Only ", available_tickets.uint2str(), " ticket(s) left")));
        // Total tickets' price to buy
        uint total_tokens = _tickets_number * ticket_price;
        require(total_tokens <= BalanceOf(msg.sender), "You need more tokens");

        // Tokens transfer to the owner
        token.transfer(msg.sender, owner_address, total_tokens);
        
        /*
        What this does is to take the timestamp, the msg.sender and a nonce (a number
        that is only used once, to prevent this function to be executed twice with the
        same input parameters) at increment. Then, the function keccak256 is used to
        convert these inputs to a random hash, convert this hash to an uint and then
        we divide the result by 10000 to take the last 4 digits, giving a number between
        0 and 9999.
        */

        persons.push(msg.sender);

        for (uint i = 0; i < _tickets_number; i++) {
            uint random = uint(keccak256(abi.encodePacked(now, msg.sender, rand_nonce))) % 10 ** tickets_digits;
            rand_nonce++;
            // Store the tickets' data
            person_tickets[msg.sender].push(random);
            bought_tickets.push(random);
            ticket_person[random] = msg.sender;
            emit bought_ticket(random, msg.sender);
        }
    }

    function GetPersons() public view returns(address[] memory) {
        return persons;
    }

    function GetWinner() public view returns(address) {
        return winner_address;
    }

    // Visualize a person's tickets number
    function MyTickets() public view returns(uint[] memory) {
        return person_tickets[msg.sender];
    }

    function DeleteData(address[] memory _persons) private {
        for (uint i=0; i < bought_tickets.length; i++) {
            delete ticket_person[bought_tickets[i]];
        }

        for (uint i=0; i < _persons.length; i++) {
            delete person_tickets[_persons[i]];
        }

        delete bought_tickets;
        delete persons;
    }

    // Function to generate a winner and pay to him the prize
    function GenerateWinner(address[] memory _persons) public OnlyBy(msg.sender) {
        // Must be bought tickets to generate a winner
        require(bought_tickets.length > 0, "There's no tickets");
        require(_persons.length > 1, "Minimum quantity of persons not reached");
        uint array_length = bought_tickets.length;
        uint position = uint(uint(keccak256(abi.encodePacked(now))) % array_length);
        uint election = bought_tickets[position];
        // Get the winner address
        delete winner_address;
        winner_address = ticket_person[election];
        uint tokens_bucket = winner_percent * TokensBucket() / 100;
        token.transfer(owner_address, winner_address, tokens_bucket);
        emit winner_ticket(election, winner_address, tokens_bucket);
        DeleteData(_persons);
    }
}