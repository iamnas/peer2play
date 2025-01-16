// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IFactory} from "./interfaces/IFactory.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {IPair} from "./interfaces/IPair.sol";
import {SafeMath} from "./library/SafeMath.sol";

contract PoolRouter {
    using SafeMath for uint256;

    address public immutable factory;

    constructor(address _factory) {
        factory = _factory;
    }

    receive() external payable {}

    // View Functions

    // Get the amount of tokenB needed when providing tokenA for liquidity
    function quoteAddLiquidity(address tokenA, address tokenB, uint256 amountADesired)
        public
        view
        returns (uint256 amountBOptimal)
    {
        (uint256 reserveA, uint256 reserveB) = _getReserves(tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            return 0; // No existing liquidity, any ratio is acceptable
        }
        return amountADesired.mul(reserveB) / reserveA;
    }

    // Get the expected output amount for a swap
    function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) public view returns (uint256) {
        return _getAmountOut(amountIn, tokenIn, tokenOut);
    }

    // Get amounts out for a path of trades
    function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint256[] memory amounts) {
        require(path.length >= 2, "Router: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;

        for (uint256 i = 0; i < path.length - 1; i++) {
            amounts[i + 1] = _getAmountOut(amounts[i], path[i], path[i + 1]);
        }
    }

    // Get the current reserves for a pair
    function getReserves(address tokenA, address tokenB) public view returns (uint256 reserveA, uint256 reserveB) {
        return _getReserves(tokenA, tokenB);
    }

    // Get the pair address for two tokens
    function getPair(address tokenA, address tokenB) public view returns (address) {
        return _pairFor(tokenA, tokenB);
    }

    // Add liquidity
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        // Create pair if it doesn't exist
        if (IFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            IFactory(factory).createPair(tokenA, tokenB);
        }

        address pair = IFactory(factory).getPair(tokenA, tokenB);

        // Calculate optimal amounts
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);

        // Transfer tokens to pair
        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);

        // Mint LP tokens
        liquidity = IPair(pair).mint(to);
    }

    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal view returns (uint256 amountA, uint256 amountB) {
        (uint256 reserveA, uint256 reserveB) = _getReserves(tokenA, tokenB);

        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = amountADesired.mul(reserveB) / reserveA;
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Router: INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = amountBDesired.mul(reserveA) / reserveB;
                require(amountAOptimal >= amountAMin, "Router: INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    ) public returns (uint256 amountA, uint256 amountB) {
        require(to != address(0), "Router: INVALID_RECIPIENT");
        require(tokenA != tokenB, "Router: IDENTICAL_ADDRESSES");

        address pair = IFactory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "Router: PAIR_DOES_NOT_EXIST");

        // Transfer LP tokens from sender to pair
        bool success = IPair(pair).transferFrom(msg.sender, pair, liquidity);
        require(success, "Router: TRANSFER_FROM_FAILED");

        // Get reserves before burn
        // (uint256 reserveA, uint256 reserveB) = IPair(pair).getReserves();
        // require(reserveA > 0 && reserveB > 0, "Router: INSUFFICIENT_LIQUIDITY");

        // Burn LP tokens and get tokens back
        (amountA, amountB) = IPair(pair).burn(to);

        // Ensure sufficient output amounts
        require(amountA >= amountAMin, "Router: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "Router: INSUFFICIENT_B_AMOUNT");
    }

    // Swap tokens
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to)
        external
    {
        require(path.length >= 2, "Router: INVALID_PATH");

        // Calculate expected amounts
        uint256[] memory amounts = getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Router: INSUFFICIENT_OUTPUT_AMOUNT");

        // Transfer initial tokens to first pair
        IERC20(path[0]).transferFrom(msg.sender, _pairFor(path[0], path[1]), amountIn);

        // Execute the swap
        _swap(path, to);
    }

    function _swap(address[] memory path, address _to) internal {
        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            address pair = _pairFor(input, output);

            // Get reserves and calculate actual input amount
            (uint256 reserveIn,) = _getReserves(input, output);
            uint256 balanceInput = IERC20(input).balanceOf(pair);
            uint256 amountInput = balanceInput > reserveIn ? balanceInput - reserveIn : 0;

            // Calculate output amount
            uint256 amountOutput = _getAmountOut(amountInput, input, output);

            // Determine token order
            (address token0,) = _sortTokens(input, output);
            (uint256 amount0Out, uint256 amount1Out) =
                input == token0 ? (uint256(0), amountOutput) : (amountOutput, uint256(0));

            // Determine recipient
            address to = i < path.length - 2 ? _pairFor(output, path[i + 2]) : _to;

            // Perform the swap
            IPair(pair).swap(amount0Out, amount1Out, to);
        }
    }

    function _getReserves(address tokenA, address tokenB) internal view returns (uint256 reserveA, uint256 reserveB) {
        (address token0,) = _sortTokens(tokenA, tokenB);
        address pair = _pairFor(tokenA, tokenB);
        (uint256 reserve0, uint256 reserve1,) = IPair(pair).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    function _getAmountOut(uint256 amountIn, address input, address output) internal view returns (uint256) {
        (uint256 reserveIn, uint256 reserveOut) = _getReserves(input, output);

        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 amountOut = (reserveOut * amountIn) / (reserveIn + amountIn);
        return amountOut;
    }

    function _pairFor(address tokenA, address tokenB) internal view returns (address) {
        return IFactory(factory).getPair(tokenA, tokenB);
    }

    function _sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "Router: IDENTICAL_ADDRESSES");
        (token0, token1) = (tokenA, tokenB); // tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Router: ZERO_ADDRESS");
    }
}
