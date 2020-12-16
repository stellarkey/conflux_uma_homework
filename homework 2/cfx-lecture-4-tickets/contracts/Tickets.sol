// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.7.1;

import "./SponsorWhitelistControl.sol";

contract Tickets {
    address public owner;

    uint256 public num_tickets = 100;
    uint256 public price_drips = 10 * 1e18; // 10 CFX
    uint256 public start;
    mapping (address => uint256) public has_ticket;

    event Validated(address visitor, uint256 tickets);

    constructor(uint256 tickets, uint256 price, uint256 upcoming_days_of_the_event) {
        address addr = 0x0888000000000000000000000000000000000001;  // 白名单合约地址
        SponsorWhitelistControl swc = SponsorWhitelistControl(addr);
        
        address[] memory a = new address[](1);
        a[0] = 0x0000000000000000000000000000000000000000;  // 代付所有人
        swc.add_privilege(a);

        owner = msg.sender;
        num_tickets = tickets;
        price_drips = price * 1e18;
        start = upcoming_days_of_the_event * 1 days + block.timestamp;
    }

    // sponsorship
    function sponsor(address contract_name) public payable{
        address addr = 0x0888000000000000000000000000000000000001;  // 白名单合约地址
        SponsorWhitelistControl swc = SponsorWhitelistControl(addr);
        swc.set_sponsor_for_gas(
            contract_name, // contract
            100000000000000000 // upper limit per transaction: 0.1 CFX
        );
    }

    // buy ticket
    function buy(uint256 tickets) public payable {
        // check time
        require(block.timestamp <= start - 2 hours, "TICKETS: can't but due to time reasons");
        
        // check tickets
        require(num_tickets > 0 && tickets <= num_tickets && tickets > 0, "TICKETS: illegal operation");

        // check if the buying price is correct
        require(msg.value == tickets * price_drips, "TICKETS: incorrect amount");

        // successful buy
        if( has_ticket[msg.sender] != 0 )
            has_ticket[msg.sender] += tickets;
        else
            has_ticket[msg.sender] = tickets;
        num_tickets -= tickets;
    }

    // validate ticket
    function validate(address visitor) public {
        require(msg.sender == owner, "TICKETS: unauthorized");
        require(has_ticket[visitor] > 0, "TICKETS: visitor has no ticket");

        uint256 tickets = has_ticket[visitor];
        has_ticket[visitor] = 0;
        emit Validated(visitor, tickets);
    }

    // withdraw profit
    function withdraw() public {
        require(msg.sender == owner, "TICKETS: unauthorized");

        require(block.timestamp >= start + 1 days, "TICKETS: can't withdraw due to time reasons");

        uint256 profit = address(this).balance;
        msg.sender.transfer(profit);
    }
}