// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "../src/MockERC20.sol";

import {Test, console} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {PoolRouter} from "../src/PoolRouter.sol";
import {Pair} from "../src/Pair.sol";
import {PoolFactory} from "../src/PoolFactory.sol";
import {SafeMath} from "../src/library/SafeMath.sol";

contract RouterTest is Test {
    PoolRouter public router;
    PoolFactory public factory;
    MockERC20 public tokenA;
    MockERC20 public tokenB;
    Pair public pair;

    address public user = address(0x1234);

    function setUp() public {
        // Deploy factory and router
        factory = new PoolFactory();
        router = new PoolRouter(address(factory));

        // Deploy tokens and mint to user
        tokenA = new MockERC20(user);
        tokenB = new MockERC20(user);

        // tokenA.mint(user, 1000 * 1e18);
        // tokenB.mint(user, 1000 * 1e18);

        // Create pair
        address pairAddress = factory.createPair(address(tokenA), address(tokenB));
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

        (uint256 amountA, uint256 amountB, uint256 liquidity) = router.addLiquidity(
            address(tokenA), address(tokenB), amountADesired, amountBDesired, amountAMin, amountBMin, user
        );

        uint256 expectedLiquidity = SafeMath.sqrt(amountADesired * amountBDesired);

        // Assertions
        assertEq(amountA, 100 * 1e18, "Incorrect amountA");
        assertEq(amountB, 200 * 1e18, "Incorrect amountB");
        assertEq(expectedLiquidity, liquidity, "Incorrect liquidity");

        vm.stopPrank();
    }

    function testSwapExactTokensForTokens() public {
        // Step 1: Approve router to spend tokens
        vm.startPrank(user);
        tokenA.approve(address(router), type(uint256).max); // Approve max TokenA
        tokenB.approve(address(router), type(uint256).max); // Approve max TokenB
        vm.stopPrank();

        // Step 2: Add liquidity
        vm.startPrank(user);
        router.addLiquidity(
            address(tokenA),
            address(tokenB),
            0.1 ether, // Add 1e9 TokenA
            0.1 ether, // Add 2e9 TokenB
            0.1 ether, // Minimum TokenA
            0.1 ether, // Minimum TokenB
            user
        );
        vm.stopPrank();

        // Step 3: Perform swap
        uint256 amountIn = 10;
        uint256 expectedAmountOut = 10;

        vm.startPrank(user);
        uint256 initialBalanceB = tokenB.balanceOf(user); // Track initial TokenB balance

        address[] memory pairAdd = new address[](2);
        pairAdd[0] = address(tokenB);
        pairAdd[1] = address(tokenA);

        router.swapExactTokensForTokens(
            amountIn,
            expectedAmountOut, // Minimum expected output
            pairAdd, //_path(address(tokenA), address(tokenB)), // Path for swap
            user // Recipient of TokenB
        );
        vm.stopPrank();

        // Verify the swap output
        uint256 finalBalanceB = tokenB.balanceOf(user);
        uint256 receivedTokenB = finalBalanceB - initialBalanceB;

        assert(receivedTokenB >= expectedAmountOut);
    }
}
