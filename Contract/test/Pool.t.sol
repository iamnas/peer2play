// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "../src/MockERC20.sol";

import {Test, console} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {Router} from "../src/MYPoolRouter.sol";
import {Pair} from "../src/Pair.sol";
import {Factory} from "../src/MYPoolFactory.sol";
import {SafeMath} from "../src/library/SafeMath.sol";

contract RouterTest is Test {
    Router public router;
    Factory public factory;
    MockERC20 public tokenA;
    MockERC20 public tokenB;
    Pair public pair;

    address public user = address(0x1234);

    function setUp() public {
        // Deploy factory and router
        factory = new Factory();
        router = new Router(address(factory));

        // Deploy tokens and mint to user
        tokenA = new MockERC20(user);
        tokenB = new MockERC20(user);

        // tokenA.mint(user, 1000 * 1e18);
        // tokenB.mint(user, 1000 * 1e18);

        // Create pair
        address pairAddress = factory.createPair(
            address(tokenA),
            address(tokenB)
        );
        pair = Pair(pairAddress);

        // Approve router for token transfers
        vm.prank(user);
        tokenA.approve(address(router), type(uint256).max);
        vm.prank(user);
        tokenB.approve(address(router), type(uint256).max);
    }

    function testAddLiquidity() public {
        vm.startPrank(user);

        uint256 amountADesired = 100 * 1e18;
        uint256 amountBDesired = 200 * 1e18;
        uint256 amountAMin = 90 * 1e18;
        uint256 amountBMin = 180 * 1e18;

        (uint256 amountA, uint256 amountB, uint256 liquidity) = router
            .addLiquidity(
                address(tokenA),
                address(tokenB),
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                user
            );

        uint256 expectedLiquidity = SafeMath.sqrt(
            amountADesired * amountBDesired
        );

        // Assertions
        assertEq(amountA, 100 * 1e18, "Incorrect amountA");
        assertEq(amountB, 200 * 1e18, "Incorrect amountB");
        assertEq(expectedLiquidity, liquidity, "Incorrect liquidity");

        vm.stopPrank();
    }

    function testSwapExactTokensForTokens() public {
        // Step 1: Add liquidity
        vm.startPrank(user);
        router.addLiquidity(
            address(tokenA),
            address(tokenB),
            100 ether, // User provides 100 TokenA
            200 ether, // User provides 200 TokenB
            100 ether, // Minimum TokenA
            200 ether, // Minimum TokenB
            user
        );
        vm.stopPrank();

        // Verify that the pair exists
        address pair = factory.getPair(address(tokenA), address(tokenB));
        require(pair != address(0), "Pair not created");

        // Step 2: Perform swap
        uint256 amountIn = 10 ether; // User swaps 10 TokenA
        uint256 amountOutMin = 18 ether; // Expecting at least 18 TokenB (calculated based on reserves)

        vm.startPrank(user);
        uint256 initialBalanceB = tokenB.balanceOf(user);
        router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            _path(address(tokenA), address(tokenB)),
            user
        );
        vm.stopPrank();

        // Verify balances
        uint256 finalBalanceB = tokenB.balanceOf(user);
        uint256 receivedTokenB = finalBalanceB - initialBalanceB;
        require(
            receivedTokenB >= amountOutMin,
            "Swap output is less than expected"
        );

        emit log_named_uint("TokenB received after swap:", receivedTokenB);
    }

    function _path(
        address token1,
        address token2
    ) private pure returns (address[] memory path) {
        path[0] = token1;
        path[1] = token2;
    }

   
}
