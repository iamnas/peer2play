// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "../src/MockERC20.sol";

import {Test, console} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {PoolRouter} from "../src/PoolRouter.sol";
import {Pair} from "../src/Pair.sol";
import {PoolFactory} from "../src/PoolFactory.sol";
import {SafeMath} from "../src/library/SafeMath.sol";
import {IPair} from "../src/interfaces/IPair.sol";

contract RouterTest is Test {
    PoolRouter public router;
    PoolFactory public factory;
    MockERC20 public tokenA;
    MockERC20 public tokenB;
    Pair public pair;

    address public user = address(0x1234);
    uint256 private constant MINIMUM_LIQUIDITY = 1000; // Prevent division by zero

    function setUp() public {
        // Deploy factory and router
        factory = new PoolFactory();
        router = new PoolRouter(address(factory));

        // Deploy tokens and mint to user
        tokenA = new MockERC20(user);
        tokenB = new MockERC20(user);

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

        uint256 expectedLiquidity = SafeMath.sqrt(amountADesired * amountBDesired) - MINIMUM_LIQUIDITY;

        // Assertions
        assertEq(amountA, 100 * 1e18, "Incorrect amountA");
        assertEq(amountB, 200 * 1e18, "Incorrect amountB");
        assertEq(expectedLiquidity, liquidity, "Incorrect liquidity");

        vm.stopPrank();
    }

    function testSwapExactTokensForTokens() public {
        // Step 1: Approve router to spend tokens
        vm.startPrank(user);
        tokenA.approve(address(router), type(uint256).max);
        tokenB.approve(address(router), type(uint256).max);
        vm.stopPrank();

        // Step 2: Add liquidity
        vm.startPrank(user);
        router.addLiquidity(
            address(tokenA),
            address(tokenB),
            0.1 ether, // Add 0.1 ether TokenA
            0.1 ether, // Add 0.1 ether TokenB
            0.1 ether, // Minimum TokenA
            0.1 ether, // Minimum TokenB
            user
        );
        vm.stopPrank();

        // Step 3: Check reserves
        (uint256 reserve0, uint256 reserve1,) = pair.getReserves();

        // Step 4: Perform swap
        uint256 amountIn = 0.1 ether;
        uint256 expectedAmountOut = (reserve1 * amountIn) / (reserve0 + amountIn); // Correct calculation

        vm.startPrank(user);
        uint256 initialBalanceB = tokenB.balanceOf(user); // Track initial TokenB balance

        address[] memory pairAdd = new address[](2);
        pairAdd[0] = address(tokenA); // TokenA is the input
        pairAdd[1] = address(tokenB); // TokenB is the output

        router.swapExactTokensForTokens(
            amountIn,
            expectedAmountOut, // Minimum expected output
            pairAdd, // Path for swap
            user // Recipient of TokenB
        );
        vm.stopPrank();

        // Verify the swap output
        uint256 finalBalanceB = tokenB.balanceOf(user);
        uint256 receivedTokenB = finalBalanceB - initialBalanceB;

        assert(receivedTokenB >= expectedAmountOut);
    }

    function testSwapExactTokensForTokens_1000TokenA_1000TokenB() public {
        // Step 1: Approve router to spend tokens
        vm.startPrank(user);
        tokenA.approve(address(router), type(uint256).max);
        tokenB.approve(address(router), type(uint256).max);
        vm.stopPrank();

        // Step 2: Add liquidity (1000 Token A and 1000 Token B)
        vm.startPrank(user);
        router.addLiquidity(
            address(tokenA),
            address(tokenB),
            1000 * 10 ** 18, // Add 1000 Token A
            1000 * 10 ** 18, // Add 1000 Token B
            1000 * 10 ** 18, // Minimum Token A
            1000 * 10 ** 18, // Minimum Token B
            user
        );
        vm.stopPrank();

        // Step 3: Check initial reserves
        (uint256 reserveA, uint256 reserveB,) = pair.getReserves();

        // Step 4: Perform the swap (100 Token A to Token B)
        uint256 amountIn = 100 * 10 ** 18; // Swap 100 Token A
        uint256 expectedAmountOut = (reserveB * amountIn) / (reserveA + amountIn); // Expected amount out based on the reserves

        vm.startPrank(user);
        uint256 initialBalanceB = tokenB.balanceOf(user); // Track initial TokenB balance

        address[] memory path = new address[](2);
        path[0] = address(tokenA); // Token A is the input
        path[1] = address(tokenB); // Token B is the output

        // Perform the swap
        router.swapExactTokensForTokens(
            amountIn,
            expectedAmountOut, // Minimum expected output
            path, // Path for swap
            user // Recipient of Token B
        );
        vm.stopPrank();

        // Step 5: Verify the swap output
        uint256 finalBalanceB = tokenB.balanceOf(user);
        uint256 receivedTokenB = finalBalanceB - initialBalanceB;

        // Step 6: Assert that the received TokenB is close to expectedAmountOut (tolerance can be added for precision)
        assert(receivedTokenB >= expectedAmountOut);
    }

    function testFaildRemoveLiquidity() public {
        // Step 1: Approve router to spend tokens
        vm.startPrank(user);
        tokenA.approve(address(router), type(uint256).max);
        tokenB.approve(address(router), type(uint256).max);
        vm.stopPrank();

        // Step 2: Add liquidity (1000 Token A and 1000 Token B)
        vm.startPrank(user);
        router.addLiquidity(
            address(tokenA),
            address(tokenB),
            1000 * 10 ** 18, // Add 1000 Token A
            1000 * 10 ** 18, // Add 1000 Token B
            1000 * 10 ** 18, // Minimum Token A
            1000 * 10 ** 18, // Minimum Token B
            user
        );
        vm.stopPrank();

        // Ensure liquidity was added correctly
        uint256 initialTotalSupply = pair.totalSupply();
        require(initialTotalSupply > 0, "Initial liquidity not added correctly");

        // Get initial balances of user
        uint256 initialBalanceA = tokenA.balanceOf(user);
        uint256 initialBalanceB = tokenB.balanceOf(user);

        // Get the liquidity the user has
        uint256 userLiquidity = pair.balanceOf(user);
        require(userLiquidity > 0, "User has no LP tokens");

        // Get half of the liquidity for removal
        uint256 liquidityToRemove = userLiquidity / 2;
        require(liquidityToRemove > 0, "Not enough liquidity to remove");

        // Log or assert the values to debug
        console.log("User liquidity:", userLiquidity);
        console.log("Liquidity to remove:", liquidityToRemove);

        // Log pair state before removal
        uint256 pairBalanceA = tokenA.balanceOf(address(pair));
        uint256 pairBalanceB = tokenB.balanceOf(address(pair));
        uint256 pairTotalSupply = pair.totalSupply();
        console.log("Pair balance of Token A:", pairBalanceA);
        console.log("Pair balance of Token B:", pairBalanceB);
        console.log("Pair total supply:", pairTotalSupply);

        // Check feasibility of removal (ensure no underflow or overflows)
        uint256 maxAmountA = (pairBalanceA * liquidityToRemove) / pairTotalSupply;
        uint256 maxAmountB = (pairBalanceB * liquidityToRemove) / pairTotalSupply;

        console.log("Max Amount Token A to remove:", maxAmountA);
        console.log("Max Amount Token B to remove:", maxAmountB);

        require(maxAmountA <= pairBalanceA && maxAmountB <= pairBalanceB, "Not enough liquidity in the pair");

        // Approve router to remove liquidity
        pair.approve(address(router), liquidityToRemove);

        vm.startPrank(user);

        // Remove liquidity
        (uint256 amountA, uint256 amountB) =
            router.removeLiquidity(address(tokenA), address(tokenB), liquidityToRemove, 1, 1, user);

        vm.stopPrank();

        // Get final balances of user
        uint256 finalBalanceA = tokenA.balanceOf(user);
        uint256 finalBalanceB = tokenB.balanceOf(user);

        // Ensure no underflow occurred when calculating received amounts
        uint256 receivedAmountA = finalBalanceA >= initialBalanceA ? finalBalanceA - initialBalanceA : 0;
        uint256 receivedAmountB = finalBalanceB >= initialBalanceB ? finalBalanceB - initialBalanceB : 0;

        // Assert that the amounts received are correct
        assertEq(amountA, receivedAmountA);
        assertEq(amountB, receivedAmountB);

        // Ensure LP tokens were burned
        uint256 remainingLiquidity = pair.balanceOf(user);
        console.log("remainingLiquidity", remainingLiquidity, liquidityToRemove);
        // assertEq(remainingLiquidity, userLiquidity - liquidityToRemove);

        // Log final pair state
        uint256 finalPairBalanceA = tokenA.balanceOf(address(pair));
        uint256 finalPairBalanceB = tokenB.balanceOf(address(pair));
        uint256 finalPairTotalSupply = pair.totalSupply();
        console.log("Final Pair balance of Token A:", finalPairBalanceA);
        console.log("Final Pair balance of Token B:", finalPairBalanceB);
        console.log("Final Pair total supply:", finalPairTotalSupply);
    }

    function testFailedRemoveLiquidityInsufficientLiquidity() public {
        uint256 liquidity = pair.totalSupply() + 1; // Attempt to remove more liquidity than available
        pair.approve(address(router), liquidity);

        vm.expectRevert("Router: INSUFFICIENT_LIQUIDITY_BURNED");
        router.removeLiquidity(address(tokenA), address(tokenB), liquidity, 1, 1, user);
    }

    function testFailedRemoveLiquidityWithSlippage() public {
        uint256 liquidity = pair.totalSupply(); // Remove all liquidity
        pair.approve(address(router), liquidity);

        // Try removing liquidity with more slippage tolerance
        vm.expectRevert("Router: INSUFFICIENT_A_AMOUNT");
        router.removeLiquidity(address(tokenA), address(tokenB), liquidity, 2000 ether, 2000 ether, user);
    }
}
