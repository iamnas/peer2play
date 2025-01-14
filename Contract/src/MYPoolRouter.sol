// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;



import {IFactory} from "./interfaces/IFactory.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {IPair} from "./interfaces/IPair.sol";
import {SafeMath} from "./library/SafeMath.sol";

contract Router {
    using SafeMath for uint256;

    address public immutable factory;

    constructor(address _factory) {
        factory = _factory;
    }

    receive() external payable {}

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
        if (IFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            IFactory(factory).createPair(tokenA, tokenB);
        }

        address pair = IFactory(factory).getPair(tokenA, tokenB);

        (amountA, amountB) = _addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );

        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);

        liquidity = IPair(pair).mint(to);
    }

    // Internal helper for calculating liquidity amounts
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

    // Remove liquidity
    function removeLiquidity(
        address tokenA,
        address tokenB,
        // uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    ) public returns (uint256 amountA, uint256 amountB) {
        address pair = IFactory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "Router: PAIR_DOES_NOT_EXIST");

        // IPair(pair).transferFrom(msg.sender, pair, liquidity);
        (amountA, amountB) = IPair(pair).burn(to);

        require(amountA >= amountAMin, "Router: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "Router: INSUFFICIENT_B_AMOUNT");
    }

    // Swap tokens
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to
    ) external {
        IERC20(path[0]).transferFrom(msg.sender, _pairFor(path[0], path[1]), amountIn);

        _swap(path, to);

        uint256 balanceOut = IERC20(path[path.length - 1]).balanceOf(to);
        require(balanceOut >= amountOutMin, "Router: INSUFFICIENT_OUTPUT_AMOUNT");
    }

    // Internal swap function
    function _swap(address[] memory path, address _to) internal {
        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            address pair = _pairFor(input, output);

            uint256 amountInput = IERC20(input).balanceOf(pair);
            uint256 amountOutput = _getAmountOut(amountInput, input, output);

            (address token0, ) = _sortTokens(input, output);
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOutput)
                : (amountOutput, uint256(0));

            IPair(pair).swap(amount0Out, amount1Out, _to);
        }
    }

    // Helper to get reserves
    function _getReserves(address tokenA, address tokenB)
        internal
        view
        returns (uint256 reserveA, uint256 reserveB)
    {
        (address token0, ) = _sortTokens(tokenA, tokenB);
        address pair = _pairFor(tokenA, tokenB);
        (uint256 reserve0, uint256 reserve1, ) = IPair(pair).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    // Helper to calculate amounts
    function _getAmountOut(uint256 amountIn, address input, address output)
        internal
        view
        returns (uint256 amountOut)
    {
        (uint256 reserveIn, uint256 reserveOut) = _getReserves(input, output);
        uint256 amountInWithFee = amountIn.mul(997);
        uint256 numerator = amountInWithFee.mul(reserveOut);
        uint256 denominator = reserveIn.mul(1000).add(amountInWithFee);
        amountOut = numerator / denominator;
    }

    // Pair address lookup
    function _pairFor(address tokenA, address tokenB) internal view returns (address) {
        return IFactory(factory).getPair(tokenA, tokenB);
    }

    // Token sorting
    function _sortTokens(address tokenA, address tokenB)
        internal
        pure
        returns (address token0, address token1)
    {
        require(tokenA != tokenB, "Router: IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }
}
