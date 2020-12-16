// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.1;

import "./IStandardCoin.sol";

contract CoinA is IStandardCoin { // inheritance / implementing an interface
    string _name;
    string _symbol; // ~ CFX
    uint256 _totalSupply;

    // keep track of account balances
    mapping (address => uint256) _balances;

    event Transfer(address from, address to, uint256 amount);

    constructor(uint256 totalSupply) {
        _name = "CoinA";
        _symbol = "CA";
        _totalSupply = totalSupply;

        // add all tokens to creator
        _balances[msg.sender] = totalSupply;
    }

    // getters
    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function balanceOf(address addr) external view override returns (uint256) {
        return _balances[addr];
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    // transfer between accounts
    function transfer(address receiver, uint256 amount) external override {
        require(_balances[msg.sender] >= amount, "CoinA: Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[receiver] += amount;
        emit Transfer(msg.sender, receiver, amount);
    }

    function transfer2(address sender, address receiver, uint256 amount) external override {
        require(_balances[sender] >= amount, "CoinA: Insufficient balance");
        _balances[sender] -= amount;
        _balances[receiver] += amount;
        emit Transfer(sender, receiver, amount);
    }
}