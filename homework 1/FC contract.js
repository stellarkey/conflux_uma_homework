pragma solidity 0.5.11;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Roles.sol";

interface IFC
{
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Lock(address indexed account, uint256 value);
    event Write(address indexed account, uint256 CPool, uint256 PPool, uint256 PPoolLocked);

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function stateOf(address account) external view returns (uint256, uint256, uint256);
    function circulationRatio() external view returns (uint256);
    
    function setTotalSupply(uint256 total) external;
    function setStateOf(address account, uint256 ConfluxPool, uint256 PersonalPool, uint256 PersonalLocked) external;
    function setCirculationRatio(uint256 value) external;
    function transfer(address recipient, uint256 value) external returns (bool);
    function send(address recipient, uint256 value, bytes calldata data) external returns (bool);
    function mint(address account, uint256 value) external returns (bool);
    function burn(uint256 value) external;
}

contract FCRoles {
    using Roles for Roles.Role;
    Roles.Role private _minters;
    Roles.Role private _pausers;
    Roles.Role private _admins;

    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);
    event PauserAdded(address indexed account);
    event PauserRemoved(address indexed account);
    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);

    //---------- Admin Begin ---------//
    constructor () internal {
        _addAdmin(msg.sender);
    }

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "AdminRole: caller does not have the Admin role");
        _;
    }

    function onlyAdminMock() public view onlyAdmin {
        // solhint-disable-previous-line no-empty-blocks
    }

    function isAdmin(address account) public view returns (bool) {
        return _admins.has(account);
    }

    function addAdmin(address account) public onlyAdmin {
        _addAdmin(account);
    }

    function renounceAdmin() public {
        _removeAdmin(msg.sender);
    }

    function _addAdmin(address account) internal {
        _admins.add(account);
        emit AdminAdded(account);
    }

    function _removeAdmin(address account) internal {
        _admins.remove(account);
        emit AdminRemoved(account);
    }
    //---------- Admin End ---------//

    //---------- Minter Begin ---------//
    modifier onlyMinter() {
        require(isMinter(msg.sender) || isAdmin(msg.sender), "MinterRole: caller does not have the Minter role or above");
        _;
    }

    function onlyMinterMock() public view onlyMinter {
        // solhint-disable-previous-line no-empty-blocks
    }

    function isMinter(address account) public view returns (bool) {
        return _minters.has(account);
    }

    function addMinter(address account) public onlyAdmin {
        _addMinter(account);
    }

    function removeMinter(address account) public onlyAdmin {
        _removeMinter(account);
    }

    function renounceMinter() public {
        _removeMinter(msg.sender);
    }

    function _addMinter(address account) internal {
        _minters.add(account);
        emit MinterAdded(account);
    }

    function _removeMinter(address account) internal {
        _minters.remove(account);
        emit MinterRemoved(account);
    }
    //---------- Minter End ---------//

    //---------- Pauser Begin ---------//
    modifier onlyPauser() {
        require(isPauser(msg.sender) || isAdmin(msg.sender), "PauserRole: caller does not have the Pauser role or above");
        _;
    }

    function onlyPauserMock() public view onlyPauser {
        // solhint-disable-previous-line no-empty-blocks
    }

    function isPauser(address account) public view returns (bool) {
        return _pausers.has(account);
    }

    function addPauser(address account) public onlyAdmin {
        _addPauser(account);
    }

    function removePauser(address account) public onlyAdmin {
        _removePauser(account);
    }

    function renouncePauser() public {
        _removePauser(msg.sender);
    }

    function _addPauser(address account) internal {
        _pausers.add(account);
        emit PauserAdded(account);
    }

    function _removePauser(address account) internal {
        _pausers.remove(account);
        emit PauserRemoved(account);
    }
    //---------- Pauser End ---------//
}

