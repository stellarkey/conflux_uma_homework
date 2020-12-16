// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.1;

import "./TimeLockedTransfer.sol";

contract TransferFactory {
    address[] public transfers;

    event NewTransfer(uint256 id);

    constructor() {
        // EMPTY
    }

    function create(address sender, address recipient, uint256 lock_time_s) external {
        TimeLockedTransfer tlt = new TimeLockedTransfer(sender, recipient, lock_time_s);
        uint256 id = transfers.length;
        transfers.push(address(tlt));
        emit NewTransfer(id);
    }
}