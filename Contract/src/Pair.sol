// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "./interfaces/IERC20.sol";
import {IPair} from "./interfaces/IPair.sol";
import {SafeMath} from "./library/SafeMath.sol";

contract Pair is IPair {
    using SafeMath for uint256;

    // Constants for calculations
    uint256 private constant MINIMUM_LIQUIDITY = 1000; // Prevent division by zero

    // Token addresses
    address public override token0;
    address public override token1;

    // Reserve values
    uint256 private reserve0;
    uint256 private reserve1;
    uint32 private blockTimestampLast;

    // ERC20-like storage
    uint256 public override totalSupply;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    // Lock for single-transaction execution
    bool private locked;

    // Modifiers
    modifier lock() {
        require(!locked, "Pair: LOCKED");
        locked = true;
        _;
        locked = false;
    }

    constructor() {
        locked = false;
    }

    // Initialize the pair with tokens
    function initialize(address _token0, address _token1) external override {
        require(token0 == address(0) && token1 == address(0), "Pair: ALREADY_INITIALIZED");
        require(_token0 != address(0) && _token1 != address(0), "Pair: ZERO_ADDRESS");
        require(_token0 != _token1, "Pair: IDENTICAL_ADDRESSES");
        token0 = _token0;
        token1 = _token1;
    }

    // ERC20 functions
    function approve(address spender, uint256 value) external override returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external override returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] = allowance[from][msg.sender].sub(value);
        }
        _transfer(from, to, value);
        return true;
    }

    function _approve(address owner, address spender, uint256 value) private {
        require(owner != address(0), "Pair: APPROVE_FROM_ZERO_ADDRESS");
        require(spender != address(0), "Pair: APPROVE_TO_ZERO_ADDRESS");
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _transfer(address from, address to, uint256 value) private {
        require(from != address(0), "Pair: TRANSFER_FROM_ZERO_ADDRESS");
        require(to != address(0), "Pair: TRANSFER_TO_ZERO_ADDRESS");
        balanceOf[from] = balanceOf[from].sub(value);
        balanceOf[to] = balanceOf[to].add(value);
        emit Transfer(from, to, value);
    }

    // View functions
    function getReserves() public view override returns (uint256, uint256, uint32) {
        return (reserve0, reserve1, blockTimestampLast);
    }

    // Internal update function
    function _update(uint256 balance0, uint256 balance1) private {
        require(balance0 <= type(uint256).max && balance1 <= type(uint256).max, "Pair: OVERFLOW");
        reserve0 = balance0;
        reserve1 = balance1;
        blockTimestampLast = uint32(block.timestamp % 2 ** 32);
        emit Sync(reserve0, reserve1);
    }

    // Mint new LP tokens
    function mint(address to) external override lock returns (uint256 liquidity) {
        require(to != address(0), "Pair: MINT_TO_ZERO_ADDRESS");
        (uint256 _reserve0, uint256 _reserve1,) = getReserves();
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));

        uint256 amount0 = balance0.sub(_reserve0);
        uint256 amount1 = balance1.sub(_reserve1);

        if (totalSupply == 0) {
            liquidity = SafeMath.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);
            // Permanently lock the first MINIMUM_LIQUIDITY tokens
            _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            liquidity = SafeMath.min(amount0.mul(totalSupply) / _reserve0, amount1.mul(totalSupply) / _reserve1);
        }

        require(liquidity > 0, "Pair: INSUFFICIENT_LIQUIDITY_MINTED");
        _mint(to, liquidity);
        _update(balance0, balance1);
        emit Mint(msg.sender, amount0, amount1);
    }

    // Burn LP tokens function in Pair contract
    function burn(address to) external override lock returns (uint256 amount0, uint256 amount1) {
        require(to != address(0), "Pair: BURN_TO_ZERO_ADDRESS");
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        uint256 liquidity = balanceOf[msg.sender];

        require(liquidity > 0, "Pair: INSUFFICIENT_LIQUIDITY_BURNED");

        // Calculate token amounts to return
        amount0 = liquidity.mul(balance0) / totalSupply;
        amount1 = liquidity.mul(balance1) / totalSupply;
        require(amount0 > 0 && amount1 > 0, "Pair: INSUFFICIENT_LIQUIDITY_BURNED");

        _burn(msg.sender, liquidity);

        // Transfer tokens to recipient
        _safeTransfer(token0, to, amount0);
        _safeTransfer(token1, to, amount1);

        // Update reserves
        balance0 = IERC20(token0).balanceOf(address(this));
        balance1 = IERC20(token1).balanceOf(address(this));
        _update(balance0, balance1);

        emit Burn(msg.sender, amount0, amount1, to);
    }

    function swap(uint256 amount0Out, uint256 amount1Out, address to) external override lock {
        require(amount0Out > 0 || amount1Out > 0, "Pair: INSUFFICIENT_OUTPUT_AMOUNT");
        require(to != address(0), "Pair: SWAP_TO_ZERO_ADDRESS");

        (uint256 _reserve0, uint256 _reserve1,) = getReserves();
        require(amount0Out < _reserve0 && amount1Out < _reserve1, "Pair: INSUFFICIENT_LIQUIDITY");

        // Perform token transfers for the output amounts
        if (amount0Out > 0) _safeTransfer(token0, to, amount0Out);
        if (amount1Out > 0) _safeTransfer(token1, to, amount1Out);

        // Get updated balances of tokens in the pair
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));

        // Calculate the input amounts for both tokens
        uint256 amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint256 amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;

        // Ensure there is some input
        require(amount0In > 0 || amount1In > 0, "Pair: INSUFFICIENT_INPUT_AMOUNT");

        // Verify the constant product formula (x * y = k) is upheld
        uint256 balance0Adjusted = balance0 * 1; // No fee, so no adjustments
        uint256 balance1Adjusted = balance1 * 1; // No fee, so no adjustments
        require(balance0Adjusted * balance1Adjusted >= _reserve0 * _reserve1, "Pair: K");

        // Update reserves to match the new balances
        _update(balance0, balance1);

        // Emit a Swap event for tracking
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    // Force reserves to match current balances
    function sync() external override lock {
        _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)));
    }

    // Internal functions
    function _mint(address to, uint256 value) private {
        totalSupply = totalSupply.add(value);
        balanceOf[to] = balanceOf[to].add(value);
        emit Transfer(address(0), to, value);
    }

    function _burn(address from, uint256 value) private {
        balanceOf[from] = balanceOf[from].sub(value);
        totalSupply = totalSupply.sub(value);
        emit Transfer(from, address(0), value);
    }

    function _safeTransfer(address token, address to, uint256 value) private {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Pair: TRANSFER_FAILED");
    }
}
