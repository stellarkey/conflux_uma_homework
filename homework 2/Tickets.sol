// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.7.1;

contract Tickets {
    address public owner;

    uint256 public num_tickets;
    uint256 public price_drips; // 10 CFX
    mapping (address => uint) public has_ticket;

    event Validated(address visitor);

    constructor(uint _num_tickets, uint _price_drips) {
        owner = msg.sender;
        num_tickets = _num_tickets;
        price_drips = _price_drips * 1e18;
    }

    // buy ticket
    function buy(uint nums) public payable {
        // check that we still have tickets left
        require(num_tickets - nums >= 0, "TICKETS: no tickets left");

        require(nums > 0, "TICKETS: invalid number");

        // check if the buying price is correct
        require(msg.value == price_drips, "TICKETS: incorrect amount");

        // check that user has not bought tickets yet
        require((!has_ticket[msg.sender]) && (has_ticket[msg.sender] !=0), "TICKETS: already bought tickets");

        // successful buy
        has_ticket[msg.sender] = nums;
        num_tickets -= nums;
    }

    // validate ticket
    function validate(address visitor, uint nums) public {
        require(msg.sender == owner, "TICKETS: unauthorized");
        require(nums > 0, "TICKETS: invalid number");
        require(has_ticket[visitor] >= nums, "TICKETS: visitor does not have enough tickets");

        has_ticket[visitor] -= nums;
        emit Validated(visitor);
    }

    // withdraw profit
    function withdraw() public {
        require(msg.sender == owner, "TICKETS: unauthorized");
        uint256 profit = address(this).balance;
        msg.sender.transfer(profit);
    }
}