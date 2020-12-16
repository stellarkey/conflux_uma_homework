// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.1;

import "./IStandardCoin.sol";

contract TimeLockedTransfer {
    address _sender;
    address _receiver;
    address [] public contracts;
    uint256 _unlockAfter; // point in time

    event CFXDeposit(uint256 amount);
    event CFXWithdraw(uint256 amount);
    event CoinDeposit(uint256 amount);
    event CoinWithdraw(uint256 amount);
    event Cancel(uint256 number);

    constructor(address sender, address receiver, uint256 lockTimeSec) {
        _sender = sender;
        _receiver = receiver;

        // current time: `block.timestamp` (`now` in older versions)
        _unlockAfter = block.timestamp + lockTimeSec;
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    function depositCFX() external payable {
        require(msg.sender == _sender, "TLT: Unauthorized");
        uint256 amount = msg.value;
        emit CFXDeposit(amount);
    }

    function withdrawCFX() external {
        require(msg.sender == _receiver, "TLT: Unauthorized");
        require(block.timestamp >= _unlockAfter, "TLT: Timelock still active");
        uint256 amount = address(this).balance;
        msg.sender.transfer(amount);
        emit CFXWithdraw(amount);
    }
    
    function depositCoin(address coinContract) external payable {
        require(msg.sender == _sender, "TLT: Unauthorized");
        
        contracts.push(coinContract);

        IStandardCoin coin = IStandardCoin(coinContract);
        uint256 amount = (uint256)(msg.value / 1000000000000000000);
        coin.transfer2(msg.sender, address(this), amount);
        emit CoinDeposit(amount);
    }

    function withdrawCoin(address coinContract) external {
        // Alice will deposit coins to this contract through the contract
        // Bob can withdraw after the deadline by passing the coin contract address
        require(msg.sender == _receiver, "TLT: Unauthorized");
        require(block.timestamp >= _unlockAfter, "TLT: Timelock still active");

        IStandardCoin coin = IStandardCoin(coinContract);
        uint256 amount = coin.balanceOf(address(this));
        coin.transfer(msg.sender, amount);
        emit CoinWithdraw(amount);
    }

    function cancel() external{
        require(msg.sender == _sender, "TLT: Unauthorized");
        require(block.timestamp < _unlockAfter, "TLT: Timelock is no longer active");
        
        // cancel CFX
        uint256 amount = address(this).balance;
        msg.sender.transfer(amount);

        // cancel other coins
        for(uint i = 0; i < contracts.length; i = i + 1){
            address coinContract = contracts[i];
            IStandardCoin coin = IStandardCoin(coinContract);
            amount = coin.balanceOf(address(this));
            coin.transfer(msg.sender, amount);
        }

        emit Cancel(amount);
    }
}