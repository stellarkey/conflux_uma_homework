pragma solidity >=0.4.15;

contract SponsorWhitelistControl {
    // ------------------------------------------------------------------------
    // Someone will sponsor the gas cost for contract `contractAddr` with an
    // `upper_bound` for a single transaction.
    // ------------------------------------------------------------------------
    function set_sponsor_for_gas(address contractAddr, uint upperBound) public payable {}

    // ------------------------------------------------------------------------
    // Someone will sponsor the storage collateral for contract `contractAddr`.
    // ------------------------------------------------------------------------
    function set_sponsor_for_collateral(address contractAddr) public payable {}

    // ------------------------------------------------------------------------
    // Add commission privilege for address `user` to some contract.
    // ------------------------------------------------------------------------
    function add_privilege(address[] memory) public {}

    // ------------------------------------------------------------------------
    // Remove commission privilege for address `user` from some contract.
    // ------------------------------------------------------------------------
    function remove_privilege(address[] memory) public {}
}