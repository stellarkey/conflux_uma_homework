// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.1;

interface IStandardCoin {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external;
    function transfer2(address sender, address recipient, uint256 amount) external;
    function totalSupply() external view returns (uint256);
}