contract FCPausable is FCRoles {
    event TransferPaused(address account);
    event TransferUnpaused(address account);

    event BurnPaused(address account);
    event BurnUnpaused(address account);

    event MigratePaused(address account);
    event MigrateUnpaused(address account);

    bool private _transferPaused;
    bool private _burnPaused;
    bool private _migratePaused;

    constructor () internal
    {
        _transferPaused = false;
        _burnPaused = true;
        _migratePaused = true;
    }

    // IsPaused
    function isTransferPaused() public view returns (bool) {
        return _transferPaused;
    }

    function isBurnPaused() public view returns (bool) {
        return _burnPaused;
    }

    function isMigratePaused() public view returns (bool) {
        return _migratePaused;
    }

    // WhenNotPaused
    modifier whenTransferNotPaused() {
        require(!_transferPaused, "Pausable: Transfer paused");
        _;
    }

    modifier whenBurnNotPaused() {
        require(!_burnPaused, "Pausable: Burn paused");
        _;
    }

    modifier whenMigrateNotPaused() {
        require(!_migratePaused, "Pausable: Migrate paused");
        _;
    }

    // WhenPaused
    modifier whenTransferPaused() {
        require(_transferPaused, "Pausable: Transfer not paused");
        _;
    }

    modifier whenBurnPaused() {
        require(_burnPaused, "Pausable: Burn not paused");
        _;
    }

    modifier whenMigratePaused() {
        require(_migratePaused, "Pausable: Migrate not paused");
        _;
    }

    // Pause
    function pauseTransfer() internal {
        _transferPaused = true;
        emit TransferPaused(msg.sender);
    }

    function pauseBurn() internal {
        _burnPaused = true;
        emit BurnPaused(msg.sender);
    }

    function pauseMigrate() internal {
        _migratePaused = true;
        emit MigratePaused(msg.sender);
    }

    // Unpause
    function unpauseTransfer() internal {
        _transferPaused = false;
        emit TransferUnpaused(msg.sender);
    }

    function unpauseBurn() internal {
        _burnPaused = false;
        emit BurnUnpaused(msg.sender);
    }

    function unpauseMigrate() internal {
        _migratePaused = false;
        emit MigrateUnpaused(msg.sender);
    }

    // Before Migration
    function pauseBeforeMigration() public onlyPauser {
        pauseTransfer();
        pauseBurn();
        pauseMigrate();
    }

    // During Migration
    function pauseDuringMigration() public onlyPauser {
        pauseTransfer();
        pauseBurn();
        unpauseMigrate();
    }

    // After Initialization
    function pauseAfterInitialization() public onlyPauser {
        unpauseTransfer();
        pauseBurn();
        pauseMigrate();
    }

    // For Exchange
    function pauseForExchange() public onlyPauser {
        pauseTransfer();
        unpauseBurn();
        pauseMigrate();
    }
}

contract SponsorWhitelistControl {
    // ------------------------------------------------------------------------
    // Someone will sponsor the gas cost for contract `contract_addr` with an
    // `upper_bound` for a single transaction.
    // ------------------------------------------------------------------------
    function set_sponsor_for_gas(address contract_addr, uint upper_bound) public payable {
    }

    // ------------------------------------------------------------------------
    // Someone will sponsor the storage collateral for contract `contract_addr`.
    // ------------------------------------------------------------------------
    function set_sponsor_for_collateral(address contract_addr) public payable {
    }

    // ------------------------------------------------------------------------
    // Add commission privilege for address `user` to some contract.
    // ------------------------------------------------------------------------
    function add_privilege(address[] memory) public {
    }

    // ------------------------------------------------------------------------
    // Remove commission privilege for address `user` from some contract.
    // ------------------------------------------------------------------------
    function remove_privilege(address[] memory) public {
    }
}

contract FC is IFC, FCPausable
{
    using SafeMath for uint256;
    using Address for address;

    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 private _cap;
    uint256 private _totalSupply;
    uint256 private _circulationRatio; // For r units of FC, lock 100 FC
    mapping (address => uint256) private _confluxBalances; // Conflux Pool
    mapping (address => uint256) private _personalBalances; // Personal Pool
    mapping (address => uint256) private _personalLockedBalances; // Personal Locked Pool

    mapping (address => bool) private _accountCheck;
    address[] private _accountList;

    IERC1820Registry constant private ERC1820_REGISTRY = IERC1820Registry(address(0x866aCA87FF33a0ae05D2164B3D999A804F583222));

    // keccak256("ERC777TokensRecipient")
    bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH =
        0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b;

    SponsorWhitelistControl constant public SPONSOR = SponsorWhitelistControl(address(0x0888000000000000000000000000000000000001));

    constructor()
        FCPausable()
        public
    {
        _name = "FansCoin";
        _symbol = "FC";
        _decimals = 18;
        _circulationRatio = 0;
        uint256 fc_cap = 100000000;
        _cap = fc_cap.mul(10 ** uint256(_decimals));
        // register interfaces
        ERC1820_REGISTRY.setInterfaceImplementer(address(this), keccak256("ERC777Token"), address(this));

        // register all users as sponsees
        address[] memory users = new address[](1);
        users[0] = address(0);
        SPONSOR.add_privilege(users);
    }

    // Fallback
    function deposit() public onlyAdmin payable {
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function cap() public view returns (uint256) {
        return _cap;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _confluxBalances[account].add(_personalBalances[account]).add(_personalLockedBalances[account]);
    }

    function circulationRatio() public view returns (uint256) {
        return _circulationRatio;
    }

    function stateOf(address account) public view returns (uint256, uint256, uint256) {
        return (_confluxBalances[account], _personalBalances[account], _personalLockedBalances[account]);
    }

    function balanceOfContract() public view returns (uint256) {
        return address(this).balance;
    }

    //---------------- Data Migration ----------------------
    function accountTotal() public view returns (uint256) {
        return _accountList.length;
    }

    function accountList(uint256 begin) public view returns (address[100] memory) {
        require(begin >= 0 && begin < _accountList.length, "FC: accountList out of range");
        address[100] memory res;
        uint256 range = _min(_accountList.length, begin.add(100));
        for (uint256 i = begin; i < range; i++) {
            res[i-begin] = _accountList[i];
        }
        return res;
    }

    function setStateOf(address account, uint256 ConfluxPool, uint256 Personal, uint256 Locked) public onlyPauser whenMigrateNotPaused {
        require(account != address(0), "FC: Migration to the zero address");

        if (!_accountCheck[account]) {
            _accountCheck[account] = true;
            _accountList.push(account);
        }

        _confluxBalances[account] = ConfluxPool;
        _personalBalances[account] = Personal;
        _personalLockedBalances[account] = Locked;

        emit Write(account, ConfluxPool, Personal, Locked);
    }

    function setTotalSupply(uint256 total) public onlyPauser whenMigrateNotPaused {
        _totalSupply = total;
    }
    //---------------- End Data Migration ----------------------
    function setCirculationRatio(uint256 value) public onlyAdmin {
        _circulationRatio = value;
    }

    function mint(address account, uint256 value) public onlyMinter returns (bool) {
        if (!_accountCheck[account]) {
            _accountCheck[account] = true;
            _accountList.push(account);
        }

        _mint(account, value);

        _callTokensReceived(msg.sender, address(0), account, value, "", "", true);

        return true;
    }

    function transfer(address recipient, uint256 value) public whenTransferNotPaused returns (bool) {
        bool success = _transfer(msg.sender, recipient, value);
        _callTokensReceived(msg.sender, msg.sender, recipient, value, "", "", false);
        return success;
    }

    function send(address recipient, uint256 value, bytes memory data) public whenTransferNotPaused returns (bool) {
        bool success = _transfer(msg.sender, recipient, value);
        _callTokensReceived(msg.sender, msg.sender, recipient, value, data, "", true);
        return success;
    }


    function _transfer(address sender, address recipient, uint256 value) internal returns (bool) {
        require(recipient != address(0), "FC: transfer to the zero address");

        if (!_accountCheck[recipient]) {
            _accountCheck[recipient] = true;
            _accountList.push(recipient);
        }

        if (_circulationRatio != 0) {
            // If the given amount is greater than
            // the unlocked balance of the sender, revert
            _confluxBalances[sender].add(_personalBalances[sender].mul(_circulationRatio).div(_circulationRatio.add(100))).sub(value);
        } else {
            _confluxBalances[sender].add(_personalBalances[sender]).sub(value);
        }

        // Favor Conflux Pool due to the lack of circulation restriction
        if (value <= _confluxBalances[sender]) {
            _transferC2P(sender, recipient, value);
        } else {
            _transferP2P(sender, recipient, value.sub(_confluxBalances[sender]));
            _transferC2P(sender, recipient, _confluxBalances[sender]);
        }

        emit Transfer(sender, recipient, value);
        return true;
    }

    function burn(uint256 value) public whenBurnNotPaused {
        require(msg.sender != address(0), "FC: burn from the zero address");

        // If the given amount is greater than the balance of the sender, revert
        _confluxBalances[msg.sender].add(_personalBalances[msg.sender]).add(_personalLockedBalances[msg.sender]).sub(value);

        if (address(this).balance < value) {
            value = address(this).balance;
        }

        // Personal Locked Pool > Personal Pool > Conflux Pool
        _burnCPool(msg.sender, value > _personalBalances[msg.sender].add(_personalLockedBalances[msg.sender]) ?
            _min(value.sub(_personalLockedBalances[msg.sender]).sub(_personalBalances[msg.sender]), _confluxBalances[msg.sender]) : 0);

        _burnPPool(msg.sender, value > _personalLockedBalances[msg.sender] ?
            _min(value.sub(_personalLockedBalances[msg.sender]), _personalBalances[msg.sender]): 0);

        _burnPPoolLocked(msg.sender, _min(value, _personalLockedBalances[msg.sender]));

        // Transfer CFX to the burn request sender
        msg.sender.transfer(value);

        emit Transfer(msg.sender, address(0), value);
    }

    //---------- Helper Begin ----------//
    function _mint(address account, uint256 value) internal {
        require(account != address(0), "FC: mint to the zero address");
        require(totalSupply().add(value) <= _cap, "FC: cap exceeded");

        _totalSupply = _totalSupply.add(value);
        _confluxBalances[account] = _confluxBalances[account].add(value);

        emit Transfer(address(0), account, value);
    }

    function _transferC2P(address sender, address recipient, uint256 value) internal {
        require(sender != address(0), "FC: transfer from the zero address");
        require(recipient != address(0), "FC: transfer to the zero address");

        _confluxBalances[sender] = _confluxBalances[sender].sub(value);
        _personalBalances[recipient] = _personalBalances[recipient].add(value);
    }

    function _transferP2P(address sender, address recipient, uint256 value) internal {
        require(sender != address(0), "FC: transfer from the zero address");
        require(recipient != address(0), "FC: transfer to the zero address");

        uint256 lockedAmount = _circulationRatio == 0 ? 0 : _max(value.mul(100).div(_circulationRatio), 1);

        // Spend: -(value + value * 100 / r)
        _personalBalances[sender] = _personalBalances[sender].sub(value.add(lockedAmount));

        // Lock: + value * 100 / r, at least 1
        _personalLockedBalances[sender] = _personalLockedBalances[sender].add(lockedAmount);

        // Transfer: +value
        _personalBalances[recipient] = _personalBalances[recipient].add(value);

        emit Lock(sender, lockedAmount);
    }

    function _burnPPoolLocked(address account, uint256 value) internal {
        require(account != address(0), "FC: burn from the zero address");
        _personalLockedBalances[account] = _personalLockedBalances[account].sub(value);
        _totalSupply = _totalSupply.sub(value);
    }

    function _burnPPool(address account, uint256 value) internal {
        require(account != address(0), "FC: burn from the zero address");
        _personalBalances[account] = _personalBalances[account].sub(value);
        _totalSupply = _totalSupply.sub(value);
    }

    function _burnCPool(address account, uint256 value) internal {
        require(account != address(0), "FC: burn from the zero address");
        _confluxBalances[account] = _confluxBalances[account].sub(value);
        _totalSupply = _totalSupply.sub(value);
    }

    function _min(uint256 value1, uint256 value2) internal pure returns (uint256) {
        if (value1 > value2) {
            return value2;
        }
        return value1;
    }

    function _max(uint256 value1, uint256 value2) internal pure returns (uint256) {
        if (value1 < value2) {
            return value2;
        }
        return value1;
    }
    //---------- Helper End ------------//
    //---------- Token Received Begin ----------//
    function _callTokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData,
        bool requireReceptionAck
    )
        private
    {
        address implementer = ERC1820_REGISTRY.getInterfaceImplementer(to, TOKENS_RECIPIENT_INTERFACE_HASH);
        if (implementer != address(0)) {
            IERC777Recipient(implementer).tokensReceived(operator, from, to, amount, userData, operatorData);
        } else if (requireReceptionAck) {
            require(!to.isContract(), "FC: token recipient contract has no implementer for ERC777TokensRecipient");
        }
    }
    //---------- Token Received End ----------//
}
